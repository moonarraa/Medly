import prisma from '../db.js'

export async function createPrescription(req, res, next) {
  try {
    const { appointment_id, medication_name, dosage, instructions } = req.body
    if (!appointment_id || !medication_name || !dosage || !instructions) {
      return res.status(400).json({ error: 'appointment_id, medication_name, dosage, instructions required' })
    }

    const appt = await prisma.appointment.findUnique({ where: { appointment_id } })
    if (!appt || appt.doctor_id !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const prescription = await prisma.prescription.create({
      data: { appointment_id, medication_name, dosage, instructions },
    })

    await prisma.notification.create({
      data: {
        user_id: appt.patient_id,
        appointment_id,
        type: 'PRESCRIPTION_READY',
        channel: 'IN_APP',
        message_content: `A prescription for ${medication_name} has been issued.`,
        delivery_status: 'DELIVERED',
      },
    })

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'CREATE_PRESCRIPTION',
        entity_type: 'Prescription',
        entity_id: prescription.prescription_id,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.status(201).json(prescription)
  } catch (err) {
    next(err)
  }
}

export async function getPharmacistQueue(req, res, next) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        OR: [{ pharmacist_id: req.user.userId }, { status: 'PENDING' }],
      },
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
      },
      orderBy: { prescribed_date: 'desc' },
    })

    res.json(prescriptions.map(p => ({
      id: p.prescription_id,
      medication_name: p.medication_name,
      dosage: p.dosage,
      instructions: p.instructions,
      prescribed_date: p.prescribed_date,
      status: p.status,
      patient: {
        name: `${p.appointment.patient.user.first_name} ${p.appointment.patient.user.last_name}`,
        nhs_number: p.appointment.patient.nhs_number,
      },
      doctor: `Dr. ${p.appointment.doctor.user.first_name} ${p.appointment.doctor.user.last_name}`,
    })))
  } catch (err) {
    next(err)
  }
}

export async function dispensePrescription(req, res, next) {
  try {
    const { id } = req.params

    const prescription = await prisma.prescription.findUnique({ where: { prescription_id: id } })
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' })
    if (prescription.status !== 'PENDING') {
      return res.status(400).json({ error: 'Prescription is not pending' })
    }

    const updated = await prisma.prescription.update({
      where: { prescription_id: id },
      data: { status: 'DISPENSED', pharmacist_id: req.user.userId },
    })

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'DISPENSE_PRESCRIPTION',
        entity_type: 'Prescription',
        entity_id: id,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function getDoctorPrescriptions(req, res, next) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { appointment: { doctor_id: req.user.userId } },
      include: {
        appointment: {
          include: { patient: { include: { user: true } } },
        },
      },
      orderBy: { prescribed_date: 'desc' },
    })

    res.json(prescriptions.map(p => ({
      id: p.prescription_id,
      medication_name: p.medication_name,
      dosage: p.dosage,
      instructions: p.instructions,
      prescribed_date: p.prescribed_date,
      status: p.status,
      patient: `${p.appointment.patient.user.first_name} ${p.appointment.patient.user.last_name}`,
    })))
  } catch (err) {
    next(err)
  }
}
