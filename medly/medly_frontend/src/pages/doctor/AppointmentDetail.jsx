import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { appointments } from '../../data/mockData.js'

const visitHistory = [
  { date: '15 NOV', reason: 'Annual checkup – Dr. James Patel',            notes: 'All vitals normal. Recommended diet review. No prescription.' },
  { date: '22 AUG', reason: 'Sore throat – Dr. James Patel',               notes: 'Prescribed Amoxicillin 500mg, 7 days. Follow-up not required.' },
]

export default function AppointmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const appt = appointments.find(a => a.id === id)

  const [notes, setNotes] = useState(appt?.notes ?? '')
  const [saved, setSaved] = useState(false)

  if (!appt) {
    return (
      <Layout>
        <p className="text-gray-500">Appointment not found.</p>
        <Link to="/doctor/appointments" className="text-brand-700 text-sm mt-2 block">← Back to appointments</Link>
      </Layout>
    )
  }

  const handleSave = () => setSaved(true)
  const handleComplete = () => navigate('/doctor/appointments')

  return (
    <Layout>
      <h1 className="page-title mb-1">Appointment – {appt.patientName}</h1>
      <Link to="/doctor/appointments" className="text-sm text-brand-700 hover:text-brand-800 mb-6 inline-block">
        ← Back to schedule
      </Link>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Patient info */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex gap-4 items-start mb-5">
            <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 text-base font-bold flex items-center justify-center flex-shrink-0">
              {appt.patientName.split(' ').map(s => s[0]).join('')}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">{appt.patientName}</p>
              <p className="text-sm text-gray-500">
                Patient ID: {appt.patientId} · {appt.patientGender} · {appt.patientAge} years
              </p>
              {appt.allergies && appt.allergies !== 'None known' && (
                <p className="text-sm text-gray-500">Allergies: {appt.allergies}</p>
              )}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Appointment</p>
            <p className="text-sm font-medium text-gray-900">{appt.date}, {appt.time} – {appt.reason}</p>
            <p className="text-sm text-gray-500">Booked: {appt.bookedDate} · Duration: {appt.duration}</p>
          </div>
        </div>

        {/* Vitals */}
        <div className="card p-6">
          <p className="text-base font-semibold text-gray-900 mb-4">Vitals</p>
          {appt.vitals ? (
            <div className="space-y-3">
              {[
                { label: 'BLOOD PRESSURE', value: appt.vitals.bp },
                { label: 'HEART RATE',     value: appt.vitals.hr },
                { label: 'TEMPERATURE',    value: appt.vitals.temp },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
                  <p className="text-base font-semibold text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No vitals recorded yet.</p>
          )}
        </div>
      </div>

      {/* Consultation notes */}
      <div className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Consultation Notes</h2>
        <textarea
          className="input resize-none h-28"
          placeholder="Enter consultation notes..."
          value={notes}
          onChange={e => { setNotes(e.target.value); setSaved(false) }}
        />
        {saved && <p className="text-sm text-green-600 mt-2">Notes saved.</p>}
      </div>

      {/* Visit history */}
      <div className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Patient Visit History</h2>
        <div className="space-y-3">
          {visitHistory.map(v => (
            <div key={v.date} className="flex gap-4 items-start border-b border-gray-50 pb-3 last:border-0">
              <div className="bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-1.5 rounded flex-shrink-0">
                {v.date}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{v.reason}</p>
                <p className="text-xs text-gray-500 mt-0.5">{v.notes}</p>
              </div>
              <button className="text-sm font-medium text-brand-700 hover:text-brand-800 flex-shrink-0">Open</button>
            </div>
          ))}
          <button className="text-sm text-brand-700 hover:text-brand-800">
            + 4 earlier visits since registration (Jan 2024) · View all
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/doctor/prescriptions" className="btn-primary">+ Issue Prescription</Link>
        <button onClick={handleSave} className="btn-outline">Save Notes & Schedule Follow-up</button>
        <button
          onClick={handleComplete}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Mark Appointment Complete
        </button>
      </div>
    </Layout>
  )
}
