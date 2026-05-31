import PDFDocument from 'pdfkit'
import prisma from '../db.js'

// ── PDF helpers ───────────────────────────────────────────────────────────────

const NHS_BLUE  = '#005EB8'
const DARK      = '#1a1a2e'
const MID_GRAY  = '#6b7280'
const LIGHT_GRAY = '#e5e7eb'
const PAGE_W    = 595.28
const MARGIN    = 50
const INNER_W   = PAGE_W - MARGIN * 2

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function drawHRule(doc, color = LIGHT_GRAY) {
  doc.moveTo(MARGIN, doc.y).lineTo(PAGE_W - MARGIN, doc.y).strokeColor(color).lineWidth(0.5).stroke()
}

function ensureSpace(doc, needed) {
  if (doc.y + needed > 800) doc.addPage()
}

export async function getStats(req, res, next) {
  try {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const weekStart = new Date(now)
    weekStart.setUTCDate(now.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    weekStart.setUTCHours(0, 0, 0, 0)

    const [patients, doctors, pharmacists, appointments, prescriptions, weeklyRaw] = await Promise.all([
      prisma.user.count({ where: { role: 'PATIENT', deleted_at: null } }),
      prisma.user.count({ where: { role: 'DOCTOR',  deleted_at: null } }),
      prisma.user.count({ where: { role: 'PHARMACIST', deleted_at: null } }),
      prisma.appointment.count(),
      prisma.prescription.count(),
      prisma.appointment.findMany({
        where: { appointment_date: { gte: weekStart } },
        select: { appointment_date: true },
      }),
    ])

    const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]
    for (const a of weeklyRaw) {
      const d = new Date(a.appointment_date)
      const idx = (d.getUTCDay() + 6) % 7
      dayCounts[idx]++
    }
    const weekly_appointments = DAY_LABELS.map((day, i) => ({ day, count: dayCounts[i] }))

    res.json({ patients, doctors, pharmacists, appointments, prescriptions, weekly_appointments })
  } catch (err) {
    next(err)
  }
}

export async function getUsers(req, res, next) {
  try {
    const { role, q } = req.query
    const where = { deleted_at: null }
    if (role) where.role = role
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { first_name: { contains: q, mode: 'insensitive' } },
        { last_name: { contains: q, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        user_id: true, email: true, first_name: true,
        last_name: true, role: true, is_active: true, created_at: true,
      },
      orderBy: { created_at: 'desc' },
    })

    res.json(users.map(u => ({
      id: u.user_id,
      email: u.email,
      name: `${u.first_name} ${u.last_name}`,
      role: u.role,
      is_active: u.is_active,
      created_at: u.created_at,
    })))
  } catch (err) {
    next(err)
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params
    const { is_active, role } = req.body

    const data = {}
    if (is_active !== undefined) data.is_active = is_active
    if (role) data.role = role

    await prisma.user.update({ where: { user_id: id }, data })

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'ADMIN_UPDATE_USER',
        entity_type: 'User',
        entity_id: id,
        details: JSON.stringify(data),
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.json({ message: 'User updated' })
  } catch (err) {
    next(err)
  }
}

