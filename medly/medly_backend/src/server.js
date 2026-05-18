import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import patientRoutes from './routes/patients.js'
import doctorRoutes from './routes/doctors.js'
import appointmentRoutes from './routes/appointments.js'
import prescriptionRoutes from './routes/prescriptions.js'
import adminRoutes from './routes/admin.js'
import inventoryRoutes from './routes/inventory.js'

const app = express()

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/inventory', inventoryRoutes)

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

app.use((err, req, res, next) => {
  console.error(err)
  if (err.code === 'P2002') {
    return res.status(409).json({ error: `${err.meta?.target?.join(', ')} already in use` })
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Medly API running on http://localhost:${PORT}`))
