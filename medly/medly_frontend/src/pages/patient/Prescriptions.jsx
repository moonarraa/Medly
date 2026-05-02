import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { prescriptions } from '../../data/mockData.js'

const mine = prescriptions.filter(p => p.patientId === 'P2773')
const active = mine.filter(p => ['READY', 'PENDING'].includes(p.status))
const history = mine.filter(p => p.status === 'DISPENSED')

export default function PatientPrescriptions() {
  const [tab, setTab] = useState('Active')

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

      {tab === 'Active' && (
        <div className="space-y-4">
          {active.length === 0 && (
            <div className="card p-8 text-center text-gray-400 text-sm">No active prescriptions.</div>
          )}
          {active.map(rx => (
            <div key={rx.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-semibold text-gray-900">{rx.medication} {rx.dosage}</h3>
                <StatusBadge status={rx.status} />
              </div>
              <p className="text-sm text-gray-600 mb-2">{rx.instructions}</p>
              <p className="text-xs text-gray-400">
                Prescribed by {rx.prescribedBy} – {rx.prescribedDate}
              </p>
              <p className="text-xs text-gray-400">
                Pharmacy: {rx.pharmacy} – Reference: {rx.id}
              </p>
              <div className="mt-3">
                <button className="btn-outline text-xs px-3 py-1.5">View Details</button>
              </div>
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
                  <p className="text-sm font-medium text-gray-900">{rx.medication} {rx.dosage}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Collected {rx.prescribedDate} – {rx.prescribedBy}
                  </p>
                </div>
                <button className="text-sm font-medium text-brand-700 hover:text-brand-800">View</button>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  )
}
