import prisma from '../db.js'

function fmtTime(d) {
  if (!d) return null
  const date = new Date(d)
  const h = date.getUTCHours().toString().padStart(2, '0')
  const m = date.getUTCMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function timeOnly(str) {
  return new Date(`1970-01-01T${str}:00.000Z`)
}

export async function bookAppointment(req, res, next) {
  try {
    const { doctor_id, availability_id, appointment_date, start_time, end_time, reason } = req.body

    if (!doctor_id || !appointment_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'doctor_id, appointment_date, start_time, end_time required' })
    }

    const patient = await prisma.patient.findUnique({ where: { patient_id: req.user.userId } })
    if (!patient) return res.status(404).json({ error: 'Patient record not found' })

    const appointment = await prisma.appointment.create({
      data: {
        patient_id: req.user.userId,
        doctor_id,
        availability_id: availability_id || null,
        appointment_date: new Date(appointment_date),
        start_time: timeOnly(start_time),
        end_time: timeOnly(end_time),
        reason: reason || 'General consultation',
        status: 'SCHEDULED',
      },
    })

    await prisma.notification.create({
      data: {
        user_id: req.user.userId,
        appointment_id: appointment.appointment_id,
        type: 'APPOINTMENT_CONFIRMATION',
        channel: 'IN_APP',
        message_content: `Your appointment on ${appointment_date} at ${start_time} has been booked.`,
        delivery_status: 'DELIVERED',
      },
    })

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'BOOK_APPOINTMENT',
        entity_type: 'Appointment',
        entity_id: appointment.appointment_id,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.status(201).json({
      id: appointment.appointment_id,
      date: appointment.appointment_date,
      start_time: fmtTime(appointment.start_time),
      end_time: fmtTime(appointment.end_time),
      status: appointment.status,
      reason: appointment.reason,
    })
  } catch (err) {
    next(err)
  }
}

export async function getAppointment(req, res, next) {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { appointment_id: req.params.id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        prescriptions: true,
      },
    })
    if (!appt) return res.status(404).json({ error: 'Appointment not found' })

    const { role, userId } = req.user
    if (role === 'PATIENT' && appt.patient_id !== userId) return res.status(403).json({ error: 'Forbidden' })
    if (role === 'DOCTOR' && appt.doctor_id !== userId) return res.status(403).json({ error: 'Forbidden' })

    res.json({
      id: appt.appointment_id,
      date: appt.appointment_date,
      start_time: fmtTime(appt.start_time),
      end_time: fmtTime(appt.end_time),
      status: appt.status,
      reason: appt.reason,
      notes: appt.notes,
      patient: {
        id: appt.patient_id,
        name: `${appt.patient.user.first_name} ${appt.patient.user.last_name}`,
        nhs_number: appt.patient.nhs_number,
        date_of_birth: appt.patient.date_of_birth,
      },
      doctor: {
        id: appt.doctor_id,
        name: `Dr. ${appt.doctor.user.first_name} ${appt.doctor.user.last_name}`,
        specialisation: appt.doctor.specialisation,
      },
      prescriptions: appt.prescriptions.map(p => ({
        id: p.prescription_id,
        medication_name: p.medication_name,
        dosage: p.dosage,
        instructions: p.instructions,
        status: p.status,
      })),
    })
  } catch (err) {
    next(err)
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const appt = await prisma.appointment.findUnique({ where: { appointment_id: id } })
    if (!appt) return res.status(404).json({ error: 'Appointment not found' })

    if (req.user.role === 'DOCTOR' && appt.doctor_id !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const data = { status }
    if (notes !== undefined) data.notes = notes

    const updated = await prisma.appointment.update({ where: { appointment_id: id }, data })

    if (status === 'CANCELLED') {
      await prisma.notification.create({
        data: {
          user_id: appt.patient_id,
          appointment_id: id,
          type: 'APPOINTMENT_CANCELLATION',
          channel: 'IN_APP',
          message_content: 'Your appointment has been cancelled.',
          delivery_status: 'DELIVERED',
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: `APPOINTMENT_${status}`,
        entity_type: 'Appointment',
        entity_id: id,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.json({ id: updated.appointment_id, status: updated.status })
  } catch (err) {
    next(err)
  }
}

export async function cancelAppointment(req, res, next) {
  try {
    const { id } = req.params

    const appt = await prisma.appointment.findUnique({ where: { appointment_id: id } })
    if (!appt) return res.status(404).json({ error: 'Appointment not found' })

    if (appt.patient_id !== req.user.userId) return res.status(403).json({ error: 'Forbidden' })

    if (['COMPLETED', 'CANCELLED'].includes(appt.status)) {
      return res.status(400).json({ error: `Cannot cancel a ${appt.status.toLowerCase()} appointment` })
    }

    await prisma.appointment.update({
      where: { appointment_id: id },
      data: { status: 'CANCELLED' },
    })

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'CANCEL_APPOINTMENT',
        entity_type: 'Appointment',
        entity_id: id,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.json({ message: 'Appointment cancelled' })
  } catch (err) {
    next(err)
  }
}
