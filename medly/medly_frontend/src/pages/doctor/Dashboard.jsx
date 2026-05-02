import Layout from '../../components/Layout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { appointments } from '../../data/mockData.js'
import { Link } from 'react-router-dom'

const todayAppts = [
  { id: 'APT001', time: '09:00', patient: 'Sarah Mitchell',  reason: 'Annual checkup',             patientId: 'P2773', duration: '30 min', status: 'first' },
  { id: 'APT002', time: '10:30', patient: 'John Williams',   reason: 'Follow-up consultation',     patientId: 'P3401', duration: '20 min', status: '' },
  { id: 'APT003', time: '11:15', patient: 'Emma Davies',     reason: 'New patient consultation',   patientId: 'P4112', duration: '45 min', status: '' },
  { id: 'APT006', time: '14:00', patient: 'Robert Lee',      reason: 'Test results review',        patientId: 'P2890', duration: '15 min', status: '' },
]

export default function DoctorDashboard() {
  const { user } = useAuth()
  const todayStr = '10 March 2026'

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="page-title">Good morning, {user?.name ?? 'Dr. Patel'}</h1>
        <p className="text-gray-500 text-sm mt-1">{user?.hospital ?? 'Central Hospital, Leicester'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'TODAY',    value: '8',   sub: 'appointments', color: 'text-brand-700' },
          { label: 'THIS WEEK',value: '34',  sub: 'patients',     color: 'text-brand-700' },
          { label: 'PENDING',  value: '5',   sub: 'requests',     color: 'text-yellow-600' },
          { label: 'RATING',   value: '4.8', sub: '★ avg',        color: 'text-green-600' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Today's schedule */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule – {todayStr}</h2>
        <div className="card divide-y divide-gray-100">
          {todayAppts.map((a, idx) => (
            <div key={a.id} className="flex items-center gap-4 p-4">
              <div className="w-16 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-700 text-sm font-semibold flex-shrink-0">
                {a.time}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{a.patient} – {a.reason}</p>
                <p className="text-xs text-gray-500">Patient ID: {a.patientId} – {a.duration}</p>
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

      {/* Alert */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Alerts</h2>
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-5 py-3.5 text-sm text-yellow-800">
          ⚠ 3 patient record access requests pending your approval
        </div>
      </div>
    </Layout>
  )
}
