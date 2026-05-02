import Layout from '../../components/Layout.jsx'
import { weeklyChartData } from '../../data/mockData.js'

const maxCount = Math.max(...weeklyChartData.map(d => d.count))

export default function AdminDashboard() {
  return (
    <Layout>
      <h1 className="page-title mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'PATIENTS',     value: '1,247', sub: '+24 this week',  color: 'text-brand-700' },
          { label: 'DOCTORS',      value: '38',    sub: '+2 this month',  color: 'text-brand-700' },
          { label: 'PHARMACISTS',  value: '12',    sub: 'No change',      color: 'text-brand-700' },
          { label: 'UPTIME',       value: '99.9%', sub: '30 days',        color: 'text-green-600' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Appointments This Week (Mon–Sun)</h2>
          <div className="flex items-end gap-2 h-40">
            {weeklyChartData.map(({ day, count }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-brand-700 transition-all"
                  style={{ height: `${(count / maxCount) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent audit events */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Audit Events</h2>
          <div className="space-y-3 divide-y divide-gray-50">
            {[
              { time: '2 min ago',  text: 'Dr. Patel viewed P2773' },
              { time: '15 min ago', text: 'New patient registered' },
              { time: '1 hr ago',   text: `Login: pharmacist@clinic` },
              { time: '3 hr ago',   text: 'Unknown login attempt failed' },
            ].map(({ time, text }) => (
              <div key={time} className="pt-3 first:pt-0">
                <p className="text-xs text-gray-400">{time}</p>
                <p className="text-sm text-gray-700 mt-0.5">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System status */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">System Status</h2>
        <div className="space-y-3">
          <div className="rounded-lg bg-green-50 border border-green-200 px-5 py-3.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <p className="text-sm font-semibold text-green-800">All systems operational</p>
            </div>
            <p className="text-xs text-green-600">Database: OK · API: OK · Auth: OK · Notifications: OK</p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-5 py-3.5">
            <p className="text-sm font-semibold text-blue-800 mb-0.5">🔒 GDPR Compliance Status</p>
            <p className="text-xs text-blue-600">All audit logs current. 0 data subject requests pending. Last review: 1 Mar 2026</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
