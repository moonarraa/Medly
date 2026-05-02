import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

import PatientDashboard  from './pages/patient/Dashboard.jsx'
import BookAppointment   from './pages/patient/BookAppointment.jsx'
import PatientAppts      from './pages/patient/Appointments.jsx'
import PatientRx         from './pages/patient/Prescriptions.jsx'
import PatientProfile    from './pages/patient/ProfilePrivacy.jsx'

import DoctorDashboard   from './pages/doctor/Dashboard.jsx'
import DoctorSchedule    from './pages/doctor/Schedule.jsx'
import PatientRecords    from './pages/doctor/PatientRecords.jsx'
import DoctorAppts       from './pages/doctor/Appointments.jsx'
import ApptDetail        from './pages/doctor/AppointmentDetail.jsx'
import DoctorRx          from './pages/doctor/Prescriptions.jsx'

import PharmDashboard    from './pages/pharmacist/Dashboard.jsx'
import PharmRx           from './pages/pharmacist/Prescriptions.jsx'
import PharmInventory    from './pages/pharmacist/Inventory.jsx'

import AdminDashboard    from './pages/admin/Dashboard.jsx'
import UserManagement    from './pages/admin/UserManagement.jsx'
import AuditLog          from './pages/admin/AuditLog.jsx'

import Placeholder from './pages/Placeholder.jsx'

function P({ role, children }) {
  return <ProtectedRoute role={role}>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient */}
        <Route path="/patient/dashboard"        element={<P role="PATIENT"><PatientDashboard /></P>} />
        <Route path="/patient/book-appointment" element={<P role="PATIENT"><BookAppointment /></P>} />
        <Route path="/patient/appointments"     element={<P role="PATIENT"><PatientAppts /></P>} />
        <Route path="/patient/prescriptions"    element={<P role="PATIENT"><PatientRx /></P>} />
        <Route path="/patient/profile"          element={<P role="PATIENT"><PatientProfile /></P>} />

        {/* Doctor */}
        <Route path="/doctor/dashboard"         element={<P role="DOCTOR"><DoctorDashboard /></P>} />
        <Route path="/doctor/schedule"          element={<P role="DOCTOR"><DoctorSchedule /></P>} />
        <Route path="/doctor/patients"          element={<P role="DOCTOR"><PatientRecords /></P>} />
        <Route path="/doctor/appointments"      element={<P role="DOCTOR"><DoctorAppts /></P>} />
        <Route path="/doctor/appointments/:id"  element={<P role="DOCTOR"><ApptDetail /></P>} />
        <Route path="/doctor/prescriptions"     element={<P role="DOCTOR"><DoctorRx /></P>} />
        <Route path="/doctor/profile"           element={<P role="DOCTOR"><Placeholder title="Profile" /></P>} />

        {/* Pharmacist */}
        <Route path="/pharmacist/dashboard"     element={<P role="PHARMACIST"><PharmDashboard /></P>} />
        <Route path="/pharmacist/prescriptions" element={<P role="PHARMACIST"><PharmRx /></P>} />
        <Route path="/pharmacist/inventory"     element={<P role="PHARMACIST"><PharmInventory /></P>} />
        <Route path="/pharmacist/profile"       element={<P role="PHARMACIST"><Placeholder title="Profile" /></P>} />

        {/* Admin */}
        <Route path="/admin/dashboard"          element={<P role="ADMIN"><AdminDashboard /></P>} />
        <Route path="/admin/users"              element={<P role="ADMIN"><UserManagement /></P>} />
        <Route path="/admin/audit-log"          element={<P role="ADMIN"><AuditLog /></P>} />
        <Route path="/admin/settings"           element={<P role="ADMIN"><Placeholder title="System Settings" /></P>} />
        <Route path="/admin/reports"            element={<P role="ADMIN"><Placeholder title="Reports" /></P>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
