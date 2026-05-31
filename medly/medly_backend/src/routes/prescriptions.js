import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import {
  createPrescription, getPharmacistQueue,
  dispensePrescription, getDoctorPrescriptions,
} from '../controllers/prescriptionController.js'

const router = Router()

router.use(verifyToken)

router.post('/', requireRole('DOCTOR'), createPrescription)
router.get('/queue', requireRole('PHARMACIST'), getPharmacistQueue)
router.get('/doctor', requireRole('DOCTOR'), getDoctorPrescriptions)
router.patch('/:id/dispense', requireRole('PHARMACIST'), dispensePrescription)

export default router
