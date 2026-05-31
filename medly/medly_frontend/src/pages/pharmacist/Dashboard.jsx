import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { getPharmacistQueue, dispensePrescription, getInventory } from '../../services/api.js'

function fmtDate(iso) {
  if (!iso) return ''
  const diff = Math.round((Date.now() - new Date(iso)) / 60000)
  if (diff < 60)  return `${diff} min ago`
  if (diff < 1440) return `${Math.round(diff / 60)} hr ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function PharmacistDashboard() {
  const [prescriptions, setPrescriptions] = useState([])
  const [alertItems, setAlertItems]       = useState([])
  const [loading, setLoading]             = useState(true)
  const [dispensing, setDispensing]       = useState(null)

  useEffect(() => {
    Promise.all([getPharmacistQueue(), getInventory()])
      .then(([rxs, inv]) => {
        setPrescriptions(rxs)
        setAlertItems(inv.filter(i => i.status === 'LOW' || i.status === 'WATCH'))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pending   = prescriptions.filter(p => p.status === 'PENDING')
  const dispensed = prescriptions.filter(p => p.status === 'DISPENSED')

  const handleDispense = async (id) => {
    setDispensing(id)
    try {
      await dispensePrescription(id)
      setPrescriptions(prev =>
        prev.map(p => p.id === id ? { ...p, status: 'DISPENSED' } : p)
      )
    } catch (err) {
      alert(err.message)
    } finally {
      setDispensing(null)
    }
  }

  return (
    <Layout>
      <h1 className="page-title mb-8">Pharmacist Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pending</p>
          <p className="text-4xl font-bold text-yellow-500">{loading ? '—' : pending.length}</p>
          <p className="text-sm text-gray-500 mt-1">Prescriptions to process</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Dispensed</p>
          <p className="text-4xl font-bold text-green-600">{loading ? '—' : dispensed.length}</p>
          <p className="text-sm text-gray-500 mt-1">Processed by you</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Total Queue</p>
          <p className="text-4xl font-bold text-brand-700">{loading ? '—' : prescriptions.length}</p>
          <p className="text-sm text-gray-500 mt-1">In the system</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Prescriptions Queue</h2>
          <Link to="/pharmacist/prescriptions" className="text-sm text-brand-700 hover:text-brand-800 font-medium">
            View all →
          </Link>
        </div>
        <div className="card divide-y divide-gray-100">
          {loading && <div className="p-6 text-center text-gray-400 text-sm">Loading…</div>}
          {!loading && pending.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm">No pending prescriptions.</div>
          )}
          {!loading && pending.slice(0, 3).map((rx, idx) => (
            <div key={rx.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {rx.patient.name} – {rx.medication_name} {rx.dosage}
                </p>
                <p className="text-xs text-gray-500">
                  {rx.doctor} · {fmtDate(rx.prescribed_date)}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDispense(rx.id)}
                  disabled={dispensing === rx.id}
                  className="btn-primary text-xs px-3 py-1.5 disabled:opacity-60"
                >
                  {dispensing === rx.id ? 'Processing…' : 'Dispense'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Stock Alerts</h2>
        {loading ? (
          <div className="h-14 bg-gray-100 animate-pulse rounded-lg" />
        ) : alertItems.length === 0 ? (
          <div className="rounded-lg bg-green-50 border border-green-200 px-5 py-3.5 text-sm text-green-700 font-medium">
            All stock levels are within safe thresholds.
          </div>
        ) : (
          <div className="card divide-y divide-gray-100">
            {alertItems.map(item => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className={`text-sm font-semibold ${item.status === 'LOW' ? 'text-red-700' : 'text-yellow-700'}`}>
                    {item.status === 'LOW' ? '⚠' : '!'} {item.medication_name} {item.strength}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.quantity_in_stock} {item.unit} remaining · Reorder threshold: {item.reorder_threshold}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  item.status === 'LOW'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
