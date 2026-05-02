import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { users } from '../../data/mockData.js'

const ROLE_TABS = ['All', 'Patient', 'Doctor', 'Pharm.']

const ROLE_BADGE = {
  PATIENT:    'bg-blue-100 text-blue-700',
  DOCTOR:     'bg-yellow-100 text-yellow-700',
  PHARMACIST: 'bg-purple-100 text-purple-700',
  ADMIN:      'bg-gray-100 text-gray-700',
}

export default function UserManagement() {
  const [roleFilter, setRoleFilter] = useState('All')
  const [search, setSearch]         = useState('')
  const [localUsers, setLocalUsers] = useState(users)

  const filtered = localUsers.filter(u => {
    const matchRole = roleFilter === 'All' ||
      (roleFilter === 'Patient' && u.role === 'PATIENT') ||
      (roleFilter === 'Doctor'  && u.role === 'DOCTOR') ||
      (roleFilter === 'Pharm.'  && u.role === 'PHARMACIST')
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const toggleStatus = (id) => {
    setLocalUsers(us => us.map(u =>
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
    ))
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">User Management</h1>
        <button className="btn-primary text-sm">+ Add User</button>
      </div>

      {/* Search + role filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="input flex-1 max-w-sm"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1">
          {ROLE_TABS.map(t => (
            <button
              key={t}
              onClick={() => setRoleFilter(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                roleFilter === t
                  ? 'bg-brand-700 text-white border-brand-700'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Name', 'Email', 'Role', 'Status', 'Created', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users found.</td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {u.initials}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    <p>{u.email}</p>
                    {u.org && <p className="text-xs text-gray-400">{u.org}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                      {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={u.status === 'Active' ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">{u.created}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className="text-brand-700 font-semibold hover:text-brand-800 text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-400 mt-4">Showing {filtered.length} of {localUsers.length} users</p>
    </Layout>
  )
}
