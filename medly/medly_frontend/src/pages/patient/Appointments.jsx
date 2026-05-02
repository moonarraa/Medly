import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { appointments } from '../../data/mockData.js'

const TABS = ['Upcoming', 'Past', 'Cancelled']

const myAppts = appointments.filter(a => a.patientId === 'P2773')

export default function PatientAppointments() {
  const [tab, setTab] = useState('Upcoming')

  const filtered = myAppts.filter(a => {
    if (tab === 'Upcoming')  return ['CONFIRMED', 'SCHEDULED'].includes(a.status)
    if (tab === 'Past')      return a.status === 'COMPLETED'
    if (tab === 'Cancelled') return a.status === 'CANCELLED'
    return true
  })

  return (
    <Layout>
      <h1 className="page-title mb-6">My Appointments</h1>

      {/* Tabs */}
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

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-gray-400 text-sm">No {tab.toLowerCase()} appointments.</div>
        )}
        {filtered.map(appt => {
          const [mon, day] = appt.date.split(' ')
          return (
            <div key={appt.id} className="card p-4 flex gap-4">
              {/* Date badge */}
              <div className="w-16 flex-shrink-0 rounded-lg bg-brand-50 flex flex-col items-center justify-center py-2 text-brand-700">
                <p className="text-xs font-semibold uppercase">{mon}</p>
                <p className="text-xl font-bold leading-none">{day}</p>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{appt.doctorName} – {appt.specialisation}</p>
                <p className="text-sm text-gray-500 mt-0.5">{appt.time} – {appt.endTime} – {appt.location}</p>
                <div className="mt-2">
                  <StatusBadge status={appt.status} />
                </div>
              </div>

              {tab === 'Upcoming' && (
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-shrink-0">
                  <button className="btn-outline text-xs px-3 py-1.5">Reschedule</button>
                  <button className="btn-danger text-xs px-3 py-1.5">Cancel</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length > 0 && (
        <p className="text-sm text-gray-400 mt-6">
          Showing {filtered.length} of {filtered.length} {tab.toLowerCase()} appointment{filtered.length !== 1 ? 's' : ''}
        </p>
      )}
    </Layout>
  )
}
