import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getMyDoctorAppointments } from '../../services/api.js'

const TABS = ['All', 'Today', 'Upcoming', 'Completed']

function isoDay(iso) {
  return iso ? iso.split('T')[0] : ''
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export default function DoctorAppointments() {
  const [tab, setTab]                   = useState('All')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    getMyDoctorAppointments()
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const filtered = appointments.filter(a => {
    if (tab === 'Today')     return isoDay(a.date) === today
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

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading appointments…</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-gray-400 text-sm">No appointments found.</div>
          )}
          {filtered.map(a => (
            <div key={a.id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {a.patient.name.split(' ').map(s => s[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{a.patient.name}</p>
                <p className="text-sm text-gray-500">
                  {fmtDate(a.date)} · {a.start_time} · {a.reason || 'General consultation'}
                </p>
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
      )}
    </Layout>
  )
}
