import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { prescriptions } from '../../data/mockData.js'

const TABS = ['Pending', 'Ready', 'Dispensed', 'All']

export default function DoctorPrescriptions() {
  const [tab, setTab]         = useState('Pending')
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(prescriptions[0])

  const filtered = prescriptions.filter(p => {
    const matchTab = tab === 'All' ||
      (tab === 'Pending'   && p.status === 'PENDING') ||
      (tab === 'Ready'     && p.status === 'READY') ||
      (tab === 'Dispensed' && p.status === 'DISPENSED')
    const matchSearch = p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <Layout>
      <h1 className="page-title mb-6">Prescription Management</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <div className="flex gap-1">
          {TABS.map(t => (
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
        <input
          className="input ml-auto max-w-xs"
          placeholder="Search by patient name or RX ref..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Queue */}
        <div className="card p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Queue ({filtered.length})</p>
          <div className="space-y-1">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No prescriptions.</p>
            )}
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left rounded-lg px-3 py-3 transition-colors ${
                  selected?.id === p.id ? 'bg-brand-50 border border-brand-200' : 'hover:bg-gray-50'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">{p.patientName}</p>
                <p className="text-xs text-gray-500">{p.medication} {p.dosage} – {p.id}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="font-bold text-gray-900 text-base">{selected.id}</p>
              <StatusBadge status={selected.status} />
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Patient</p>
                <p className="font-semibold text-gray-900">{selected.patientName}</p>
                <p className="text-gray-500">ID: {selected.patientId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Prescriber</p>
                <p className="font-semibold text-gray-900">{selected.prescribedBy}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Medication</p>
                <p className="font-semibold text-gray-900">{selected.medication} {selected.dosage} – {selected.quantity}</p>
                <p className="text-gray-600 mt-0.5">{selected.instructions}</p>
              </div>
              {selected.allergies && selected.allergies !== 'None known' && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Allergies</p>
                  <p className="text-red-600 font-medium">⚠ {selected.allergies}</p>
                </div>
              )}
            </div>

            <button className="btn-primary w-full mt-6">Manage Prescription</button>
          </div>
        )}
      </div>
    </Layout>
  )
}
