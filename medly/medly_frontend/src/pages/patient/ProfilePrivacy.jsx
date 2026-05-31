import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  getMyProfile, updateMyProfile, changeMyPassword,
  getMyConsent, grantConsent, revokeConsent,
  exportMyData, getMyActivity, deleteMyAccount,
} from '../../services/api.js'

const CONSENT_DEFS = [
  { type: 'DATA_PROCESSING',          label: 'Data Processing',         description: 'Allow Medly to process your personal health data for appointment management.' },
  { type: 'MARKETING_COMMUNICATIONS', label: 'Marketing Communications', description: 'Receive news, health tips, and promotional content from Medly.' },
  { type: 'MEDICAL_RECORD_SHARING',   label: 'Medical Record Sharing',   description: 'Allow sharing of your medical records between authorised healthcare providers.' },
  { type: 'THIRD_PARTY_SHARING',      label: 'Third Party Sharing',      description: 'Allow Medly to share anonymised data with approved NHS research partners.' },
]

function latestRecord(records, type) {
  return records
    .filter(r => r.consent_type === type)
    .sort((a, b) => new Date(b.granted_at) - new Date(a.granted_at))[0]
}

function fmtTs(iso) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function PatientProfile() {
  const { user, logout } = useAuth()

  const [profile,        setProfile]        = useState(null)
  const [loading,        setLoading]        = useState(true)

  // Consent
  const [consentRecords, setConsentRecords] = useState([])
  const [toggles,        setToggles]        = useState({})
  const [savingConsent,  setSavingConsent]  = useState(false)
  const [consentSaved,   setConsentSaved]   = useState(false)

  // Edit profile
  const [editMode,       setEditMode]       = useState(false)
  const [editForm,       setEditForm]       = useState({})
  const [savingProfile,  setSavingProfile]  = useState(false)
  const [profileSaved,   setProfileSaved]   = useState(false)

  // Change password
  const [showPwForm,     setShowPwForm]     = useState(false)
  const [pwForm,         setPwForm]         = useState({ current: '', next: '', confirm: '' })
  const [savingPw,       setSavingPw]       = useState(false)
  const [pwError,        setPwError]        = useState(null)
  const [pwSaved,        setPwSaved]        = useState(false)

  // Export
  const [exporting,      setExporting]      = useState(false)

  // Activity
  const [activity,       setActivity]       = useState([])
  const [showActivity,   setShowActivity]   = useState(false)
  const [loadingAct,     setLoadingAct]     = useState(false)

  // Delete
  const [deleteStep,     setDeleteStep]     = useState(0)
  const [deleting,       setDeleting]       = useState(false)

  useEffect(() => {
    Promise.all([getMyProfile(), getMyConsent()])
      .then(([prof, records]) => {
        setProfile(prof)
        setConsentRecords(records)
        const state = {}
        CONSENT_DEFS.forEach(({ type }) => {
          const latest = latestRecord(records, type)
          state[type] = latest?.is_granted ?? false
        })
        setToggles(state)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // ── Consent ────────────────────────────────────────────────────────────────

  const handleSaveConsent = async () => {
    setSavingConsent(true)
    try {
      await Promise.all(
        CONSENT_DEFS.map(async ({ type }) => {
          const latest  = latestRecord(consentRecords, type)
          const current = latest?.is_granted ?? false
          const desired = toggles[type]
          if (desired === current) return
          if (desired) await grantConsent(type)
          else if (latest) await revokeConsent(latest.consent_id)
        })
      )
      const updated = await getMyConsent()
      setConsentRecords(updated)
      setConsentSaved(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingConsent(false)
    }
  }

  // ── Edit profile ───────────────────────────────────────────────────────────

  const enterEdit = () => {
    setEditForm({
      firstName: profile.first_name,
      lastName:  profile.last_name,
      phone:     profile.phone_number || '',
      address:   profile.address || '',
    })
    setEditMode(true)
    setProfileSaved(false)
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await updateMyProfile({ firstName: editForm.firstName, lastName: editForm.lastName, phone: editForm.phone, address: editForm.address })
      const updated = await getMyProfile()
      setProfile(updated)
      setEditMode(false)
      setProfileSaved(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Change password ────────────────────────────────────────────────────────

  const handleChangePassword = async () => {
    setPwError(null)
    if (pwForm.next !== pwForm.confirm) { setPwError('New passwords do not match.'); return }
    if (pwForm.next.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    setSavingPw(true)
    try {
      await changeMyPassword(pwForm.current, pwForm.next)
      setPwSaved(true)
      setPwForm({ current: '', next: '', confirm: '' })
      setShowPwForm(false)
    } catch (err) {
      setPwError(err.message)
    } finally {
      setSavingPw(false)
    }
  }

  // ── Export data ────────────────────────────────────────────────────────────

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportMyData()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `medly-my-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message)
    } finally {
      setExporting(false)
    }
  }

  // ── View activity ──────────────────────────────────────────────────────────

  const handleToggleActivity = async () => {
    if (showActivity) { setShowActivity(false); return }
    if (activity.length > 0) { setShowActivity(true); return }
    setLoadingAct(true)
    try {
      const logs = await getMyActivity()
      setActivity(logs)
      setShowActivity(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingAct(false)
    }
  }

  // ── Delete account ─────────────────────────────────────────────────────────

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteMyAccount()
      logout()
    } catch (err) {
      alert(err.message)
      setDeleting(false)
      setDeleteStep(0)
    }
  }

  return (
    <Layout>
      <h1 className="page-title mb-8">Profile & Privacy Settings</h1>

      {/* ── Personal Information ─────────────────────────────────────────── */}
      <section className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Personal Information</h2>

        {editMode ? (
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            {[
              { label: 'First Name', key: 'firstName' },
              { label: 'Last Name',  key: 'lastName'  },
              { label: 'Phone',      key: 'phone'     },
              { label: 'Address',    key: 'address'   },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 font-medium uppercase mb-1">{label}</label>
                <input
                  className="input w-full"
                  value={editForm[key]}
                  onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-5 items-start mb-5">
            <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 text-lg font-bold flex items-center justify-center flex-shrink-0">
              {user?.initials}
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Full Name</p>
                <p className="text-sm text-gray-900 mt-0.5">{profile?.name ?? user?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Email</p>
                <p className="text-sm text-gray-900 mt-0.5">{profile?.email ?? user?.email ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Date of Birth</p>
                <p className="text-sm text-gray-900 mt-0.5">
                  {profile?.date_of_birth
                    ? new Date(profile.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Phone</p>
                <p className="text-sm text-gray-900 mt-0.5">{profile?.phone_number ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">NHS Number</p>
                <p className="text-sm text-gray-900 mt-0.5 font-mono">{profile?.nhs_number ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Gender</p>
                <p className="text-sm text-gray-900 mt-0.5">{profile?.gender?.replace(/_/g, ' ') ?? '—'}</p>
              </div>
            </div>
          </div>
        )}

        {profileSaved && !editMode && (
          <p className="text-sm text-green-600 font-medium mb-3">Profile updated successfully.</p>
        )}
        {pwSaved && !showPwForm && (
          <p className="text-sm text-green-600 font-medium mb-3">Password changed successfully.</p>
        )}

        <div className="flex gap-3 flex-wrap">
          {editMode ? (
            <>
              <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary disabled:opacity-60">
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
              <button onClick={() => setEditMode(false)} className="btn-outline">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={enterEdit} disabled={loading} className="btn-outline disabled:opacity-60">
                Edit Profile
              </button>
              <button
                onClick={() => { setShowPwForm(v => !v); setPwError(null); setPwSaved(false) }}
                className="btn-outline"
              >
                {showPwForm ? 'Cancel' : 'Change Password'}
              </button>
            </>
          )}
        </div>

        {showPwForm && !editMode && (
          <div className="mt-5 pt-5 border-t border-gray-100 grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Current Password', key: 'current', placeholder: '••••••••' },
              { label: 'New Password',     key: 'next',    placeholder: 'Min. 8 characters' },
              { label: 'Confirm New',      key: 'confirm', placeholder: 'Repeat new password' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 font-medium uppercase mb-1">{label}</label>
                <input
                  type="password"
                  className="input w-full"
                  placeholder={placeholder}
                  value={pwForm[key]}
                  onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            {pwError && <p className="sm:col-span-3 text-sm text-red-600">{pwError}</p>}
            <div className="sm:col-span-3">
              <button onClick={handleChangePassword} disabled={savingPw} className="btn-primary disabled:opacity-60">
                {savingPw ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Consent Management ───────────────────────────────────────────── */}
      <section className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Consent Management</h2>
        <p className="text-sm text-gray-500 mb-5">Manage how your data is processed under UK GDPR Art. 7</p>

        {loading ? (
          <div className="text-center text-gray-400 text-sm py-4">Loading consent records…</div>
        ) : (
          <div className="space-y-5">
            {CONSENT_DEFS.map(({ type, label, description }) => {
              const latest = latestRecord(consentRecords, type)
              return (
                <div key={type} className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                    {latest && (
                      <p className="text-xs text-gray-400 mt-1">
                        {latest.is_granted ? 'Granted' : 'Revoked'}:{' '}
                        {new Date(latest.granted_at).toLocaleDateString('en-GB')} · v{latest.version}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { setToggles(t => ({ ...t, [type]: !t[type] })); setConsentSaved(false) }}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                      toggles[type] ? 'bg-brand-700' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
                      toggles[type] ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {consentSaved && <p className="mt-4 text-sm text-green-600 font-medium">Preferences saved.</p>}
        <button onClick={handleSaveConsent} disabled={savingConsent || loading} className="btn-primary mt-5 disabled:opacity-60">
          {savingConsent ? 'Saving…' : 'Save Preferences'}
        </button>
      </section>

      {/* ── Data & Privacy (UK GDPR) ─────────────────────────────────────── */}
      <section className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Data & Privacy (UK GDPR)</h2>
        <div className="space-y-0 divide-y divide-gray-100">

          {/* Article 15 – Export */}
          <div className="flex items-center justify-between gap-6 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Article 15 – Right to Access</p>
              <p className="text-xs text-gray-500 mt-0.5">Download a copy of all your personal data held by Medly.</p>
            </div>
            <button onClick={handleExport} disabled={exporting} className="btn-outline flex-shrink-0 disabled:opacity-60">
              {exporting ? 'Exporting…' : 'Export My Data'}
            </button>
          </div>

          {/* Audit / Activity */}
          <div className="py-4">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-gray-900">Audit Log</p>
                <p className="text-xs text-gray-500 mt-0.5">View who has accessed your records and when.</p>
              </div>
              <button onClick={handleToggleActivity} disabled={loadingAct} className="btn-outline flex-shrink-0 disabled:opacity-60">
                {loadingAct ? 'Loading…' : showActivity ? 'Hide Activity' : 'View Activity'}
              </button>
            </div>

            {showActivity && (
              <div className="mt-4 rounded-lg border border-gray-100 overflow-hidden">
                {activity.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No activity recorded yet.</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {activity.map(log => (
                      <div key={log.id} className="px-4 py-3 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{log.action.replace(/_/g, ' ')}</p>
                          {log.details && <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">IP: {log.ip_address}</p>
                        </div>
                        <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{fmtTs(log.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Article 17 – Delete */}
          <div className="pt-4">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-red-600">Article 17 – Right to Erasure</p>
                <p className="text-xs text-gray-500 mt-0.5">Request permanent deletion of your account and all associated data.</p>
              </div>
              {deleteStep === 0 && (
                <button onClick={() => setDeleteStep(1)} className="btn-danger flex-shrink-0">
                  Delete Account
                </button>
              )}
            </div>

            {deleteStep === 1 && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-4">
                <p className="text-sm font-semibold text-red-700 mb-1">Are you sure?</p>
                <p className="text-xs text-red-600 mb-4">
                  This will permanently deactivate your account. Your data will be retained for legal compliance
                  (UK GDPR Art. 17) but you will not be able to log in.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleDelete} disabled={deleting} className="btn-danger disabled:opacity-60">
                    {deleting ? 'Deleting…' : 'Yes, delete my account'}
                  </button>
                  <button onClick={() => setDeleteStep(0)} className="btn-outline">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>
    </Layout>
  )
}
