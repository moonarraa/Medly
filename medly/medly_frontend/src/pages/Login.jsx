import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }
    const result = login(email, password)
    if (result.success) navigate(result.dashboard)
    else setError(result.error)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden md:flex w-2/5 bg-brand-700 flex-col items-center justify-center p-12 text-white">
        <div className="w-24 h-24 rounded-full border-4 border-white/70 flex items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-full bg-white/30" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-3">Welcome to Medly</h1>
        <p className="text-white/70 text-center leading-relaxed">
          Secure healthcare appointments<br />at your fingertips
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Sign In</h2>
          <p className="text-gray-500 text-sm mb-8">Welcome back. Please enter your details.</p>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-700 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm font-medium text-brand-700 hover:text-brand-800">
                Forgot password?
              </button>
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-base">
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
              Register here
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-6 bg-brand-50 border border-brand-100 rounded-lg p-4 text-xs text-brand-800">
            <p className="font-semibold mb-1">Demo credentials</p>
            <p>patient@medly.uk → Patient dashboard</p>
            <p>doctor@medly.uk → Doctor dashboard</p>
            <p>pharmacist@medly.uk → Pharmacist dashboard</p>
            <p>admin@medly.uk → Admin dashboard</p>
            <p className="mt-1 text-brand-600">Any password works.</p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed">
            By signing in you agree to our Privacy Policy and<br />
            data handling practices under UK GDPR.
          </p>
        </div>
      </div>
    </div>
  )
}
