import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { inventory } from '../../data/mockData.js'

export default function PharmacistInventory() {
  const [filter, setFilter] = useState('All Stock')
  const [search, setSearch] = useState('')

  const filtered = inventory.filter(item => {
    const matchFilter = filter === 'All Stock' || (filter === 'Low Stock' && (item.status === 'LOW' || item.status === 'WATCH'))
    const matchSearch = item.medication.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Inventory</h1>
        <button className="btn-primary text-sm">+ Add Stock</button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-6">
        <input
          className="input flex-1 max-w-md"
          placeholder="Search medication..."
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
                  <td className="px-4 py-3.5 font-medium text-gray-900">{item.medication}</td>
                  <td className="px-4 py-3.5 text-gray-600">{item.strength}</td>
                  <td className={`px-4 py-3.5 font-semibold ${item.status === 'LOW' ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.inStock} packs
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{item.threshold} packs</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="text-brand-700 font-semibold hover:text-brand-800">Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-400 mt-4">Showing {filtered.length} of {inventory.length} medications</p>
    </Layout>
  )
}
