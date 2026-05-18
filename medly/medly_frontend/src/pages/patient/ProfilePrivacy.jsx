import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getMyProfile, getMyConsent, grantConsent, revokeConsent } from '../../services/api.js'

const CONSENT_DEFS = [
  {
    type: 'DATA_PROCESSING',
    label: 'Data Processing',
    description: 'Allow Medly to process your personal health data for appointment management.',
  },
  {
    type: 'MARKETING_COMMUNICATIONS',
    label: 'Marketing Communications',
    description: 'Receive news, health tips, and promotional content from Medly.',
  },
  {
    type: 'MEDICAL_RECORD_SHARING',
    label: 'Medical Record Sharing',
    description: 'Allow sharing of your medical records between authorised healthcare providers.',
  },
  {
    type: 'THIRD_PARTY_SHARING',
    label: 'Third Party Sharing',
    description: 'Allow Medly to share anonymised data with approved NHS research partners.',
  },
]

function latestRecord(records, type) {
  return records
    .filter(r => r.consent_type === type)
    .sort((a, b) => new Date(b.granted_at) - new Date(a.granted_at))[0]
}

export default function PatientProfile() {
  const { user } = useAuth()
  const [profile, setProfile]           = useState(null)
  const [consentRecords, setConsentRecords] = useState([])
  const [toggles, setToggles]           = useState({})
  const [saved, setSaved]               = useState(false)
  const [saving, setSaving]             = useState(false)
  const [loading, setLoading]           = useState(true)

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

  const toggle = (type) => {
    setToggles(t => ({ ...t, [type]: !t[type] }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(
        CONSENT_DEFS.map(async ({ type }) => {
          const latest  = latestRecord(consentRecords, type)
          const current = latest?.is_granted ?? false
          const desired = toggles[type]
          if (desired === current) return
          if (desired) {
            await grantConsent(type)
          } else if (latest) {
            await revokeConsent(latest.consent_id)
          }
        })
      )
      const updated = await getMyConsent()
      setConsentRecords(updated)
      setSaved(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <h1 className="page-title mb-8">Profile & Privacy Settings</h1>

      {/* Personal Information */}
      <section className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Personal Information</h2>
        <div className="flex gap-5 items-start">
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
              <p className="text-sm text-gray-900 mt-0.5">
                {profile?.gender?.replace(/_/g, ' ') ?? '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button className="btn-outline">Edit Profile</button>
          <button className="btn-outline">Change Password</button>
        </div>
      </section>

      {/* Consent Management */}
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
                    onClick={() => toggle(type)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                      toggles[type] ? 'bg-brand-700' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
                        toggles[type] ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {saved && <p className="mt-4 text-sm text-green-600 font-medium">Preferences saved.</p>}
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="btn-primary mt-5 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </section>

      {/* Data & Privacy (UK GDPR) */}
      <section className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Data & Privacy (UK GDPR)</h2>
        <div className="space-y-4">
          {[
            {
              title: 'Article 15 – Right to Access',
              desc: 'Download a copy of all your personal data held by Medly.',
              action: 'Export My Data', danger: false,
            },
            {
              title: 'Audit Log',
              desc: 'View who has accessed your records and when.',
              action: 'View Activity', danger: false,
            },
            {
              title: 'Article 17 – Right to Erasure',
              desc: 'Request permanent deletion of your account and all associated data.',
              action: 'Delete Account', danger: true,
            },
          ].map(({ title, desc, action, danger }) => (
            <div key={title} className="flex items-center justify-between gap-6 py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-900'}`}>{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <button className={danger ? 'btn-danger flex-shrink-0' : 'btn-outline flex-shrink-0'}>
                {action}
              </button>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  )
}
