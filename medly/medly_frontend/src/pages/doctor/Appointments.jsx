import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { appointments } from '../../data/mockData.js'

const TABS = ['All', 'Today', 'Upcoming', 'Completed']

const doctorAppts = appointments.filter(a => a.doctorId === 'D001')

export default function DoctorAppointments() {
  const [tab, setTab] = useState('All')

  const filtered = doctorAppts.filter(a => {
    if (tab === 'Today')     return a.date === '10 Mar 2026'
    if (tab === 'Upcoming')  return ['CONFIRMED', 'SCHEDULED'].includes(a.status)
    if (tab === 'Completed') return a.status === 'COMPLETED'
    return true
  })

  return (
    <Layout>
      <h1 className="page-title mb-6">Appointments</h1>

      <div className="flex gap-1 mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-brand-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-gray-400 text-sm">No appointments found.</div>
        )}
        {filtered.map(a => (
          <div key={a.id} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {a.patientName.split(' ').map(s => s[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{a.patientName}</p>
              <p className="text-sm text-gray-500">{a.date} · {a.time} · {a.reason}</p>
              <p className="text-xs text-gray-400">{a.location}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <StatusBadge status={a.status} />
              <Link
                to={`/doctor/appointments/${a.id}`}
                className="text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
