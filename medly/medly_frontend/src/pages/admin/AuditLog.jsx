import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import { auditLogs } from '../../data/mockData.js'

const EVENT_BADGE = {
  VIEW_RECORD:             'bg-blue-100 text-blue-700',
  LOGIN:                   'bg-green-100 text-green-700',
  CREATE_RECORD:           'bg-teal-100 text-teal-700',
  LOGIN_FAIL:              'bg-red-100 text-red-600',
  UPDATE_RECORD:           'bg-orange-100 text-orange-700',
  EXPORT_DATA:             'bg-yellow-100 text-yellow-700',
  CREATE_USER:             'bg-purple-100 text-purple-700',
  APPOINTMENT_CREATED:     'bg-teal-100 text-teal-700',
  PATIENT_DATA_VIEWED:     'bg-blue-100 text-blue-700',
  USER_DEACTIVATED:        'bg-gray-100 text-gray-600',
  PRESCRIPTION_CREATED:    'bg-teal-100 text-teal-700',
  PRESCRIPTION_DISPENSED:  'bg-green-100 text-green-700',
}

export default function AuditLog() {
  const [search, setSearch]     = useState('')
  const [eventFilter, setEvent] = useState('All event types')
  const [userFilter, setUser]   = useState('All users')

  const events = [...new Set(auditLogs.map(l => l.event))]
  const userList = [...new Set(auditLogs.map(l => l.user))]

  const filtered = auditLogs.filter(log => {
    const matchSearch = log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.event.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase())
    const matchEvent = eventFilter === 'All event types' || log.event === eventFilter
    const matchUser  = userFilter  === 'All users'       || log.user  === userFilter
    return matchSearch && matchEvent && matchUser
  })

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Audit Log</h1>
        <button className="btn-outline text-sm">Export CSV</button>
      </div>

      {/* GDPR notice */}
      <div className="bg-brand-50 border border-brand-100 rounded-lg px-4 py-3 text-sm text-brand-800 mb-5">
        🔒 Immutable audit trail required by UK GDPR Art. 30. Retained for 6 years.
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          className="input max-w-xs"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input max-w-[180px]"
          value={eventFilter}
          onChange={e => setEvent(e.target.value)}
        >
          <option>All event types</option>
          {events.map(e => <option key={e}>{e}</option>)}
        </select>
        <select
          className="input max-w-[160px]"
          value={userFilter}
          onChange={e => setUser(e.target.value)}
        >
          <option>All users</option>
          {userList.map(u => <option key={u}>{u}</option>)}
        </select>
        <select className="input max-w-[140px]">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>All time</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Timestamp', 'User', 'Event', 'Resource', 'IP Address', 'Status'].map(h => (
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
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{log.timestamp}</td>
                  <td className="px-4 py-3.5 text-gray-700 font-medium">{log.user}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${EVENT_BADGE[log.event] ?? 'bg-gray-100 text-gray-600'}`}>
                      {log.event}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{log.resource}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{log.ip}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold ${log.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-400 mt-4">
        Showing {filtered.length} of {auditLogs.length} events – Last 7 days
      </p>
    </Layout>
  )
}