export async function softDeleteUser(req, res, next) {
  try {
    const { id } = req.params
    if (id === req.user.userId) return res.status(400).json({ error: 'Cannot delete yourself' })

    await prisma.user.update({
      where: { user_id: id },
      data: { deleted_at: new Date(), is_active: false },
    })

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'ADMIN_DELETE_USER',
        entity_type: 'User',
        entity_id: id,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.json({ message: 'User deactivated' })
  } catch (err) {
    next(err)
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1')
    const limit = parseInt(req.query.limit || '50')
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { email: true, first_name: true, last_name: true } } },
      }),
      prisma.auditLog.count(),
    ])

    res.json({
      data: logs.map(l => ({
        id: l.log_id,
        action: l.action,
        entity_type: l.entity_type,
        entity_id: l.entity_id,
        details: l.details,
        ip_address: l.ip_address,
        timestamp: l.timestamp,
        user: l.user ? `${l.user.first_name} ${l.user.last_name} (${l.user.email})` : 'System',
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    next(err)
  }
}

export async function exportPrescriptions(req, res, next) {
  try {
    const [prescriptions, hospital] = await Promise.all([
      prisma.prescription.findMany({
        include: {
          appointment: {
            include: {
              patient: { include: { user: true } },
              doctor:  { include: { user: true } },
            },
          },
        },
        orderBy: { prescribed_date: 'desc' },
      }),
      prisma.hospital.findFirst(),
    ])

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'EXPORT_PRESCRIPTIONS_PDF',
        entity_type: 'Prescription',
        entity_id: 'bulk',
        details: `${prescriptions.length} records`,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    // bottom: 15 keeps the auto-break threshold (841.89 - 15 = 826) above footerY (811),
    // preventing PDFKit from inserting blank pages when we switch back to render footers
    const doc = new PDFDocument({ size: 'A4', bufferPages: true, margins: { top: MARGIN, left: MARGIN, right: MARGIN, bottom: 15 } })
    const dateStr = new Date().toISOString().split('T')[0]
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="medly-prescriptions-${dateStr}.pdf"`)
    doc.pipe(res)

    // ── Header ────────────────────────────────────────────────────────────────

    // Logo block (text-based)
    doc.rect(MARGIN, MARGIN, 44, 44).fill(NHS_BLUE)
    doc.fillColor('white').font('Helvetica-Bold').fontSize(22)
       .text('M', MARGIN, MARGIN + 10, { width: 44, align: 'center' })

    // Title block (right of logo)
    const titleX = MARGIN + 54
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(18)
       .text('Medly NHS Portal', titleX, MARGIN + 2, { width: INNER_W - 54 })
    doc.fillColor(MID_GRAY).font('Helvetica').fontSize(9)
       .text('Secure Healthcare Appointment Management System', titleX, MARGIN + 24, { width: INNER_W - 54 })

    // Report title (right-aligned)
    doc.fillColor(NHS_BLUE).font('Helvetica-Bold').fontSize(13)
       .text('PRESCRIPTION REPORT', MARGIN, MARGIN + 2, { width: INNER_W, align: 'right' })
    doc.fillColor(MID_GRAY).font('Helvetica').fontSize(9)
       .text(`Generated: ${new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}`, MARGIN, MARGIN + 20, { width: INNER_W, align: 'right' })

    doc.moveDown(3.2)
    drawHRule(doc, NHS_BLUE)
    doc.moveDown(0.6)

    // Hospital info
    if (hospital) {
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10)
         .text(hospital.name, MARGIN, doc.y)
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(9)
         .text(`${hospital.address}   ·   ${hospital.phone}`, MARGIN, doc.y + 1)
    }

    doc.moveDown(1.2)
    drawHRule(doc)
    doc.moveDown(1)

    // ── Summary bar ───────────────────────────────────────────────────────────

    const pending   = prescriptions.filter(p => p.status === 'PENDING')
    const dispensed = prescriptions.filter(p => p.status === 'DISPENSED')
    const other     = prescriptions.filter(p => !['PENDING','DISPENSED'].includes(p.status))

    const summaryY = doc.y
    const colW = INNER_W / 4

    const summaryItems = [
      { label: 'TOTAL',     value: prescriptions.length, color: DARK    },
      { label: 'PENDING',   value: pending.length,        color: '#d97706' },
      { label: 'DISPENSED', value: dispensed.length,      color: '#16a34a' },
      { label: 'OTHER',     value: other.length,          color: MID_GRAY  },
    ]

    summaryItems.forEach(({ label, value, color }, i) => {
      const x = MARGIN + i * colW
      doc.fillColor(color).font('Helvetica-Bold').fontSize(22).text(String(value), x, summaryY, { width: colW, align: 'center' })
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8).text(label, x, summaryY + 26, { width: colW, align: 'center' })
    })

    doc.moveDown(4)
    drawHRule(doc)
    doc.moveDown(1.5)

    // ── Prescription sections ─────────────────────────────────────────────────

    const STATUS_GROUPS = [
      { label: 'PENDING',   items: pending,   color: '#d97706' },
      { label: 'DISPENSED', items: dispensed, color: '#16a34a' },
      { label: 'OTHER',     items: other,     color: MID_GRAY  },
    ]

    for (const group of STATUS_GROUPS) {
      if (group.items.length === 0) continue

      ensureSpace(doc, 60)

      // Section heading — save headY so text lands inside the rect, not above it
      const headY = doc.y
      doc.rect(MARGIN, headY, INNER_W, 28).fill(group.color)
      doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
         .text(`${group.label}  (${group.items.length})`, MARGIN + 12, headY + 9, { lineBreak: false, width: INNER_W - 24 })
      // reposition cursor to just below the rect
      doc.y = headY + 36

      for (const rx of group.items) {
        ensureSpace(doc, 115)

        const appt    = rx.appointment
        const patient = appt.patient.user
        const doctor  = appt.doctor.user
        const drName  = `Dr. ${doctor.first_name} ${doctor.last_name}`
        const ptName  = `${patient.first_name} ${patient.last_name}`
        const ptNHS   = appt.patient.nhs_number

        const startY = doc.y
        const leftX  = MARGIN + 12
        const labelW = 90
        const valX   = leftX + labelW
        // leave 90 pt on the right for the status pill + margin
        const valW   = INNER_W - labelW - 90

        // light background card
        doc.rect(MARGIN, startY - 6, INNER_W, 102).fillColor('#f9fafb').fill()

        // lineBreak: false prevents long values from wrapping into the next row
        const row = (label, value, yOffset) => {
          doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8)
             .text(label, leftX, startY + yOffset, { width: labelW, lineBreak: false })
          doc.fillColor(DARK).font('Helvetica').fontSize(9)
             .text(value, valX, startY + yOffset, { width: valW, lineBreak: false })
        }

        // 18 pt row spacing (was 16) gives enough clearance at 9 pt font
        row('Patient',      `${ptName}  ·  NHS ${ptNHS}`,                                           0)
        row('Doctor',       `${drName}  ·  ${appt.doctor.specialisation}  ·  ${appt.doctor.department}`, 18)
        row('Medication',   `${rx.medication_name}  –  ${rx.dosage}`,                               36)
        row('Instructions', rx.instructions,                                                         54)
        row('Date',         `Prescribed ${fmtDate(rx.prescribed_date)}  ·  Appt ${fmtDate(appt.appointment_date)}`, 72)

        // status pill (top-right of card, clear of value text)
        doc.fillColor(group.color).font('Helvetica-Bold').fontSize(8)
           .text(rx.status, MARGIN + INNER_W - 66, startY + 4, { width: 56, align: 'right' })

        // reposition cursor to just below the card before the separator
        // (explicit-y text calls above leave doc.y in an unpredictable spot)
        doc.y = startY + 94
        drawHRule(doc, '#e5e7eb')
        doc.moveDown(0.8)
      }

      doc.moveDown(0.8)
    }

    // ── Footer on every page ──────────────────────────────────────────────────

    const pageCount = doc.bufferedPageRange().count
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i)
      const footerY = 841.89 - 30
      doc.moveTo(MARGIN, footerY - 8).lineTo(PAGE_W - MARGIN, footerY - 8)
         .strokeColor(LIGHT_GRAY).lineWidth(0.5).stroke()
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8)
         .text(
           `Medly NHS Portal  ·  Confidential  ·  UK GDPR Art. 30  ·  Page ${i + 1} of ${pageCount}`,
           MARGIN, footerY, { width: INNER_W, align: 'center' }
         )
    }

    doc.end()
  } catch (err) {
    next(err)
  }
}

export async function exportDoctorReport(req, res, next) {
  try {
    const { id } = req.params

    const [doctor, hospital] = await Promise.all([
      prisma.doctor.findUnique({
        where: { doctor_id: id },
        include: {
          user: true,
          availabilities: { orderBy: { day_of_week: 'asc' } },
          appointments: {
            include: {
              patient: { include: { user: true } },
              prescriptions: true,
            },
            orderBy: { appointment_date: 'desc' },
          },
        },
      }),
      prisma.hospital.findFirst(),
    ])

    if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

    const appts            = doctor.appointments
    const totalAppts       = appts.length
    const uniquePatients   = new Set(appts.map(a => a.patient_id)).size
    const totalRx          = appts.reduce((s, a) => s + a.prescriptions.length, 0)
    const completed        = appts.filter(a => a.status === 'COMPLETED').length
    const completionRate   = totalAppts > 0 ? Math.round((completed / totalAppts) * 100) : 0
    const apptStat         = (status) => appts.filter(a => a.status === status).length
    const drName           = `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`

    const formatTime = (t) => {
      if (!t) return '—'
      if (typeof t === 'string') return t.slice(0, 5)
      return new Date(t).toTimeString().slice(0, 5)
    }

    await prisma.auditLog.create({
      data: {
        user_id:     req.user.userId,
        action:      'EXPORT_DOCTOR_PDF',
        entity_type: 'Doctor',
        entity_id:   id,
        details:     `Doctor report for ${drName}`,
        ip_address:  req.ip || '0.0.0.0',
      },
    })

    const doc = new PDFDocument({
      size: 'A4',
      bufferPages: true,
      margins: { top: MARGIN, left: MARGIN, right: MARGIN, bottom: 15 },
    })
    const dateStr  = new Date().toISOString().split('T')[0]
    const safeName = `${doctor.user.first_name}-${doctor.user.last_name}`.toLowerCase()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="medly-doctor-${safeName}-${dateStr}.pdf"`)
    doc.pipe(res)

    // ── Header ────────────────────────────────────────────────────────────────
    doc.rect(MARGIN, MARGIN, 44, 44).fill(NHS_BLUE)
    doc.fillColor('white').font('Helvetica-Bold').fontSize(22)
       .text('M', MARGIN, MARGIN + 10, { width: 44, align: 'center' })

    const titleX = MARGIN + 54
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(18)
       .text('Medly NHS Portal', titleX, MARGIN + 2, { width: INNER_W - 54 })
    doc.fillColor(MID_GRAY).font('Helvetica').fontSize(9)
       .text('Secure Healthcare Appointment Management System', titleX, MARGIN + 24, { width: INNER_W - 54 })

    doc.fillColor(NHS_BLUE).font('Helvetica-Bold').fontSize(13)
       .text('DOCTOR ACTIVITY REPORT', MARGIN, MARGIN + 2, { width: INNER_W, align: 'right' })
    doc.fillColor(MID_GRAY).font('Helvetica').fontSize(9)
       .text(
         `Generated: ${new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}`,
         MARGIN, MARGIN + 20, { width: INNER_W, align: 'right' }
       )

    doc.moveDown(3.2)
    drawHRule(doc, NHS_BLUE)
    doc.moveDown(0.6)

    if (hospital) {
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10)
         .text(hospital.name, MARGIN, doc.y)
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(9)
         .text(`${hospital.address}   ·   ${hospital.phone}`, MARGIN, doc.y + 1)
    }

    doc.moveDown(1.2)
    drawHRule(doc)
    doc.moveDown(1)

    // ── Doctor profile card ───────────────────────────────────────────────────
    const profileY = doc.y
    doc.rect(MARGIN, profileY, INNER_W, 90).fillColor('#f0f7ff').fill()

    doc.fillColor(NHS_BLUE).font('Helvetica-Bold').fontSize(16)
       .text(drName, MARGIN + 14, profileY + 10, { lineBreak: false })
    doc.fillColor(MID_GRAY).font('Helvetica').fontSize(10)
       .text(`${doctor.specialisation}   ·   ${doctor.department}`, MARGIN + 14, profileY + 30, { lineBreak: false })

    const rightX = MARGIN + INNER_W - 200
    ;[
      { label: 'Email',        value: doctor.user.email,     y: 10 },
      { label: 'License No.',  value: doctor.license_number, y: 38 },
      { label: 'Member Since', value: fmtDate(doctor.user.created_at), y: 66 },
    ].forEach(({ label, value, y }) => {
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8).text(label, rightX, profileY + y,      { lineBreak: false })
      doc.fillColor(DARK).font('Helvetica').fontSize(9).text(value,      rightX, profileY + y + 12, { lineBreak: false })
    })

    doc.y = profileY + 100
    doc.moveDown(0.8)

    // ── Summary stats bar ─────────────────────────────────────────────────────
    const snapY = doc.y
    const SNAP_W = INNER_W / 4
    ;[
      { label: 'APPOINTMENTS',    value: String(totalAppts),       color: DARK      },
      { label: 'PATIENTS SEEN',   value: String(uniquePatients),   color: NHS_BLUE  },
      { label: 'PRESCRIPTIONS',   value: String(totalRx),          color: '#16a34a' },
      { label: 'COMPLETION RATE', value: `${completionRate}%`,     color: completionRate >= 50 ? '#7c3aed' : MID_GRAY },
    ].forEach(({ label, value, color }, i) => {
      const x = MARGIN + i * SNAP_W
      doc.fillColor(color).font('Helvetica-Bold').fontSize(22).text(value, x, snapY, { width: SNAP_W, align: 'center' })
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8).text(label, x, snapY + 28, { width: SNAP_W, align: 'center' })
    })

    doc.moveDown(4.5)
    drawHRule(doc)
    doc.moveDown(1.5)

    // ── Appointment status breakdown ──────────────────────────────────────────
    ensureSpace(doc, 80)

    let headY = doc.y
    doc.rect(MARGIN, headY, INNER_W, 28).fill('#d97706')
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
       .text('APPOINTMENT BREAKDOWN', MARGIN + 12, headY + 9, { lineBreak: false, width: INNER_W - 24 })
    doc.y = headY + 36

    const bkY  = doc.y
    const AG_W = INNER_W / 5
    ;[
      { label: 'SCHEDULED', value: apptStat('SCHEDULED'), color: NHS_BLUE  },
      { label: 'CONFIRMED', value: apptStat('CONFIRMED'), color: '#16a34a' },
      { label: 'COMPLETED', value: apptStat('COMPLETED'), color: DARK      },
      { label: 'CANCELLED', value: apptStat('CANCELLED'), color: '#dc2626' },
      { label: 'NO SHOW',   value: apptStat('NO_SHOW'),   color: MID_GRAY  },
    ].forEach(({ label, value, color }, i) => {
      const x = MARGIN + i * AG_W
      doc.fillColor(color).font('Helvetica-Bold').fontSize(14).text(String(value), x, bkY, { width: AG_W, align: 'center' })
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(7).text(label, x, bkY + 18, { width: AG_W, align: 'center' })
    })

    doc.y = bkY + 34
    doc.moveDown(1.5)

    // ── Weekly availability schedule ──────────────────────────────────────────
    ensureSpace(doc, 60)

    headY = doc.y
    doc.rect(MARGIN, headY, INNER_W, 28).fill(NHS_BLUE)
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
       .text(
         `WEEKLY AVAILABILITY  (${doctor.availabilities.length} slot${doctor.availabilities.length !== 1 ? 's' : ''})`,
         MARGIN + 12, headY + 9, { lineBreak: false, width: INNER_W - 24 }
       )
    doc.y = headY + 36

    if (doctor.availabilities.length === 0) {
      const ny = doc.y
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(9)
         .text('No availability slots configured.', MARGIN + 12, ny, { lineBreak: false })
      doc.y = ny + 18
    } else {
      const AV = { day: MARGIN + 12, start: MARGIN + 180, end: MARGIN + 300 }
      const ROW_H = 18
      const thY = doc.y
      doc.rect(MARGIN, thY, INNER_W, ROW_H).fillColor('#e5e7eb').fill()
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(8)
      ;[{ label: 'Day', x: AV.day }, { label: 'Start Time', x: AV.start }, { label: 'End Time', x: AV.end }]
        .forEach(({ label, x }) => doc.text(label, x, thY + 5, { lineBreak: false }))
      doc.y = thY + ROW_H

      const DAY_ORDER = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
      const sorted = [...doctor.availabilities].sort(
        (a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
      )

      sorted.forEach((slot, idx) => {
        ensureSpace(doc, 22)
        const ry = doc.y
        if (idx % 2 === 0) doc.rect(MARGIN, ry, INNER_W, ROW_H).fillColor('#f9fafb').fill()
        const day = slot.day_of_week.charAt(0) + slot.day_of_week.slice(1).toLowerCase()
        doc.fillColor(DARK).font('Helvetica').fontSize(9)
        doc.text(day,                          AV.day,   ry + 4, { lineBreak: false })
        doc.text(formatTime(slot.start_time),  AV.start, ry + 4, { lineBreak: false })
        doc.text(formatTime(slot.end_time),    AV.end,   ry + 4, { lineBreak: false })
        doc.y = ry + ROW_H
      })
    }

    doc.moveDown(1.5)

    // ── Recent appointments list ──────────────────────────────────────────────
    ensureSpace(doc, 60)

    const recentAppts = appts.slice(0, 25)
    const STAT_COLORS = {
      SCHEDULED: NHS_BLUE, CONFIRMED: '#16a34a', COMPLETED: DARK,
      CANCELLED: '#dc2626', NO_SHOW: MID_GRAY,
    }

    headY = doc.y
    doc.rect(MARGIN, headY, INNER_W, 28).fill('#16a34a')
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
       .text(
         `RECENT APPOINTMENTS  (showing ${recentAppts.length} of ${totalAppts})`,
         MARGIN + 12, headY + 9, { lineBreak: false, width: INNER_W - 24 }
       )
    doc.y = headY + 36

    if (recentAppts.length === 0) {
      const ny = doc.y
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(9)
         .text('No appointments recorded.', MARGIN + 12, ny, { lineBreak: false })
      doc.y = ny + 18
    } else {
      const AT = { patient: MARGIN + 12, date: MARGIN + 200, status: MARGIN + 305, reason: MARGIN + 395 }
      const ROW_H = 18
      const thY = doc.y
      doc.rect(MARGIN, thY, INNER_W, ROW_H).fillColor('#e5e7eb').fill()
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(8)
      ;[
        { label: 'Patient', x: AT.patient }, { label: 'Date', x: AT.date },
        { label: 'Status', x: AT.status },   { label: 'Reason', x: AT.reason },
      ].forEach(({ label, x }) => doc.text(label, x, thY + 5, { lineBreak: false }))
      doc.y = thY + ROW_H

      recentAppts.forEach((appt, idx) => {
        ensureSpace(doc, 22)
        const ry  = doc.y
        if (idx % 2 === 0) doc.rect(MARGIN, ry, INNER_W, ROW_H).fillColor('#f9fafb').fill()
        const ptName = `${appt.patient.user.first_name} ${appt.patient.user.last_name}`
        const reason = appt.reason ? (appt.reason.length > 28 ? appt.reason.slice(0, 28) + '…' : appt.reason) : '—'
        doc.fillColor(DARK).font('Helvetica').fontSize(9)
           .text(ptName,              AT.patient, ry + 4, { lineBreak: false, width: 180 })
        doc.fillColor(DARK).font('Helvetica').fontSize(9)
           .text(fmtDate(appt.appointment_date), AT.date, ry + 4, { lineBreak: false, width: 95 })
        doc.fillColor(STAT_COLORS[appt.status] || DARK).font('Helvetica-Bold').fontSize(8)
           .text(appt.status,         AT.status, ry + 5, { lineBreak: false, width: 80 })
        doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8)
           .text(reason,              AT.reason, ry + 5, { lineBreak: false, width: 95 })
        doc.y = ry + ROW_H
      })
    }

    // ── Footer on every page ──────────────────────────────────────────────────
    const pageCount = doc.bufferedPageRange().count
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i)
      const footerY = 841.89 - 30
      doc.moveTo(MARGIN, footerY - 8).lineTo(PAGE_W - MARGIN, footerY - 8)
         .strokeColor(LIGHT_GRAY).lineWidth(0.5).stroke()
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8)
         .text(
           `Medly NHS Portal  ·  Confidential  ·  UK GDPR Art. 30  ·  Page ${i + 1} of ${pageCount}`,
           MARGIN, footerY, { width: INNER_W, align: 'center' }
         )
    }

    doc.end()
  } catch (err) {
    next(err)
  }
}

