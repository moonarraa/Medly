import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getMyPrescriptions } from '../../services/api.js'

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading]             = useState(true)
  const [tab, setTab]                     = useState('Active')

  useEffect(() => {
    getMyPrescriptions()
      .then(setPrescriptions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const active  = prescriptions.filter(p => p.status === 'PENDING')
  const history = prescriptions.filter(p => ['DISPENSED', 'CANCELLED', 'EXPIRED'].includes(p.status))

  return (
    <Layout>
      <h1 className="page-title mb-6">My Prescriptions</h1>

      <div className="flex gap-1 mb-6">
        {['Active', 'History'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-brand-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading prescriptions…</div>
      ) : (
        <>
          {tab === 'Active' && (
            <div className="space-y-4">
              {active.length === 0 && (
                <div className="card p-8 text-center text-gray-400 text-sm">No active prescriptions.</div>
              )}
              {active.map(rx => (
                <div key={rx.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-semibold text-gray-900">{rx.medication_name} {rx.dosage}</h3>
                    <StatusBadge status={rx.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rx.instructions}</p>
                  <p className="text-xs text-gray-400">
                    Prescribed by {rx.doctor} · {fmtDate(rx.prescribed_date)}
                  </p>
                  {rx.pharmacist && (
                    <p className="text-xs text-gray-400 mt-0.5">Dispensed by {rx.pharmacist}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'History' && (
            <>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Past Prescriptions</h2>
              <div className="card divide-y divide-gray-100">
                {history.length === 0 && (
                  <div className="p-6 text-center text-gray-400 text-sm">No prescription history.</div>
                )}
                {history.map(rx => (
                  <div key={rx.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rx.medication_name} {rx.dosage}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fmtDate(rx.prescribed_date)} · {rx.doctor}
                      </p>
                    </div>
                    <StatusBadge status={rx.status} />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  )
}
