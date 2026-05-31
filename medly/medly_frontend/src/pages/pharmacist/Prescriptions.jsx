import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getPharmacistQueue, dispensePrescription } from '../../services/api.js'

const TABS = ['All', 'Pending', 'Dispensed']

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PharmacistPrescriptions() {
  const [tab, setTab]                     = useState('Pending')
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading]             = useState(true)
  const [dispensing, setDispensing]       = useState(null)

  useEffect(() => {
    getPharmacistQueue()
      .then(setPrescriptions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = prescriptions.filter(p => {
    if (tab === 'Pending')   return p.status === 'PENDING'
    if (tab === 'Dispensed') return p.status === 'DISPENSED'
    return true
  })

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
      <h1 className="page-title mb-6">Prescription Queue</h1>

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
            {t === 'Pending' && !loading && (
              <span className="ml-2 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {prescriptions.filter(p => p.status === 'PENDING').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading prescriptions…</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-gray-400 text-sm">No prescriptions in this category.</div>
          )}
          {filtered.map(rx => (
            <div key={rx.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-900">{rx.patient.name}</p>
                    <StatusBadge status={rx.status} />
                  </div>
                  <p className="text-sm text-gray-600">
                    {rx.medication_name} {rx.dosage}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{rx.instructions}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    NHS: {rx.patient.nhs_number} · Prescribed by {rx.doctor} · {fmtDate(rx.prescribed_date)}
                  </p>
                </div>
                {rx.status === 'PENDING' ? (
                  <button
                    onClick={() => handleDispense(rx.id)}
                    disabled={dispensing === rx.id}
                    className="btn-primary text-xs px-3 py-1.5 flex-shrink-0 disabled:opacity-60"
                  >
                    {dispensing === rx.id ? 'Processing…' : 'Dispense'}
                  </button>
                ) : (
                  <span className="text-xs text-green-600 font-medium flex-shrink-0 mt-1">✓ Dispensed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <p className="text-sm text-gray-400 mt-6">
          Showing {filtered.length} prescription{filtered.length !== 1 ? 's' : ''}
        </p>
      )}
    </Layout>
  )
}
