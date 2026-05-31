import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { getMyDoctorProfile } from '../../services/api.js'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyDoctorProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="page-title">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your account details and professional information.</p>
      </div>

      {loading ? (
        <div className="max-w-xl space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : !profile ? (
        <p className="text-sm text-gray-400">Profile not found.</p>
      ) : (
        <div className="max-w-xl space-y-4">
          {/* Avatar + name card */}
          <div className="card p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {(profile.name || '').split(' ').filter(w => !w.startsWith('Dr')).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{profile.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{profile.specialisation} · {profile.department}</p>
              <span className="inline-block mt-2 text-xs font-semibold bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full">
                DOCTOR
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="card divide-y divide-gray-100">
            {[
              { label: 'Email Address',  value: profile.email },
              { label: 'Specialisation', value: profile.specialisation },
              { label: 'Department',     value: profile.department },
              { label: 'License Number', value: profile.license_number },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 px-1">
            To update your details, please contact your system administrator.
          </p>
        </div>
      )}
    </Layout>
  )
}
