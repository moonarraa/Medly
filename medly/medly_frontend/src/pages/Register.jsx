import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', dob: '', phone: '',
    password: '', confirmPassword: '', nhs: '', gender: '',
  })
  const [consents, setConsents] = useState({ terms: false, gdpr: false, reminders: false })
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!consents.terms || !consents.gdpr) {
      setError('You must agree to the Terms of Service and GDPR consent to proceed.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    const result = register(form)
    if (result.success) navigate(result.dashboard)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-white/50" />
          </div>
          <span className="font-semibold text-gray-900">Medly</span>
        </Link>
        <Link to="/login" className="text-sm text-gray-500 hover:text-gray-800">
          Already a member? <span className="font-medium text-brand-700">Sign in</span>
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-2 text-sm">Join Medly to manage your healthcare</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input className="input" placeholder="" value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input className="input" placeholder="" value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input className="input" type="email" placeholder="" value={form.email} onChange={set('email')} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
              <input className="input" type="date" value={form.dob} onChange={set('dob')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input className="input" type="tel" placeholder="+44" value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <select className="input" value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NHS Number (optional)</label>
              <input className="input" placeholder="000 000 0000" value={form.nhs} onChange={set('nhs')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input className="input" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { key: 'terms',     label: 'I agree to the Terms of Service and Privacy Policy' },
              { key: 'gdpr',      label: 'I consent to processing of health data under UK GDPR Art. 9' },
              { key: 'reminders', label: 'Send me appointment reminders by email/SMS (optional)' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents[key]}
                  onChange={e => setConsents(c => ({ ...c, [key]: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-700 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-600">{label}</span>
              </label>
            ))}
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-base mt-2">
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}
