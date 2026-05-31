import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { getDoctors, exportDoctorReportPDF } from '../../services/api.js'

export default function Reports() {
  const [doctors,       setDoctors]       = useState([])
  const [loadingDrs,    setLoadingDrs]    = useState(true)
  const [selectedId,    setSelectedId]    = useState('')
  const [exporting,     setExporting]     = useState(false)
  const [lastGenerated, setLastGenerated] = useState(null)
  const [error,         setError]         = useState(null)

  useEffect(() => {
    getDoctors()
      .then(setDoctors)
      .catch(console.error)
      .finally(() => setLoadingDrs(false))
  }, [])

  const selectedDoctor = doctors.find(d => d.id === selectedId) || null

  const handleGenerate = async () => {
    if (!selectedId) return
    setExporting(true)
    setError(null)
    try {
      const blob = await exportDoctorReportPDF(selectedId)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      const safeName = selectedDoctor
        ? selectedDoctor.name.replace(/^Dr\.\s+/, '').toLowerCase().replace(/\s+/g, '-')
        : selectedId
      a.href     = url
      a.download = `medly-doctor-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setLastGenerated(selectedDoctor?.name || selectedId)
    } catch (err) {
      setError(err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="page-title">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Generate and download PDF reports for clinical staff.</p>
      </div>

      <div className="max-w-xl">
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-base">Doctor Activity Report</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Profile, appointment breakdown, availability schedule, and recent appointments.
              </p>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Doctor</label>
          {loadingDrs ? (
            <div className="h-10 bg-gray-100 animate-pulse rounded-lg" />
          ) : (
            <select
              value={selectedId}
              onChange={e => { setSelectedId(e.target.value); setLastGenerated(null); setError(null) }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Choose a doctor —</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialisation} · {d.department}
                </option>
              ))}
            </select>
          )}

          {selectedDoctor && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {selectedDoctor.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedDoctor.name}</p>
                <p className="text-xs text-gray-500">{selectedDoctor.email}</p>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {lastGenerated && !error && (
            <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              Report generated for <span className="font-medium">{lastGenerated}</span> — check your downloads.
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!selectedId || exporting || loadingDrs}
            className="mt-5 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating PDF…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Generate Report PDF
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  )
}
