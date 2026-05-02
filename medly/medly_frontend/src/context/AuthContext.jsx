import { createContext, useContext, useState } from 'react'

const ADMIN_USER = {
  id: 'ADM001', name: 'Admin User', role: 'ADMIN', initials: 'AU',
  email: 'admin@medly.uk',
}

const MOCK_USERS = {
  'patient@medly.uk': {
    id: 'P2773', name: 'Sarah Mitchell', role: 'PATIENT', initials: 'SM',
    email: 'patient@medly.uk',
  },
  'doctor@medly.uk': {
    id: 'D001', name: 'Dr. James Patel', role: 'DOCTOR', initials: 'JP',
    email: 'doctor@medly.uk', specialisation: 'General Practice', hospital: 'Central Hospital, Leicester',
  },
  'pharmacist@medly.uk': {
    id: 'PH001', name: 'Anna Kowalski', role: 'PHARMACIST', initials: 'AK',
    email: 'pharmacist@medly.uk', pharmacyName: 'Royal Infirmary',
  },
  'admin@medly.uk':     ADMIN_USER,
  'admin@medly.nhs.uk': ADMIN_USER,
}

const ROLE_DASHBOARDS = {
  PATIENT: '/patient/dashboard',
  DOCTOR: '/doctor/dashboard',
  PHARMACIST: '/pharmacist/dashboard',
  ADMIN: '/admin/dashboard',
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

  const login = (email) => {
    const found = MOCK_USERS[email.toLowerCase().trim()]
    if (found) {
      localStorage.setItem('medly_user', JSON.stringify(found))
      setUser(found)
      return { success: true, dashboard: ROLE_DASHBOARDS[found.role] }
    }
    // Demo: any email works — default to patient
    const demo = { ...MOCK_USERS['patient@medly.uk'], email, name: email.split('@')[0] }
    localStorage.setItem('medly_user', JSON.stringify(demo))
    setUser(demo)
    return { success: true, dashboard: ROLE_DASHBOARDS['PATIENT'] }
  }

  const logout = () => {
    localStorage.removeItem('medly_user')
    setUser(null)
  }

  const register = (data) => {
    const newUser = {
      id: 'P' + Math.floor(Math.random() * 9000 + 1000),
      name: `${data.firstName} ${data.lastName}`,
      role: 'PATIENT',
      initials: (data.firstName[0] + data.lastName[0]).toUpperCase(),
      email: data.email,
    }
    localStorage.setItem('medly_user', JSON.stringify(newUser))
    setUser(newUser)
    return { success: true, dashboard: ROLE_DASHBOARDS['PATIENT'] }
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
