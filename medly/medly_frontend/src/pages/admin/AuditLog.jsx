import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { getAuditLogs } from '../../services/api.js'

const ACTION_BADGE = {
  LOGIN:                  'bg-green-100 text-green-700',
  REGISTER:               'bg-teal-100 text-teal-700',
  BOOK_APPOINTMENT:       'bg-teal-100 text-teal-700',
  CANCEL_APPOINTMENT:     'bg-orange-100 text-orange-700',
  CREATE_PRESCRIPTION:    'bg-teal-100 text-teal-700',
  DISPENSE_PRESCRIPTION:  'bg-green-100 text-green-700',
  GRANT_CONSENT:          'bg-blue-100 text-blue-700',
  REVOKE_CONSENT:         'bg-orange-100 text-orange-700',
  UPDATE_PROFILE:         'bg-yellow-100 text-yellow-700',
  UPDATE_STOCK:           'bg-purple-100 text-purple-700',
  ADMIN_UPDATE_USER:      'bg-yellow-100 text-yellow-700',
  ADMIN_DELETE_USER:      'bg-red-100 text-red-600',
  APPOINTMENT_COMPLETED:  'bg-green-100 text-green-700',
  APPOINTMENT_CANCELLED:  'bg-red-100 text-red-600',
}

function fmtTs(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AuditLog() {
  const [logs, setLogs]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [actionFilter, setActionFilter] = useState('All')

  useEffect(() => {
    setLoading(true)
    getAuditLogs(page)
      .then(res => {
        setLogs(res.data)
        setTotal(res.total)
        setPages(res.pages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  const actions = [...new Set(logs.map(l => l.action))].sort()

  const filtered = logs.filter(log => {
    const q = search.toLowerCase()
    const matchSearch =
      log.user.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q) ||
      (log.details ?? '').toLowerCase().includes(q)
    const matchAction = actionFilter === 'All' || log.action === actionFilter
    return matchSearch && matchAction
  })

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Audit Log</h1>
        <span className="text-sm text-gray-400">{total} total events</span>
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-lg px-4 py-3 text-sm text-brand-800 mb-5">
        🔒 Immutable audit trail required by UK GDPR Art. 30. Retained for 6 years.
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          className="input max-w-xs"
          placeholder="Search user, action, entity…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input max-w-[200px]"
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
        >
          <option value="All">All actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading audit log…</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Timestamp', 'User', 'Action', 'Entity', 'Details', 'IP Address'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No audit events found.</td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">{fmtTs(log.timestamp)}</td>
                    <td className="px-4 py-3.5 text-gray-700 text-xs max-w-[160px] truncate">{log.user}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${ACTION_BADGE[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs">{log.entity_type}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs max-w-[180px] truncate">{log.details ?? '—'}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-400">{log.ip_address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-400">Page {page} of {pages} · {total} events</p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ‹ Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1.5 rounded border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      {!loading && pages <= 1 && (
        <p className="text-sm text-gray-400 mt-4">Showing {filtered.length} of {total} events</p>
      )}
    </Layout>
  )
}
