import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { patients } from '../../data/mockData.js'

export default function PatientRecords() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <h1 className="page-title mb-6">Patient Records</h1>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <input
          className="input flex-1 max-w-md"
          placeholder="Search by name or patient ID..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <button className="btn-primary">Search</button>
      </div>

      {/* GDPR notice */}
      <div className="bg-brand-50 border border-brand-100 rounded-lg px-4 py-3 text-sm text-brand-800 mb-5">
        🔒 Access logged for GDPR audit. Only patients you treat are shown.
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Patient ID', 'Name', 'DOB', 'Last Visit', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No patients found.</td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-600">{p.id}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3.5 text-gray-600">{p.dob}</td>
                  <td className="px-4 py-3.5 text-gray-600">{p.lastVisit}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={p.status === 'Active' ? 'ACTIVE' : p.status === 'New' ? 'NEW' : 'INACTIVE'} />
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="text-brand-700 font-semibold hover:text-brand-800">Open</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-400">Showing 1-{filtered.length} of {filtered.length} patients</p>
          <div className="flex gap-1">
            {[1, 2].map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded border text-sm font-medium transition-colors ${
                  page === n
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            ))}
            <button className="w-8 h-8 rounded border border-gray-200 text-sm text-gray-400 hover:bg-gray-50">›</button>
          </div>
        </div>
      )}
    </Layout>
  )
}
