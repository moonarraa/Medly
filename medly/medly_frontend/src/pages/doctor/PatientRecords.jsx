import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { getMyPatients } from '../../services/api.js'

function fmtDob(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export default function PatientRecords() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    getMyPatients()
      .then(setPatients)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.nhs_number ?? '').includes(q) ||
      (p.email ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <Layout>
      <h1 className="page-title mb-6">Patient Records</h1>

      <div className="flex gap-3 mb-5">
        <input
          className="input flex-1 max-w-md"
          placeholder="Search by name, NHS number or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-lg px-4 py-3 text-sm text-brand-800 mb-5">
        🔒 Access logged for GDPR audit. Only patients you have treated are shown.
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading patient records…</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['NHS Number', 'Name', 'Date of Birth', 'Gender', 'Email'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No patients found.</td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600">{p.nhs_number ?? '—'}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3.5 text-gray-600">{fmtDob(p.date_of_birth)}</td>
                    <td className="px-4 py-3.5 text-gray-600 capitalize">{p.gender?.replace(/_/g, ' ').toLowerCase() ?? '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500">{p.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        <p className="text-sm text-gray-400 mt-4">
          Showing {filtered.length} of {patients.length} patient{patients.length !== 1 ? 's' : ''}
        </p>
      )}
    </Layout>
  )
}
