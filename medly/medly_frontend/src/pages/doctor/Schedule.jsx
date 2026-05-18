import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { getMyDoctorAvailability, createAvailability, deleteAvailability } from '../../services/api.js'

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const DAY_SHORT = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' }

const EMPTY_FORM = { day_of_week: 'MONDAY', start_time: '09:00', end_time: '10:00' }

export default function DoctorSchedule() {
  const [slots, setSlots]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    getMyDoctorAvailability()
      .then(setSlots)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const grouped = DAY_ORDER.reduce((acc, day) => {
    acc[day] = slots.filter(s => s.day_of_week === day)
    return acc
  }, {})

  const handleAdd = async () => {
    if (!form.start_time || !form.end_time) { setError('Start and end time are required.'); return }
    if (form.start_time >= form.end_time)   { setError('End time must be after start time.'); return }
    setSaving(true); setError('')
    try {
      const slot = await createAvailability(form)
      setSlots(s => [...s, slot])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this availability slot?')) return
    setDeleting(id)
    try {
      await deleteAvailability(id)
      setSlots(s => s.filter(slot => slot.id !== id))
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">My Availability</h1>
        <button onClick={() => { setShowForm(true); setError('') }} className="btn-primary text-sm">
          + Add Slot
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Set your recurring weekly availability. Patients can book appointments during these slots.
      </p>

      {/* Add slot form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">New Availability Slot</h2>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">{error}</div>
          )}
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
              <select
                className="input"
                value={form.day_of_week}
                onChange={e => setForm(f => ({ ...f, day_of_week: e.target.value }))}
              >
                {DAY_ORDER.map(d => <option key={d} value={d}>{DAY_SHORT[d]}day</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                className="input"
                value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                className="input"
                value={form.end_time}
                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving…' : 'Add Slot'}
            </button>
            <button onClick={() => { setShowForm(false); setError('') }} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading availability…</div>
      ) : (
        <div className="space-y-4">
          {DAY_ORDER.map(day => {
            const daySlots = grouped[day]
            if (daySlots.length === 0) return null
            return (
              <div key={day} className="card overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
                  <p className="text-sm font-semibold text-gray-700">{day.charAt(0) + day.slice(1).toLowerCase()}</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {daySlots.map(slot => (
                    <div key={slot.id} className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {slot.start_time} – {slot.end_time}
                        </span>
                        {!slot.is_available && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Unavailable</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        disabled={deleting === slot.id}
                        className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        {deleting === slot.id ? 'Removing…' : 'Remove'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {slots.length === 0 && (
            <div className="card p-8 text-center text-gray-400 text-sm">
              No availability set. Click "+ Add Slot" to get started.
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
