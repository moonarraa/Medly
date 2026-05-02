import Layout from '../../components/Layout.jsx'
import { prescriptions } from '../../data/mockData.js'
import { Link } from 'react-router-dom'

const pending   = prescriptions.filter(p => p.status === 'PENDING')
const ready     = prescriptions.filter(p => p.status === 'READY')
const dispensed = prescriptions.filter(p => p.status === 'DISPENSED')

export default function PharmacistDashboard() {
  return (
    <Layout>
      <h1 className="page-title mb-8">Pharmacist Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pending</p>
          <p className="text-4xl font-bold text-yellow-500">{pending.length}</p>
          <p className="text-sm text-gray-500 mt-1">Prescriptions to process</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Ready for Pickup</p>
          <p className="text-4xl font-bold text-green-600">{ready.length}</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting collection</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Dispensed Today</p>
          <p className="text-4xl font-bold text-brand-700">{dispensed.length + 21}</p>
          <p className="text-sm text-gray-500 mt-1">Total today</p>
        </div>
      </div>

      {/* Queue */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Prescriptions Queue</h2>
        <div className="card divide-y divide-gray-100">
          {pending.slice(0, 3).map((rx, idx) => (
            <div key={rx.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{rx.patientName} – {rx.medication} {rx.dosage}</p>
                <p className="text-xs text-gray-500">{rx.prescribedBy} – {rx.id} – {idx === 0 ? '10 min ago' : idx === 1 ? '15 min ago' : '22 min ago'}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-primary text-xs px-3 py-1.5">Process</button>
                <button className="btn-outline text-xs px-3 py-1.5">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock alert */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Stock Alerts</h2>
        <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-3.5 text-sm text-red-700">
          ⚠ Low stock: Paracetamol 500mg (12 packs remaining)
          <p className="text-xs text-red-500 mt-0.5">Reorder threshold: 20 packs</p>
        </div>
      </div>
    </Layout>
  )
}
