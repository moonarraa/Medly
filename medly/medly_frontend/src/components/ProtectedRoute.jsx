import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, role }) {
  const { user, ROLE_DASHBOARDS } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (role && user.role !== role) {
    return <Navigate to={ROLE_DASHBOARDS[user.role] ?? '/login'} replace />
  }

  return children
}
