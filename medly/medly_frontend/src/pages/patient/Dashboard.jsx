import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getMyAppointments, getMyPrescriptions } from '../../services/api.js'

function fmtDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMyAppointments(), getMyPrescriptions()])
      .then(([appts, rxs]) => {
        setAppointments(appts)
        setPrescriptions(rxs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const upcoming = appointments.filter(a => ['CONFIRMED', 'SCHEDULED'].includes(a.status))
  const activeRx = prescriptions.filter(p => p.status === 'PENDING')
  const recentRx = prescriptions.slice(0, 2)

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title">Welcome back, {firstName}</h1>
        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
          {user?.initials}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Upcoming</p>
          <p className="text-4xl font-bold text-brand-700">{loading ? '—' : upcoming.length}</p>
          <p className="text-sm text-gray-500 mt-1">Appointments scheduled</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Prescriptions</p>
          <p className="text-4xl font-bold text-brand-700">{loading ? '—' : activeRx.length}</p>
          <p className="text-sm text-gray-500 mt-1">Active prescriptions</p>
        </div>
        <div className="card p-5 flex flex-col justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Action</p>
          <Link to="/patient/book-appointment" className="btn-primary text-center text-sm">
            + Book New Appointment
          </Link>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
        <div className="card divide-y divide-gray-100">
          {loading && (
            <div className="p-6 text-center text-gray-400 text-sm">Loading…</div>
          )}
          {!loading && upcoming.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm">No upcoming appointments.</div>
          )}
          {!loading && upcoming.slice(0, 3).map(appt => (
            <div key={appt.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                {appt.doctor.name.split(' ').filter(w => w.length > 1).map(w => w[0]).slice(1).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {appt.doctor.name} – {appt.doctor.specialisation}
                </p>
                <p className="text-sm text-gray-500">
                  {fmtDate(appt.date)}, {appt.start_time}
                  {appt.reason ? ` – ${appt.reason}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={appt.status} />
                <Link to="/patient/appointments" className="text-sm font-medium text-brand-700 hover:text-brand-800">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent prescriptions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Prescriptions</h2>
        {loading ? (
          <div className="card p-6 text-center text-gray-400 text-sm">Loading…</div>
        ) : recentRx.length === 0 ? (
          <div className="card p-6 text-center text-gray-400 text-sm">No prescriptions yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {recentRx.map(rx => (
              <div key={rx.id} className="card p-4">
                <p className="text-sm font-semibold text-gray-900">{rx.medication_name} {rx.dosage}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Issued {new Date(rx.prescribed_date).toLocaleDateString('en-GB')} ·{' '}
                  {rx.status === 'DISPENSED' ? 'Collected' : rx.status === 'PENDING' ? 'Pending' : rx.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
