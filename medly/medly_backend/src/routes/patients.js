import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import {
  getProfile, updateProfile, changePassword,
  getAppointments, getPrescriptions,
  getConsent, grantConsent, revokeConsent,
  exportMyData, getMyActivity, deleteMyAccount,
} from '../controllers/patientController.js'

const router = Router()

router.use(verifyToken, requireRole('PATIENT'))

router.get('/me', getProfile)
router.put('/me', updateProfile)
router.put('/me/password', changePassword)
router.delete('/me', deleteMyAccount)
router.get('/me/export', exportMyData)
router.get('/me/activity', getMyActivity)
router.get('/me/appointments', getAppointments)
router.get('/me/prescriptions', getPrescriptions)
router.get('/me/consent', getConsent)
router.post('/me/consent', grantConsent)
router.delete('/me/consent/:id', revokeConsent)

export default router
