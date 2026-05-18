import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getAppointment, updateApptStatus, createPrescription } from '../../services/api.js'

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function fmtDob(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const age = Math.floor((Date.now() - d) / (365.25 * 24 * 3600 * 1000))
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })} (${age} yrs)`
}

export default function AppointmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [appt, setAppt]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [notes, setNotes]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [completing, setCompleting] = useState(false)

  const [rxOpen, setRxOpen]   = useState(false)
  const [rxForm, setRxForm]   = useState({ medication_name: '', dosage: '', instructions: '' })
  const [rxSaving, setRxSaving] = useState(false)
  const [rxError, setRxError]   = useState('')

  useEffect(() => {
    getAppointment(id)
      .then(data => { setAppt(data); setNotes(data.notes ?? '') })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleSaveNotes = async () => {
    setSaving(true); setSaved(false)
    try {
      await updateApptStatus(id, appt.status, notes)
      setSaved(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    if (!window.confirm('Mark this appointment as completed?')) return
    setCompleting(true)
    try {
      await updateApptStatus(id, 'COMPLETED', notes)
      setAppt(a => ({ ...a, status: 'COMPLETED' }))
    } catch (err) {
      alert(err.message)
    } finally {
      setCompleting(false)
    }
  }

  const handleIssueRx = async () => {
    if (!rxForm.medication_name || !rxForm.dosage || !rxForm.instructions) {
      setRxError('All fields are required.'); return
    }
    setRxSaving(true); setRxError('')
    try {
      const newRx = await createPrescription({ appointment_id: id, ...rxForm })
      setAppt(a => ({ ...a, prescriptions: [...a.prescriptions, { id: newRx.prescription_id, ...rxForm, status: 'PENDING' }] }))
      setRxForm({ medication_name: '', dosage: '', instructions: '' })
      setRxOpen(false)
    } catch (err) {
      setRxError(err.message)
    } finally {
      setRxSaving(false)
    }
  }

  if (loading) return <Layout><div className="p-8 text-center text-gray-400">Loading…</div></Layout>
  if (notFound || !appt) {
    return (
      <Layout>
        <p className="text-gray-500">Appointment not found.</p>
        <Link to="/doctor/appointments" className="text-brand-700 text-sm mt-2 block">← Back to appointments</Link>
      </Layout>
    )
  }

  const canComplete = !['COMPLETED', 'CANCELLED'].includes(appt.status)

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/doctor/appointments" className="text-sm text-brand-700 hover:text-brand-800">← Back to schedule</Link>
        <StatusBadge status={appt.status} />
      </div>
      <h1 className="page-title mb-6">Appointment – {appt.patient.name}</h1>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Patient info */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex gap-4 items-start mb-5">
            <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 text-base font-bold flex items-center justify-center flex-shrink-0">
              {appt.patient.name.split(' ').map(s => s[0]).join('')}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">{appt.patient.name}</p>
              <p className="text-sm text-gray-500">NHS: {appt.patient.nhs_number}</p>
              <p className="text-sm text-gray-500">DOB: {fmtDob(appt.patient.date_of_birth)}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Appointment</p>
            <p className="text-sm font-medium text-gray-900">{fmtDate(appt.date)}</p>
            <p className="text-sm text-gray-500">{appt.start_time} – {appt.end_time} · {appt.reason || 'General consultation'}</p>
          </div>
        </div>

        {/* Prescriptions on this appointment */}
        <div className="card p-6">
          <p className="text-base font-semibold text-gray-900 mb-4">Prescriptions</p>
          {appt.prescriptions.length === 0 ? (
            <p className="text-sm text-gray-400">None issued yet.</p>
          ) : (
            <div className="space-y-3">
              {appt.prescriptions.map(rx => (
                <div key={rx.id} className="border-b border-gray-100 pb-2 last:border-0">
                  <p className="text-sm font-medium text-gray-900">{rx.medication_name} {rx.dosage}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{rx.instructions}</p>
                  <StatusBadge status={rx.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Consultation notes */}
      <div className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Consultation Notes</h2>
        <textarea
          className="input resize-none h-28"
          placeholder="Enter consultation notes…"
          value={notes}
          onChange={e => { setNotes(e.target.value); setSaved(false) }}
        />
        {saved && <p className="text-sm text-green-600 mt-2">Notes saved.</p>}
      </div>

      {/* Issue prescription form */}
      {rxOpen && (
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Issue Prescription</h2>
          {rxError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">{rxError}</div>
          )}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Medication Name</label>
              <input
                className="input"
                placeholder="e.g. Amoxicillin"
                value={rxForm.medication_name}
                onChange={e => setRxForm(f => ({ ...f, medication_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dosage</label>
              <input
                className="input"
                placeholder="e.g. 500mg twice daily"
                value={rxForm.dosage}
                onChange={e => setRxForm(f => ({ ...f, dosage: e.target.value }))}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Instructions</label>
            <textarea
              className="input resize-none h-20"
              placeholder="e.g. Take with food for 7 days"
              value={rxForm.instructions}
              onChange={e => setRxForm(f => ({ ...f, instructions: e.target.value }))}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleIssueRx} disabled={rxSaving} className="btn-primary disabled:opacity-60">
              {rxSaving ? 'Saving…' : 'Issue Prescription'}
            </button>
            <button onClick={() => { setRxOpen(false); setRxError('') }} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {!rxOpen && (
          <button onClick={() => setRxOpen(true)} className="btn-primary">+ Issue Prescription</button>
        )}
        <button onClick={handleSaveNotes} disabled={saving} className="btn-outline disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Notes'}
        </button>
        {canComplete && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm disabled:opacity-60"
          >
            {completing ? 'Updating…' : 'Mark Complete'}
          </button>
        )}
      </div>
    </Layout>
  )
}
