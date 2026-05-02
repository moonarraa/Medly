import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { prescriptions } from '../../data/mockData.js'

const STATUS_TABS = ['All', 'Pending', 'Ready', 'Dispensed']

export default function PharmacistPrescriptions() {
  const [tab, setTab]           = useState('Pending')
  const [dispensedSet, setDispensed] = useState(new Set())

  const filtered = prescriptions.filter(p => {
    if (tab === 'All')       return true
    if (tab === 'Pending')   return p.status === 'PENDING' && !dispensedSet.has(p.id)
    if (tab === 'Ready')     return p.status === 'READY'
    if (tab === 'Dispensed') return p.status === 'DISPENSED' || dispensedSet.has(p.id)
    return true
  })

  const handleDispense = (id) => {
    setDispensed(s => new Set([...s, id]))
  }

  return (
    <Layout>
      <h1 className="page-title mb-6">Prescription Queue</h1>

      <div className="flex gap-1 mb-6">
        {STATUS_TABS.map(t => (
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

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-gray-400 text-sm">No prescriptions in this category.</div>
        )}
        {filtered.map(rx => {
          const isDispensed = rx.status === 'DISPENSED' || dispensedSet.has(rx.id)
          return (
            <div key={rx.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-900">{rx.patientName}</p>
                    <StatusBadge status={isDispensed ? 'DISPENSED' : rx.status} />
                  </div>
                  <p className="text-sm text-gray-600">{rx.medication} {rx.dosage} – {rx.quantity}</p>
                  <p className="text-xs text-gray-500 mt-1">{rx.instructions}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {rx.id} · Prescribed by {rx.prescribedBy} · {rx.prescribedDate}
                  </p>
                  {rx.allergies && rx.allergies !== 'None known' && (
                    <p className="text-xs text-red-600 mt-1 font-medium">⚠ Allergy: {rx.allergies}</p>
                  )}
                </div>
                {!isDispensed && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDispense(rx.id)}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      Dispense
                    </button>
                    <button className="btn-outline text-xs px-3 py-1.5">View</button>
                  </div>
                )}
                {isDispensed && (
                  <span className="text-xs text-green-600 font-medium flex-shrink-0 mt-1">✓ Dispensed</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
