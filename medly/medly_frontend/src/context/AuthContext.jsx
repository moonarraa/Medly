import { createContext, useContext, useState } from 'react'
import { apiLogin, apiRegister } from '../services/api.js'

const ROLE_DASHBOARDS = {
  PATIENT:    '/patient/dashboard',
  DOCTOR:     '/doctor/dashboard',
  PHARMACIST: '/pharmacist/dashboard',
  ADMIN:      '/admin/dashboard',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('medly_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = async (email, password) => {
    try {
      const { token, user } = await apiLogin(email, password)
      localStorage.setItem('medly_token', token)
      localStorage.setItem('medly_user', JSON.stringify(user))
      setUser(user)
      return { success: true, dashboard: ROLE_DASHBOARDS[user.role] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('medly_token')
    localStorage.removeItem('medly_user')
    setUser(null)
  }

  const register = async (data) => {
    try {
      const { token, user } = await apiRegister(data)
      localStorage.setItem('medly_token', token)
      localStorage.setItem('medly_user', JSON.stringify(user))
      setUser(user)
      return { success: true, dashboard: ROLE_DASHBOARDS[user.role] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, ROLE_DASHBOARDS }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
