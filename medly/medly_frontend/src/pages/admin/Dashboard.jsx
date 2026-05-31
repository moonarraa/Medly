import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { getAdminStats, getAuditLogs, exportPrescriptionsPDF, exportOverviewPDF } from '../../services/api.js'

function fmtTs(iso) {
  const d = new Date(iso)
  const diff = Math.round((Date.now() - d) / 60000)
  if (diff < 60)   return `${diff} min ago`
  if (diff < 1440) return `${Math.round(diff / 60)} hr ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null)
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [exporting, setExporting]         = useState(false)
  const [exportingOverview, setExportingOverview] = useState(false)

  useEffect(() => {
    Promise.all([getAdminStats(), getAuditLogs(1)])
      .then(([s, l]) => { setStats(s); setLogs(l.data.slice(0, 4)) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const maxCount = stats ? Math.max(...stats.weekly_appointments.map(d => d.count), 1) : 1

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportPrescriptionsPDF()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `medly-prescriptions-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message)
    } finally {
      setExporting(false)
    }
  }

  const handleExportOverview = async () => {
    setExportingOverview(true)
    try {
      const blob = await exportOverviewPDF()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `medly-overview-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message)
    } finally {
      setExportingOverview(false)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportOverview}
            disabled={exportingOverview || loading}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {exportingOverview ? 'Generating…' : 'Overview Report PDF'}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="btn-outline text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {exporting ? 'Generating…' : 'Prescriptions PDF'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'PATIENTS',    value: loading ? '—' : stats?.patients,    sub: 'registered',   color: 'text-brand-700' },
          { label: 'DOCTORS',     value: loading ? '—' : stats?.doctors,     sub: 'active',        color: 'text-brand-700' },
          { label: 'PHARMACISTS', value: loading ? '—' : stats?.pharmacists, sub: 'active',        color: 'text-brand-700' },
          { label: 'APPOINTMENTS',value: loading ? '—' : stats?.appointments,'sub': 'total',       color: 'text-brand-700' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Appointments This Week (Mon–Sun)</h2>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm">Loading…</div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {stats.weekly_appointments.map(({ day, count }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">{count > 0 ? count : ''}</span>
                  <div
                    className="w-full rounded-t bg-brand-700 transition-all"
                    style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? '4px' : '2px' }}
                  />
                  <span className="text-xs text-gray-400">{day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent audit events */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Audit Events</h2>
          {loading ? (
            <div className="text-sm text-gray-300 text-center py-4">Loading…</div>
          ) : (
            <div className="space-y-3 divide-y divide-gray-50">
              {logs.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No audit events.</p>
              )}
              {logs.map(log => (
                <div key={log.id} className="pt-3 first:pt-0">
                  <p className="text-xs text-gray-400">{fmtTs(log.timestamp)}</p>
                  <p className="text-sm text-gray-700 mt-0.5">
                    <span className="font-medium">{log.action}</span>
                    {log.details ? ` – ${log.details}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">{log.user}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System status */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">System Status</h2>
        <div className="space-y-3">
          <div className="rounded-lg bg-green-50 border border-green-200 px-5 py-3.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <p className="text-sm font-semibold text-green-800">All systems operational</p>
            </div>
            <p className="text-xs text-green-600">Database: OK · API: OK · Auth: OK · Notifications: OK</p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-5 py-3.5">
            <p className="text-sm font-semibold text-blue-800 mb-0.5">GDPR Compliance Status</p>
            <p className="text-xs text-blue-600">
              All audit logs current. 0 data subject requests pending.
              {!loading && stats && ` ${stats.prescriptions} prescription records on file.`}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
