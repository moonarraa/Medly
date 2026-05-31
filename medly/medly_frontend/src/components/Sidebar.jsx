import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = {
  PATIENT: [
    { label: 'Dashboard',       to: '/patient/dashboard' },
    { label: 'Book Appointment', to: '/patient/book-appointment' },
    { label: 'My Appointments', to: '/patient/appointments' },
    { label: 'Prescriptions',   to: '/patient/prescriptions' },
    { label: 'Profile & Privacy', to: '/patient/profile' },
  ],
  DOCTOR: [
    { label: 'Dashboard',       to: '/doctor/dashboard' },
    { label: 'My Schedule',     to: '/doctor/schedule' },
    { label: 'Patient Records', to: '/doctor/patients' },
    { label: 'Appointments',    to: '/doctor/appointments' },
    { label: 'Prescriptions',   to: '/doctor/prescriptions' },
    { label: 'Profile',         to: '/doctor/profile' },
  ],
  PHARMACIST: [
    { label: 'Dashboard',  to: '/pharmacist/dashboard' },
    { label: 'Inventory',  to: '/pharmacist/inventory' },
    { label: 'Profile',    to: '/pharmacist/profile' },
  ],
  ADMIN: [
    { label: 'Dashboard',        to: '/admin/dashboard' },
    { label: 'User Management',  to: '/admin/users' },
    { label: 'Audit Log',        to: '/admin/audit-log' },
    { label: 'Reports',          to: '/admin/reports' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = NAV[user?.role] ?? []
  const showRoleLabel = user?.role && user.role !== 'PATIENT'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-brand-700 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border-2 border-white/80 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-white/40" />
          </div>
          <span className="text-white font-semibold text-base tracking-wide">Medly</span>
        </div>
        {showRoleLabel && (
          <p className="text-white/40 text-[10px] font-semibold tracking-widest uppercase mt-4 pl-0.5">
            {user.role}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-1 space-y-0.5">
        {links.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
