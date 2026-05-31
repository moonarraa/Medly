import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { getMyProfile } from '../controllers/pharmacistController.js'

const router = Router()

router.use(verifyToken, requireRole('PHARMACIST'))

router.get('/me', getMyProfile)

export default router
