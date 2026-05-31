const BASE = 'http://localhost:3001/api'

function getToken() {
  return localStorage.getItem('medly_token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    localStorage.removeItem('medly_token')
    localStorage.removeItem('medly_user')
    window.location.href = '/login'
    return
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

const get   = (path)        => request('GET', path)
const post  = (path, body)  => request('POST', path, body)
const put   = (path, body)  => request('PUT', path, body)
const patch = (path, body)  => request('PATCH', path, body)
const del   = (path)        => request('DELETE', path)

// Auth
export const apiLogin    = (email, password) => post('/auth/login', { email, password })
export const apiRegister = (data)            => post('/auth/register', data)
export const getMe       = ()                => get('/auth/me')

// Patient
export const getMyProfile       = ()         => get('/patients/me')
export const updateMyProfile    = (data)     => put('/patients/me', data)
export const getMyAppointments  = ()         => get('/patients/me/appointments')
export const getMyPrescriptions = ()         => get('/patients/me/prescriptions')
export const getMyConsent       = ()              => get('/patients/me/consent')
export const grantConsent       = (type)          => post('/patients/me/consent', { consent_type: type, version: '1.0' })
export const revokeConsent      = (id)            => del(`/patients/me/consent/${id}`)
export const changeMyPassword   = (cur, next)     => put('/patients/me/password', { current_password: cur, new_password: next })
export const getMyActivity      = ()              => get('/patients/me/activity')
export const deleteMyAccount    = ()              => del('/patients/me')
export async function exportMyData() {
  const res = await fetch(`${BASE}/patients/me/export`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Export failed')
  }
  return res.blob()
}

// Doctors
export const getDoctors               = ()           => get('/doctors')
export const getDoctorAvailability    = (id, date)   => get(`/doctors/${id}/availability${date ? `?date=${date}` : ''}`)
export const getMyDoctorProfile       = ()           => get('/doctors/me')
export const getMyDoctorAppointments  = ()           => get('/doctors/me/appointments')
export const getMyDoctorAvailability  = ()           => get('/doctors/me/availability')
export const createAvailability       = (data)       => post('/doctors/me/availability', data)
export const updateAvailability       = (id, data)   => put(`/doctors/me/availability/${id}`, data)
export const deleteAvailability       = (id)         => del(`/doctors/me/availability/${id}`)
export const getMyPatients            = ()           => get('/doctors/me/patients')

// Appointments
export const bookAppointment   = (data)              => post('/appointments', data)
export const getAppointment    = (id)                => get(`/appointments/${id}`)
export const updateApptStatus  = (id, status, notes) => patch(`/appointments/${id}/status`, { status, notes })
export const cancelAppointment = (id)                => patch(`/appointments/${id}/cancel`, {})

// Prescriptions
export const createPrescription   = (data) => post('/prescriptions', data)
export const getPharmacistQueue   = ()     => get('/prescriptions/queue')
export const dispensePrescription = (id)   => patch(`/prescriptions/${id}/dispense`, {})
export const getDoctorPrescriptions = ()   => get('/prescriptions/doctor')

// Pharmacist
export const getMyPharmacistProfile = () => get('/pharmacists/me')

// Inventory
export const getInventory  = ()           => get('/inventory')
export const updateStock   = (id, qty)    => patch(`/inventory/${id}`, { quantity_in_stock: qty })

// Admin
export const getAdminStats   = ()          => get('/admin/stats')
export async function exportPrescriptionsPDF() {
  const res = await fetch(`${BASE}/admin/prescriptions/export`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Export failed')
  }
  return res.blob()
}
export async function exportOverviewPDF() {
  const res = await fetch(`${BASE}/admin/reports/overview`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Export failed')
  }
  return res.blob()
}
export async function exportDoctorReportPDF(doctorId) {
  const res = await fetch(`${BASE}/admin/reports/doctor/${doctorId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Export failed')
  }
  return res.blob()
}
export const getAdminUsers   = (params)    => get(`/admin/users${params ? '?' + new URLSearchParams(params).toString() : ''}`)
export const updateAdminUser = (id, data)  => patch(`/admin/users/${id}`, data)
export const deleteAdminUser = (id)        => del(`/admin/users/${id}`)
export const getAuditLogs    = (page = 1)  => get(`/admin/audit-logs?page=${page}`)
