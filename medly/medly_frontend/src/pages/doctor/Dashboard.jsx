import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getMyDoctorAppointments } from '../../services/api.js'

function isoDay(iso) {
  return iso ? iso.split('T')[0] : ''
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyDoctorAppointments()
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const now = new Date()
  const dow = now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const todayAppts   = appointments.filter(a => isoDay(a.date) === today && a.status !== 'CANCELLED')
  const weekAppts    = appointments.filter(a => { const d = new Date(a.date); return d >= weekStart && d <= weekEnd && a.status !== 'CANCELLED' })
  const pendingAppts = appointments.filter(a => a.status === 'SCHEDULED')
  const todayUpcoming = todayAppts.filter(a => ['CONFIRMED', 'SCHEDULED'].includes(a.status))

  const todayLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="page-title">Good morning, {user?.name ?? 'Doctor'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'TODAY',     value: loading ? '—' : todayAppts.length,   sub: 'appointments',  color: 'text-brand-700' },
          { label: 'THIS WEEK', value: loading ? '—' : weekAppts.length,    sub: 'appointments',  color: 'text-brand-700' },
          { label: 'PENDING',   value: loading ? '—' : pendingAppts.length, sub: 'requests',      color: 'text-yellow-600' },
          { label: 'TOTAL',     value: loading ? '—' : appointments.length, sub: 'all time',      color: 'text-brand-700' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule – {todayLabel}</h2>
        <div className="card divide-y divide-gray-100">
          {loading && <div className="p-6 text-center text-gray-400 text-sm">Loading…</div>}
          {!loading && todayUpcoming.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm">No appointments scheduled for today.</div>
          )}
          {!loading && todayUpcoming.map((a, idx) => (
            <div key={a.id} className="flex items-center gap-4 p-4">
              <div className="w-16 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-700 text-sm font-semibold flex-shrink-0">
                {a.start_time}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {a.patient.name} – {a.reason || 'General consultation'}
                </p>
                <p className="text-xs text-gray-500">NHS: {a.patient.nhs_number}</p>
              </div>
              <Link
                to={`/doctor/appointments/${a.id}`}
                className={idx === 0 ? 'btn-primary text-sm' : 'btn-outline text-sm'}
              >
                {idx === 0 ? 'Start' : 'View'}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {!loading && pendingAppts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Alerts</h2>
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-5 py-3.5 text-sm text-yellow-800">
            ⚠ {pendingAppts.length} appointment{pendingAppts.length !== 1 ? 's' : ''} awaiting confirmation
          </div>
        </div>
      )}
    </Layout>
  )
}
