import prisma from '../db.js'
import bcrypt from 'bcrypt'

function fmtTime(d) {
  if (!d) return null
  const date = new Date(d)
  const h = date.getUTCHours().toString().padStart(2, '0')
  const m = date.getUTCMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export async function getProfile(req, res, next) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { patient_id: req.user.userId },
      include: { user: true },
    })
    if (!patient) return res.status(404).json({ error: 'Patient not found' })

    res.json({
      id: patient.patient_id,
      email: patient.user.email,
      first_name: patient.user.first_name,
      last_name: patient.user.last_name,
      name: `${patient.user.first_name} ${patient.user.last_name}`,
      phone_number: patient.user.phone_number,
      date_of_birth: patient.date_of_birth,
      gender: patient.gender,
      address: patient.address,
      nhs_number: patient.nhs_number,
      medical_notes: patient.medical_notes,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, phone, address, medical_notes } = req.body

    const userUpdates = {}
    if (firstName) userUpdates.first_name = firstName
    if (lastName) userUpdates.last_name = lastName
    if (phone !== undefined) userUpdates.phone_number = phone

    if (Object.keys(userUpdates).length) {
      await prisma.user.update({ where: { user_id: req.user.userId }, data: userUpdates })
    }

    const patientUpdates = {}
    if (address !== undefined) patientUpdates.address = address
    if (medical_notes !== undefined) patientUpdates.medical_notes = medical_notes

    if (Object.keys(patientUpdates).length) {
      await prisma.patient.update({ where: { patient_id: req.user.userId }, data: patientUpdates })
    }

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'UPDATE_PROFILE',
        entity_type: 'Patient',
        entity_id: req.user.userId,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.json({ message: 'Profile updated' })
  } catch (err) {
    next(err)
  }
}

export async function getAppointments(req, res, next) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { patient_id: req.user.userId },
      include: {
        doctor: { include: { user: true } },
        prescriptions: true,
      },
      orderBy: [{ appointment_date: 'desc' }, { start_time: 'desc' }],
    })

    res.json(appointments.map(a => ({
      id: a.appointment_id,
      date: a.appointment_date,
      start_time: fmtTime(a.start_time),
      end_time: fmtTime(a.end_time),
      status: a.status,
      reason: a.reason,
      notes: a.notes,
      doctor: {
        id: a.doctor_id,
        name: `Dr. ${a.doctor.user.first_name} ${a.doctor.user.last_name}`,
        specialisation: a.doctor.specialisation,
        department: a.doctor.department,
      },
      prescription_count: a.prescriptions.length,
    })))
  } catch (err) {
    next(err)
  }
}

export async function getPrescriptions(req, res, next) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { patient_id: req.user.userId },
      include: {
        prescriptions: {
          include: { pharmacist: { include: { user: true } } },
        },
        doctor: { include: { user: true } },
      },
    })

    const prescriptions = appointments.flatMap(a =>
      a.prescriptions.map(p => ({
        id: p.prescription_id,
        medication_name: p.medication_name,
        dosage: p.dosage,
        instructions: p.instructions,
        prescribed_date: p.prescribed_date,
        status: p.status,
        doctor: `Dr. ${a.doctor.user.first_name} ${a.doctor.user.last_name}`,
        appointment_date: a.appointment_date,
        pharmacist: p.pharmacist
          ? `${p.pharmacist.user.first_name} ${p.pharmacist.user.last_name}`
          : null,
      }))
    )

    res.json(prescriptions)
  } catch (err) {
    next(err)
  }
}

export async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password required' })
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' })
    }

    const user = await prisma.user.findUnique({ where: { user_id: req.user.userId } })
    const valid = await bcrypt.compare(current_password, user.password_hash)
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' })

    const hash = await bcrypt.hash(new_password, 12)
    await prisma.user.update({ where: { user_id: req.user.userId }, data: { password_hash: hash } })

    await prisma.auditLog.create({
      data: {
        user_id:     req.user.userId,
        action:      'CHANGE_PASSWORD',
        entity_type: 'User',
        entity_id:   req.user.userId,
        ip_address:  req.ip || '0.0.0.0',
      },
    })

    res.json({ message: 'Password changed' })
  } catch (err) {
    next(err)
  }
}