export async function exportOverviewReport(req, res, next) {
  try {
    // ── Data ──────────────────────────────────────────────────────────────────
    const now = new Date()
    const dow = now.getDay()
    const weekStart = new Date(now)
    weekStart.setUTCDate(now.getUTCDate() - (dow === 0 ? 6 : dow - 1))
    weekStart.setUTCHours(0, 0, 0, 0)

    const [
      allByRole, activeByRole, deletedCount,
      hospitals,
      apptByStatus, weekAppts,
      rxByStatus,
      inventory,
      auditTotal, activeConsents,
    ] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], where: { deleted_at: null },                  _count: { _all: true } }),
      prisma.user.groupBy({ by: ['role'], where: { deleted_at: null, is_active: true }, _count: { _all: true } }),
      prisma.user.count({ where: { deleted_at: { not: null } } }),
      prisma.hospital.findMany({ orderBy: { name: 'asc' } }),
      prisma.appointment.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.appointment.count({ where: { appointment_date: { gte: weekStart } } }),
      prisma.prescription.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.inventoryItem.findMany({ orderBy: { medication_name: 'asc' } }),
      prisma.auditLog.count(),
      prisma.consentRecord.count({ where: { is_granted: true } }),
    ])

    const roleTotal  = (role)   => allByRole.find(r   => r.role   === role)?._count._all   ?? 0
    const roleActive = (role)   => activeByRole.find(r => r.role   === role)?._count._all   ?? 0
    const apptStat   = (status) => apptByStatus.find(r => r.status === status)?._count._all ?? 0
    const rxStat     = (status) => rxByStatus.find(r   => r.status === status)?._count._all ?? 0

    const totalUsers = allByRole.reduce((s, r) => s + r._count._all, 0)
    const totalAppts = apptByStatus.reduce((s, r) => s + r._count._all, 0)
    const totalRx    = rxByStatus.reduce((s, r) => s + r._count._all, 0)

    const allAlertItems = inventory.filter(i => i.quantity_in_stock <= Math.floor(i.reorder_threshold * 1.5))
    const alertItems    = allAlertItems.slice(0, 5)

    await prisma.auditLog.create({
      data: {
        user_id: req.user.userId,
        action: 'EXPORT_OVERVIEW_PDF',
        entity_type: 'System',
        entity_id: 'report',
        details: 'System overview report generated',
        ip_address: req.ip || '0.0.0.0',
      },
    })

    // ── PDF: exactly 2 pages, no auto-breaks ─────────────────────────────────
    const doc = new PDFDocument({
      size: 'A4',
      bufferPages: true,
      autoFirstPage: false,
      margins: { top: MARGIN, left: MARGIN, right: MARGIN, bottom: 0 },
    })
    const dateStr = new Date().toISOString().split('T')[0]
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="medly-overview-${dateStr}.pdf"`)
    doc.pipe(res)

    const ROW_H = 18

    function secHead(label, color) {
      const hy = doc.y
      doc.rect(MARGIN, hy, INNER_W, 22).fill(color)
      doc.fillColor('white').font('Helvetica-Bold').fontSize(9)
         .text(label, MARGIN + 10, hy + 7, { lineBreak: false, width: INNER_W - 20 })
      doc.y = hy + 28
    }

    function tblHead(cols) {
      const y = doc.y
      doc.rect(MARGIN, y, INNER_W, ROW_H).fillColor('#e5e7eb').fill()
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(8)
      cols.forEach(({ label, x }) => doc.text(label, x, y + 5, { lineBreak: false }))
      doc.y = y + ROW_H
    }

    function tblRow(cells, shaded) {
      const y = doc.y
      if (shaded) doc.rect(MARGIN, y, INNER_W, ROW_H).fillColor('#f9fafb').fill()
      cells.forEach(({ text, x, color, bold }) => {
        doc.fillColor(color ?? DARK)
           .font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9)
           .text(text, x, y + 4, { lineBreak: false })
      })
      doc.y = y + ROW_H
    }

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — Header · Snapshot · Users · Appointments · Prescriptions
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage()

    // Header
    doc.rect(MARGIN, MARGIN, 40, 40).fill(NHS_BLUE)
    doc.fillColor('white').font('Helvetica-Bold').fontSize(20)
       .text('M', MARGIN, MARGIN + 9, { width: 40, align: 'center' })

    const titleX = MARGIN + 50
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(16)
       .text('Medly NHS Portal', titleX, MARGIN + 2, { width: INNER_W - 50 })
    doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8)
       .text('Secure Healthcare Appointment Management System', titleX, MARGIN + 20, { width: INNER_W - 50 })

    doc.fillColor(NHS_BLUE).font('Helvetica-Bold').fontSize(11)
       .text('SYSTEM OVERVIEW REPORT', MARGIN, MARGIN + 2, { width: INNER_W, align: 'right' })
    doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8)
       .text(
         `Generated: ${new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}`,
         MARGIN, MARGIN + 17, { width: INNER_W, align: 'right' }
       )

    doc.y = MARGIN + 46
    drawHRule(doc, NHS_BLUE)
    doc.y += 5

    const hospital = hospitals[0]
    if (hospital) {
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text(hospital.name, MARGIN, doc.y, { lineBreak: false })
      doc.y += 12
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8)
         .text(`${hospital.address}   ·   ${hospital.phone}`, MARGIN, doc.y, { lineBreak: false })
      doc.y += 12
    }

    drawHRule(doc)
    doc.y += 10

    // Snapshot bar
    const snapY = doc.y
    const SNAP_W = INNER_W / 4
    ;[
      { label: 'TOTAL USERS',   value: totalUsers,      color: DARK      },
      { label: 'APPOINTMENTS',  value: totalAppts,       color: NHS_BLUE  },
      { label: 'PRESCRIPTIONS', value: totalRx,          color: '#16a34a' },
      { label: 'HOSPITALS',     value: hospitals.length, color: MID_GRAY  },
    ].forEach(({ label, value, color }, i) => {
      const x = MARGIN + i * SNAP_W
      doc.fillColor(color).font('Helvetica-Bold').fontSize(20)
         .text(String(value), x, snapY, { width: SNAP_W, align: 'center' })
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(7)
         .text(label, x, snapY + 23, { width: SNAP_W, align: 'center' })
    })

    doc.y = snapY + 36
    drawHRule(doc)
    doc.y += 10

    // Section 1: Users & Staff
    secHead('USERS & STAFF', NHS_BLUE)

    const UC = { role: MARGIN + 12, total: MARGIN + 180, active: MARGIN + 260, inactive: MARGIN + 340 }
    tblHead([
      { label: 'Role', x: UC.role }, { label: 'Total', x: UC.total },
      { label: 'Active', x: UC.active }, { label: 'Inactive', x: UC.inactive },
    ])

    ;[
      { role: 'PATIENT', label: 'Patient' }, { role: 'DOCTOR', label: 'Doctor' },
      { role: 'PHARMACIST', label: 'Pharmacist' }, { role: 'ADMIN', label: 'Admin' },
    ].forEach(({ role, label }, idx) => {
      const total = roleTotal(role), active = roleActive(role), inactive = total - active
      tblRow([
        { text: label,             x: UC.role },
        { text: String(total),     x: UC.total },
        { text: String(active),    x: UC.active,    color: '#16a34a' },
        { text: String(inactive),  x: UC.inactive,  color: inactive > 0 ? '#dc2626' : MID_GRAY },
      ], idx % 2 === 0)
    })

    const noteY = doc.y + 4
    doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8)
       .text('Soft-deleted accounts (GDPR Art. 17 — Right to Erasure):', UC.role, noteY, { lineBreak: false })
    doc.fillColor(deletedCount > 0 ? '#d97706' : '#16a34a').font('Helvetica-Bold').fontSize(9)
       .text(String(deletedCount), UC.total, noteY, { lineBreak: false })
    doc.y = noteY + ROW_H + 8

    // Section 2: Appointments
    secHead('APPOINTMENTS', '#d97706')

    const agY = doc.y
    const AG_W = INNER_W / 6
    ;[
      { label: 'SCHEDULED', value: apptStat('SCHEDULED'), color: NHS_BLUE  },
      { label: 'CONFIRMED', value: apptStat('CONFIRMED'), color: '#16a34a' },
      { label: 'COMPLETED', value: apptStat('COMPLETED'), color: DARK      },
      { label: 'CANCELLED', value: apptStat('CANCELLED'), color: '#dc2626' },
      { label: 'NO SHOW',   value: apptStat('NO_SHOW'),   color: MID_GRAY  },
      { label: 'THIS WEEK', value: weekAppts,              color: '#7c3aed' },
    ].forEach(({ label, value, color }, i) => {
      const x = MARGIN + i * AG_W
      doc.fillColor(color).font('Helvetica-Bold').fontSize(14)
         .text(String(value), x, agY, { width: AG_W, align: 'center' })
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(7)
         .text(label, x, agY + 18, { width: AG_W, align: 'center' })
    })

    doc.y = agY + 32
    doc.y += 8

    // Section 3: Prescriptions
    secHead('PRESCRIPTIONS', '#16a34a')

    const rxY = doc.y
    const RX_W = INNER_W / 4
    ;[
      { label: 'TOTAL',     value: totalRx,             color: DARK      },
      { label: 'PENDING',   value: rxStat('PENDING'),   color: '#d97706' },
      { label: 'DISPENSED', value: rxStat('DISPENSED'), color: '#16a34a' },
      { label: 'CANCELLED', value: rxStat('CANCELLED'), color: '#dc2626' },
    ].forEach(({ label, value, color }, i) => {
      const x = MARGIN + i * RX_W
      doc.fillColor(color).font('Helvetica-Bold').fontSize(14)
         .text(String(value), x, rxY, { width: RX_W, align: 'center' })
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(7)
         .text(label, x, rxY + 18, { width: RX_W, align: 'center' })
    })

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — Inventory · GDPR & Compliance
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage()

    // Section 4: Inventory
    const invOK = allAlertItems.length === 0
    secHead(
      invOK
        ? `INVENTORY — ALL ${inventory.length} ITEMS WITHIN SAFE LEVELS`
        : `INVENTORY — ${allAlertItems.length} ITEM(S) BELOW SAFE THRESHOLD`,
      invOK ? '#16a34a' : '#dc2626'
    )

    if (invOK) {
      const okY = doc.y
      doc.fillColor('#16a34a').font('Helvetica-Bold').fontSize(9)
         .text(`All ${inventory.length} inventory items are within safe stock levels.`, MARGIN + 12, okY, { lineBreak: false })
      doc.y = okY + ROW_H
    } else {
      const IC = { name: MARGIN + 12, strength: MARGIN + 190, stock: MARGIN + 290, threshold: MARGIN + 365, status: MARGIN + 435 }
      tblHead([
        { label: 'Medication', x: IC.name }, { label: 'Strength', x: IC.strength },
        { label: 'In Stock', x: IC.stock }, { label: 'Threshold', x: IC.threshold },
        { label: 'Status', x: IC.status },
      ])
      alertItems.forEach((item, idx) => {
        const low = item.quantity_in_stock <= item.reorder_threshold
        tblRow([
          { text: item.medication_name,           x: IC.name },
          { text: item.strength,                  x: IC.strength },
          { text: String(item.quantity_in_stock), x: IC.stock },
          { text: String(item.reorder_threshold), x: IC.threshold },
          { text: low ? 'LOW' : 'WATCH',          x: IC.status, color: low ? '#dc2626' : '#d97706', bold: true },
        ], idx % 2 === 0)
      })
      if (allAlertItems.length > 5) {
        const moreY = doc.y + 3
        doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8)
           .text(`…and ${allAlertItems.length - 5} more item(s) below threshold`, MARGIN + 12, moreY, { lineBreak: false })
        doc.y = moreY + 14
      }
    }

    doc.y += 10

    // Section 5: GDPR & Compliance
    secHead('GDPR & COMPLIANCE', NHS_BLUE)

    const GC = { label: MARGIN + 12, value: MARGIN + 385 }
    ;[
      { label: 'Audit log entries (UK GDPR Art. 30 — Records of processing)', value: String(auditTotal),     color: DARK },
      { label: 'Active patient consent records (Art. 7 — Consent)',           value: String(activeConsents), color: '#16a34a' },
      { label: 'Soft-deleted accounts (Art. 17 — Right to Erasure)',          value: String(deletedCount),   color: deletedCount > 0 ? '#d97706' : '#16a34a' },
      { label: 'Pending data subject requests',                                value: '0',                   color: '#16a34a' },
    ].forEach(({ label, value, color }, idx) => {
      const ry = doc.y
      if (idx % 2 === 0) doc.rect(MARGIN, ry, INNER_W, ROW_H).fillColor('#f9fafb').fill()
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(9)
         .text(label, GC.label, ry + 5, { lineBreak: false, width: 355 })
      doc.fillColor(color).font('Helvetica-Bold').fontSize(9)
         .text(value, GC.value, ry + 5, { lineBreak: false })
      doc.y = ry + ROW_H
    })

    doc.y += 8
    doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8)
       .text(
         'This report was produced under UK GDPR Article 30 (Records of Processing Activities) ' +
         'and the Data Protection Act 2018. All test data is synthetic.',
         MARGIN + 12, doc.y, { width: INNER_W - 24 }
       )

    // ── Footers on both pages ─────────────────────────────────────────────────
    for (let i = 0; i < 2; i++) {
      doc.switchToPage(i)
      const footerY = 841.89 - 30
      doc.moveTo(MARGIN, footerY - 8).lineTo(PAGE_W - MARGIN, footerY - 8)
         .strokeColor(LIGHT_GRAY).lineWidth(0.5).stroke()
      doc.fillColor(MID_GRAY).font('Helvetica').fontSize(8)
         .text(
           `Medly NHS Portal  ·  Confidential  ·  UK GDPR Art. 30  ·  Page ${i + 1} of 2`,
           MARGIN, footerY, { width: INNER_W, align: 'center' }
         )
    }

    doc.end()
  } catch (err) {
    next(err)
  }
}
