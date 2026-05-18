import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { bookAppointment, getAppointment, updateStatus, cancelAppointment } from '../controllers/appointmentController.js'

const router = Router()

router.use(verifyToken)

router.post('/', requireRole('PATIENT'), bookAppointment)
router.get('/:id', getAppointment)
router.patch('/:id/status', requireRole('DOCTOR', 'ADMIN'), updateStatus)
router.patch('/:id/cancel', requireRole('PATIENT'), cancelAppointment)

export default router
