import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getInventory, updateStock } from '../../services/api.js'

const STATUS_BADGE = { LOW: 'LOW', WATCH: 'WATCH', OK: 'ACTIVE' }

export default function PharmacistInventory() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('All Stock')
  const [search, setSearch]     = useState('')
  const [editing, setEditing]   = useState(null)
  const [editQty, setEditQty]   = useState('')
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    getInventory()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(item => {
    const matchFilter =
      filter === 'All Stock' ||
      (filter === 'Low Stock' && (item.status === 'LOW' || item.status === 'WATCH'))
    const matchSearch = item.medication_name.toLowerCase().includes(search.toLowerCase()) ||
      item.strength.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const lowCount = items.filter(i => i.status === 'LOW' || i.status === 'WATCH').length

  const startEdit = (item) => { setEditing(item.id); setEditQty(String(item.quantity_in_stock)) }
  const cancelEdit = () => { setEditing(null); setEditQty('') }

  const handleSave = async (id) => {
    const qty = parseInt(editQty, 10)
    if (isNaN(qty) || qty < 0) { alert('Enter a valid quantity.'); return }
    setSaving(true)
    try {
      const updated = await updateStock(id, qty)
      setItems(prev => prev.map(i => i.id === id ? updated : i))
      setEditing(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Inventory</h1>
        {!loading && lowCount > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            {lowCount} item{lowCount !== 1 ? 's' : ''} need restocking
          </span>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        <input
          className="input flex-1 max-w-md"
          placeholder="Search medication…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          onClick={() => setFilter('All Stock')}
          className={`btn-outline text-sm ${filter === 'All Stock' ? 'bg-brand-50 border-brand-700 text-brand-700' : ''}`}
        >
          All Stock
        </button>
        <button
          onClick={() => setFilter('Low Stock')}
          className={`text-sm px-4 py-2.5 rounded-lg border font-medium transition-colors ${
            filter === 'Low Stock'
              ? 'bg-red-50 border-red-500 text-red-600'
              : 'border-red-400 text-red-500 hover:bg-red-50'
          }`}
        >
          Low Stock
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading inventory…</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Medication', 'Strength', 'In Stock', 'Threshold', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No items found.</td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-900">{item.medication_name}</td>
                    <td className="px-4 py-3.5 text-gray-600">{item.strength}</td>
                    <td className={`px-4 py-3.5 font-semibold ${item.status === 'LOW' ? 'text-red-600' : 'text-gray-900'}`}>
                      {editing === item.id ? (
                        <input
                          type="number"
                          min="0"
                          className="input w-20 py-1 text-sm"
                          value={editQty}
                          onChange={e => setEditQty(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        `${item.quantity_in_stock} ${item.unit}`
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{item.reorder_threshold} {item.unit}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={STATUS_BADGE[item.status]} />
                    </td>
                    <td className="px-4 py-3.5">
                      {editing === item.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(item.id)}
                            disabled={saving}
                            className="text-green-600 font-semibold hover:text-green-700 text-sm disabled:opacity-50"
                          >
                            {saving ? 'Saving…' : 'Save'}
                          </button>
                          <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 text-sm">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="text-brand-700 font-semibold hover:text-brand-800"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        <p className="text-sm text-gray-400 mt-4">
          Showing {filtered.length} of {items.length} medications
        </p>
      )}
    </Layout>
  )
}
