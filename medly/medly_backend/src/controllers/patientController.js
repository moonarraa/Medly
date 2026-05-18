import prisma from '../db.js'

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
