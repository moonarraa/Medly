import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { listInventory, updateStock } from '../controllers/inventoryController.js'

const router = Router()

router.use(verifyToken)

router.get('/',     requireRole('PHARMACIST', 'ADMIN'), listInventory)
router.patch('/:id', requireRole('PHARMACIST', 'ADMIN'), updateStock)

export default router