export async function exportMyData(req, res, next) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { patient_id: req.user.userId },
      include: {
        user: true,
        appointments: {
          include: {
            doctor: { include: { user: true } },
            prescriptions: true,
          },
        },
        consent_records: true,
      },
    })
    if (!patient) return res.status(404).json({ error: 'Patient not found' })

    await prisma.auditLog.create({
      data: {
        user_id:     req.user.userId,
        action:      'EXPORT_PERSONAL_DATA',
        entity_type: 'Patient',
        entity_id:   req.user.userId,
        details:     'Article 15 data export',
        ip_address:  req.ip || '0.0.0.0',
      },
    })

    const payload = {
      exported_at:  new Date().toISOString(),
      gdpr_article: 'Article 15 – Right to Access',
      personal_data: {
        email:           patient.user.email,
        first_name:      patient.user.first_name,
        last_name:       patient.user.last_name,
        phone_number:    patient.user.phone_number,
        date_of_birth:   patient.date_of_birth,
        gender:          patient.gender,
        address:         patient.address,
        nhs_number:      patient.nhs_number,
        account_created: patient.user.created_at,
      },
      appointments: patient.appointments.map(a => ({
        date:   a.appointment_date,
        status: a.status,
        reason: a.reason,
        notes:  a.notes,
        doctor: `Dr. ${a.doctor.user.first_name} ${a.doctor.user.last_name}`,
        prescriptions: a.prescriptions.map(p => ({
          medication:     p.medication_name,
          dosage:         p.dosage,
          instructions:   p.instructions,
          prescribed_date: p.prescribed_date,
          status:         p.status,
        })),
      })),
      consent_records: patient.consent_records.map(c => ({
        type:       c.consent_type,
        is_granted: c.is_granted,
        granted_at: c.granted_at,
        revoked_at: c.revoked_at,
        version:    c.version,
      })),
    }

    const dateStr = new Date().toISOString().split('T')[0]
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="medly-my-data-${dateStr}.json"`)
    res.json(payload)
  } catch (err) {
    next(err)
  }
}

export async function getMyActivity(req, res, next) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { user_id: req.user.userId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    })
    res.json(logs.map(l => ({
      id:          l.log_id,
      action:      l.action,
      entity_type: l.entity_type,
      details:     l.details,
      ip_address:  l.ip_address,
      timestamp:   l.timestamp,
    })))
  } catch (err) {
    next(err)
  }
}

export async function deleteMyAccount(req, res, next) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id:     req.user.userId,
        action:      'DELETE_ACCOUNT',
        entity_type: 'User',
        entity_id:   req.user.userId,
        details:     'Article 17 – Right to Erasure (self-requested)',
        ip_address:  req.ip || '0.0.0.0',
      },
    })

    await prisma.user.update({
      where: { user_id: req.user.userId },
      data:  { deleted_at: new Date(), is_active: false },
    })

    res.json({ message: 'Account deleted' })
  } catch (err) {
    next(err)
  }
}

export async function getConsent(req, res, next) {
  try {
    const records = await prisma.consentRecord.findMany({
      where: { patient_id: req.user.userId },
      orderBy: { granted_at: 'desc' },
    })
    res.json(records)
  } catch (err) {
    next(err)
  }
}

export async function grantConsent(req, res, next) {
  try {
    const { consent_type, version = '1.0' } = req.body
    if (!consent_type) return res.status(400).json({ error: 'consent_type required' })

    const record = await prisma.consentRecord.create({
      data: {
        patient_id: req.user.userId,
        consent_type,
        is_granted: true,
        version,
      },
    })

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'GRANT_CONSENT',
        entity_type: 'ConsentRecord',
        entity_id: record.consent_id,
        details: consent_type,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.status(201).json(record)
  } catch (err) {
    next(err)
  }
}

export async function revokeConsent(req, res, next) {
  try {
    const record = await prisma.consentRecord.findUnique({ where: { consent_id: req.params.id } })
    if (!record || record.patient_id !== req.user.userId) {
      return res.status(404).json({ error: 'Consent record not found' })
    }

    const updated = await prisma.consentRecord.update({
      where: { consent_id: req.params.id },
      data: { is_granted: false, revoked_at: new Date() },
    })

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'REVOKE_CONSENT',
        entity_type: 'ConsentRecord',
        entity_id: req.params.id,
        details: record.consent_type,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
}
