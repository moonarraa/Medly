import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import {
  listDoctors, getDoctorAvailability,
  getMyProfile, getMyAppointments, getMyPatients,
  getMyAvailability, createAvailability, updateAvailability, deleteAvailability,
} from '../controllers/doctorController.js'

const router = Router()

// Doctor-only /me routes must come before /:id routes
router.get('/me', verifyToken, requireRole('DOCTOR'), getMyProfile)
router.get('/me/appointments', verifyToken, requireRole('DOCTOR'), getMyAppointments)
router.get('/me/patients', verifyToken, requireRole('DOCTOR'), getMyPatients)
router.get('/me/availability', verifyToken, requireRole('DOCTOR'), getMyAvailability)
router.post('/me/availability', verifyToken, requireRole('DOCTOR'), createAvailability)
router.put('/me/availability/:id', verifyToken, requireRole('DOCTOR'), updateAvailability)
router.delete('/me/availability/:id', verifyToken, requireRole('DOCTOR'), deleteAvailability)

// Any authenticated user can list doctors / check availability (for booking)
router.get('/', verifyToken, listDoctors)
router.get('/:id/availability', verifyToken, getDoctorAvailability)

export default router
