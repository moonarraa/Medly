import { Link } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { appointments, prescriptions } from '../../data/mockData.js'

const myAppts = appointments.filter(a =>
  ['CONFIRMED', 'SCHEDULED'].includes(a.status) && a.patientId === 'P2773'
)
const myRx = prescriptions.filter(p => p.patientId === 'P2773' && ['READY', 'PENDING'].includes(p.status))
const recentRx = prescriptions.filter(p => p.patientId === 'P2773').slice(0, 2)

export default function PatientDashboard() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <Layout>
      {/* Page header */}
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
          <p className="text-4xl font-bold text-brand-700">{myAppts.length}</p>
          <p className="text-sm text-gray-500 mt-1">Appointments scheduled</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Prescriptions</p>
          <p className="text-4xl font-bold text-brand-700">{myRx.length}</p>
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
          {myAppts.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm">No upcoming appointments.</div>
          )}
          {myAppts.map(appt => (
            <div key={appt.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                {appt.doctorName.split(' ').filter(w => w.length > 1).map(w => w[0]).slice(1).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{appt.doctorName} – {appt.specialisation}</p>
                <p className="text-sm text-gray-500">{appt.date}, {appt.time} – {appt.location}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={appt.status} />
                <Link to="/patient/appointments" className="text-sm font-medium text-brand-700 hover:text-brand-800">View</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent prescriptions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Prescriptions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {recentRx.map(rx => (
            <div key={rx.id} className="card p-4">
              <p className="text-sm font-semibold text-gray-900">{rx.medication} {rx.dosage}</p>
              <p className="text-xs text-gray-500 mt-1">
                Issued {rx.prescribedDate} – {rx.status === 'READY' ? 'Pickup ready' : rx.status === 'DISPENSED' ? 'Collected' : 'Pending'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
