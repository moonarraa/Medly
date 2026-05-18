import prisma from '../db.js'

const DAY_MAP = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

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

export async function listDoctors(req, res, next) {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { user: true, availabilities: true },
      where: { user: { deleted_at: null, is_active: true } },
    })

    res.json(doctors.map(d => ({
      id: d.doctor_id,
      name: `Dr. ${d.user.first_name} ${d.user.last_name}`,
      initials: (d.user.first_name[0] + d.user.last_name[0]).toUpperCase(),
      specialisation: d.specialisation,
      department: d.department,
      email: d.user.email,
      available_days: [...new Set(d.availabilities.map(a => a.day_of_week))],
    })))
  } catch (err) {
    next(err)
  }
}

export async function getDoctorAvailability(req, res, next) {
  try {
    const { id } = req.params
    const { date } = req.query

    const where = { doctor_id: id, is_available: true }
    if (date) {
      where.day_of_week = DAY_MAP[new Date(date + 'T12:00:00Z').getUTCDay()]
    }

    const slots = await prisma.availability.findMany({ where })

    res.json(slots.map(s => ({
      id: s.availability_id,
      day_of_week: s.day_of_week,
      start_time: fmtTime(s.start_time),
      end_time: fmtTime(s.end_time),
    })))
  } catch (err) {
    next(err)
  }
}

export async function getMyProfile(req, res, next) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { doctor_id: req.user.userId },
      include: { user: true },
    })
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

    res.json({
      id: doctor.doctor_id,
      name: `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`,
      email: doctor.user.email,
      specialisation: doctor.specialisation,
      department: doctor.department,
      license_number: doctor.license_number,
    })
  } catch (err) {
    next(err)
  }
}

export async function getMyAppointments(req, res, next) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { doctor_id: req.user.userId },
      include: { patient: { include: { user: true } } },
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
      patient: {
        id: a.patient_id,
        name: `${a.patient.user.first_name} ${a.patient.user.last_name}`,
        nhs_number: a.patient.nhs_number,
      },
    })))
  } catch (err) {
    next(err)
  }
}

export async function getMyAvailability(req, res, next) {
  try {
    const slots = await prisma.availability.findMany({
      where: { doctor_id: req.user.userId },
      orderBy: { day_of_week: 'asc' },
    })

    res.json(slots.map(s => ({
      id: s.availability_id,
      day_of_week: s.day_of_week,
      start_time: fmtTime(s.start_time),
      end_time: fmtTime(s.end_time),
      is_available: s.is_available,
    })))
  } catch (err) {
    next(err)
  }
}

export async function createAvailability(req, res, next) {
  try {
    const { day_of_week, start_time, end_time } = req.body
    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({ error: 'day_of_week, start_time, end_time required' })
    }

    const slot = await prisma.availability.create({
      data: {
        doctor_id: req.user.userId,
        day_of_week,
        start_time: timeOnly(start_time),
        end_time: timeOnly(end_time),
      },
    })

    res.status(201).json({
      id: slot.availability_id,
      day_of_week: slot.day_of_week,
      start_time: fmtTime(slot.start_time),
      end_time: fmtTime(slot.end_time),
      is_available: slot.is_available,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateAvailability(req, res, next) {
  try {
    const { id } = req.params
    const slot = await prisma.availability.findUnique({ where: { availability_id: id } })
    if (!slot || slot.doctor_id !== req.user.userId) {
      return res.status(404).json({ error: 'Availability slot not found' })
    }

    const data = {}
    if (req.body.day_of_week) data.day_of_week = req.body.day_of_week
    if (req.body.start_time) data.start_time = timeOnly(req.body.start_time)
    if (req.body.end_time) data.end_time = timeOnly(req.body.end_time)
    if (req.body.is_available !== undefined) data.is_available = req.body.is_available

    const updated = await prisma.availability.update({ where: { availability_id: id }, data })

    res.json({
      id: updated.availability_id,
      day_of_week: updated.day_of_week,
      start_time: fmtTime(updated.start_time),
      end_time: fmtTime(updated.end_time),
      is_available: updated.is_available,
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteAvailability(req, res, next) {
  try {
    const { id } = req.params
    const slot = await prisma.availability.findUnique({ where: { availability_id: id } })
    if (!slot || slot.doctor_id !== req.user.userId) {
      return res.status(404).json({ error: 'Availability slot not found' })
    }

    await prisma.availability.delete({ where: { availability_id: id } })
    res.json({ message: 'Slot deleted' })
  } catch (err) {
    next(err)
  }
}

export async function getMyPatients(req, res, next) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { doctor_id: req.user.userId },
      include: { patient: { include: { user: true } } },
      distinct: ['patient_id'],
    })

    res.json(appointments.map(a => ({
      id: a.patient_id,
      name: `${a.patient.user.first_name} ${a.patient.user.last_name}`,
      email: a.patient.user.email,
      nhs_number: a.patient.nhs_number,
      date_of_birth: a.patient.date_of_birth,
      gender: a.patient.gender,
      address: a.patient.address,
    })))
  } catch (err) {
    next(err)
  }
}
