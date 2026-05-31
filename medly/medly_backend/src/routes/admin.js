import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { getStats, getUsers, updateUser, softDeleteUser, getAuditLogs, exportPrescriptions, exportOverviewReport, exportDoctorReport } from '../controllers/adminController.js'

const router = Router()

router.use(verifyToken, requireRole('ADMIN'))

router.get('/stats', getStats)
router.get('/users', getUsers)
router.patch('/users/:id', updateUser)
router.delete('/users/:id', softDeleteUser)
router.get('/audit-logs', getAuditLogs)
router.get('/prescriptions/export', exportPrescriptions)
router.get('/reports/overview', exportOverviewReport)
router.get('/reports/doctor/:id', exportDoctorReport)

export default router
