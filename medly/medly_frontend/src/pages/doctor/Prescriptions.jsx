import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getDoctorPrescriptions } from '../../services/api.js'

const TABS = ['All', 'Pending', 'Dispensed']

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DoctorPrescriptions() {
  const [tab, setTab]               = useState('All')
  const [search, setSearch]         = useState('')
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)

  useEffect(() => {
    getDoctorPrescriptions()
      .then(data => { setPrescriptions(data); setSelected(data[0] ?? null) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = prescriptions.filter(p => {
    const matchTab =
      tab === 'All' ||
      (tab === 'Pending'   && p.status === 'PENDING') ||
      (tab === 'Dispensed' && p.status === 'DISPENSED')
    const q = search.toLowerCase()
    const matchSearch = p.patient.toLowerCase().includes(q) || p.medication_name.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  return (
    <Layout>
      <h1 className="page-title mb-6">Prescription Management</h1>

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
          placeholder="Search by patient or medication…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading prescriptions…</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* List */}
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
                  <p className="text-sm font-semibold text-gray-900">{p.patient}</p>
                  <p className="text-xs text-gray-500">{p.medication_name} {p.dosage}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          {selected && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="font-bold text-gray-900 text-base">{selected.medication_name}</p>
                <StatusBadge status={selected.status} />
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Patient</p>
                  <p className="font-semibold text-gray-900">{selected.patient}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Medication</p>
                  <p className="font-semibold text-gray-900">{selected.medication_name} – {selected.dosage}</p>
                  <p className="text-gray-600 mt-0.5">{selected.instructions}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Prescribed</p>
                  <p className="text-gray-700">{fmtDate(selected.prescribed_date)}</p>
                </div>
              </div>
            </div>
          )}

          {!selected && !loading && prescriptions.length === 0 && (
            <div className="card p-6 flex items-center justify-center text-gray-400 text-sm">
              No prescriptions issued yet.
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
