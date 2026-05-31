import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getMyAppointments, cancelAppointment } from '../../services/api.js'

const TABS = ['Upcoming', 'Past', 'Cancelled']

function fmtDate(iso) {
  const d = new Date(iso)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return { mon: months[d.getUTCMonth()], day: String(d.getUTCDate()).padStart(2, '0') }
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [tab, setTab]                   = useState('Upcoming')
  const [cancelling, setCancelling]     = useState(null)

  useEffect(() => {
    getMyAppointments()
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    setCancelling(id)
    try {
      await cancelAppointment(id)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a))
    } catch (err) {
      alert(err.message)
    } finally {
      setCancelling(null)
    }
  }

  const filtered = appointments.filter(a => {
    if (tab === 'Upcoming')  return ['CONFIRMED', 'SCHEDULED'].includes(a.status)
    if (tab === 'Past')      return a.status === 'COMPLETED'
    if (tab === 'Cancelled') return a.status === 'CANCELLED'
    return true
  })

  return (
    <Layout>
      <h1 className="page-title mb-6">My Appointments</h1>

      <div className="flex gap-1 mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-brand-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading appointments…</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-gray-400 text-sm">No {tab.toLowerCase()} appointments.</div>
          )}
          {filtered.map(appt => {
            const { mon, day } = fmtDate(appt.date)
            return (
              <div key={appt.id} className="card p-4 flex gap-4">
                {/* Date badge */}
                <div className="w-16 flex-shrink-0 rounded-lg bg-brand-50 flex flex-col items-center justify-center py-2 text-brand-700">
                  <p className="text-xs font-semibold uppercase">{mon}</p>
                  <p className="text-xl font-bold leading-none">{day}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {appt.doctor.name} – {appt.doctor.specialisation}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {appt.start_time} – {appt.end_time} · {appt.reason}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={appt.status} />
                  </div>
                </div>

                {tab === 'Upcoming' && (
                  <div className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => handleCancel(appt.id)}
                      disabled={cancelling === appt.id}
                      className="btn-danger text-xs px-3 py-1.5 disabled:opacity-60"
                    >
                      {cancelling === appt.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-sm text-gray-400 mt-6">
          Showing {filtered.length} {tab.toLowerCase()} appointment{filtered.length !== 1 ? 's' : ''}
        </p>
      )}
    </Layout>
  )
}
