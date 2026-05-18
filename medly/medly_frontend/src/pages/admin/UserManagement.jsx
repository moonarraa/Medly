import { useState, useEffect, useCallback } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '../../services/api.js'

const ROLE_TABS = ['All', 'Patient', 'Doctor', 'Pharm.']

const ROLE_BADGE = {
  PATIENT:    'bg-blue-100 text-blue-700',
  DOCTOR:     'bg-yellow-100 text-yellow-700',
  PHARMACIST: 'bg-purple-100 text-purple-700',
  ADMIN:      'bg-gray-100 text-gray-700',
}

const TAB_ROLE = { 'Patient': 'PATIENT', 'Doctor': 'DOCTOR', 'Pharm.': 'PHARMACIST' }

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function UserManagement() {
  const [roleFilter, setRoleFilter] = useState('All')
  const [search, setSearch]         = useState('')
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [toggling, setToggling]     = useState(null)
  const [deleting, setDeleting]     = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = {}
    if (roleFilter !== 'All') params.role = TAB_ROLE[roleFilter]
    if (search.trim())        params.q    = search.trim()
    getAdminUsers(params)
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [roleFilter, search])

  useEffect(() => { load() }, [load])

  const handleToggleActive = async (id, currentlyActive) => {
    setToggling(id)
    try {
      await updateAdminUser(id, { is_active: !currentlyActive })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentlyActive } : u))
    } catch (err) {
      alert(err.message)
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Soft-delete ${name}? This is reversible via the database.`)) return
    setDeleting(id)
    try {
      await deleteAdminUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">User Management</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="input flex-1 max-w-sm"
          placeholder="Search by name or email…"
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

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading users…</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Name', 'Email', 'Role', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                        {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.is_active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{fmtDate(u.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          disabled={toggling === u.id}
                          className="text-brand-700 font-semibold hover:text-brand-800 text-sm disabled:opacity-50"
                        >
                          {toggling === u.id ? '…' : u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={deleting === u.id}
                          className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                        >
                          {deleting === u.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        <p className="text-sm text-gray-400 mt-4">Showing {users.length} user{users.length !== 1 ? 's' : ''}</p>
      )}
    </Layout>
  )
}
