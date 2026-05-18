import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import {
  getProfile, updateProfile,
  getAppointments, getPrescriptions,
  getConsent, grantConsent, revokeConsent,
} from '../controllers/patientController.js'

const router = Router()

router.use(verifyToken, requireRole('PATIENT'))

router.get('/me', getProfile)
router.put('/me', updateProfile)
router.get('/me/appointments', getAppointments)
router.get('/me/prescriptions', getPrescriptions)
router.get('/me/consent', getConsent)
router.post('/me/consent', grantConsent)
router.delete('/me/consent/:id', revokeConsent)

export default router
