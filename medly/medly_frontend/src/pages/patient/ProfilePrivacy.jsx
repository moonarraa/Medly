import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { consentRecords } from '../../data/mockData.js'

export default function PatientProfile() {
  const { user } = useAuth()
  const [consents, setConsents] = useState(consentRecords)
  const [saved, setSaved] = useState(false)

  const toggle = (id) => {
    setConsents(cs =>
      cs.map(c =>
        c.id === id
          ? { ...c, granted: !c.granted, grantedAt: !c.granted ? 'Now' : null }
          : c
      )
    )
    setSaved(false)
  }

  const handleSave = () => setSaved(true)

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
              <p className="text-sm text-gray-900 mt-0.5">{user?.name ?? 'Sarah Mitchell'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Email</p>
              <p className="text-sm text-gray-900 mt-0.5">{user?.email ?? 'sarah.mitchell@email.com'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Date of Birth</p>
              <p className="text-sm text-gray-900 mt-0.5">15 May 1992</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Phone</p>
              <p className="text-sm text-gray-900 mt-0.5">+44 7700 900123</p>
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

        <div className="space-y-5">
          {consents.map(c => (
            <div key={c.id} className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{c.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
                {c.grantedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {c.granted ? 'Granted' : 'Revoked'}: {c.grantedAt} · v{c.version}
                  </p>
                )}
              </div>
              <button
                onClick={() => toggle(c.id)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                  c.granted ? 'bg-brand-700' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
                    c.granted ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {saved && (
          <p className="mt-4 text-sm text-green-600 font-medium">Preferences saved.</p>
        )}
        <button onClick={handleSave} className="btn-primary mt-5">Save Preferences</button>
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
