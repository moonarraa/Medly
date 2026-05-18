import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../db.js'

const GENDER_MAP = {
  Female: 'FEMALE', Male: 'MALE', Other: 'OTHER', 'Prefer not to say': 'PREFER_NOT_TO_SAY',
  FEMALE: 'FEMALE', MALE: 'MALE', OTHER: 'OTHER', PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
}

function makeToken(user) {
  return jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function formatUser(user) {
  return {
    id: user.user_id,
    email: user.email,
    name: `${user.first_name} ${user.last_name}`,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    initials: (user.first_name[0] + user.last_name[0]).toUpperCase(),
    phone_number: user.phone_number,
  }
}

export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, dob, phone, nhs, gender, address, consents } = req.body

    if (!firstName || !lastName || !email || !password || !dob) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const password_hash = await bcrypt.hash(password, 12)
    const mappedGender = GENDER_MAP[gender] || 'PREFER_NOT_TO_SAY'
    // Generate placeholder NHS number if not provided
    const nhsNumber = nhs?.replace(/\s/g, '') || String(Math.floor(1000000000 + Math.random() * 9000000000))

    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone || null,
        role: 'PATIENT',
        patient: {
          create: {
            date_of_birth: new Date(dob),
            gender: mappedGender,
            address: address || '',
            nhs_number: nhsNumber,
          },
        },
      },
    })

    if (consents?.gdpr) {
      await prisma.consentRecord.create({
        data: {
          patient_id: user.user_id,
          consent_type: 'DATA_PROCESSING',
          is_granted: true,
          version: '1.0',
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        user_id: user.user_id,
        action: 'REGISTER',
        entity_type: 'User',
        entity_id: user.user_id,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.status(201).json({ token: makeToken(user), user: formatUser(user) })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.deleted_at) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated' })

    await prisma.auditLog.create({
      data: {
        user_id: user.user_id,
        action: 'LOGIN',
        entity_type: 'User',
        entity_id: user.user_id,
        ip_address: req.ip || '0.0.0.0',
      },
    })

    res.json({ token: makeToken(user), user: formatUser(user) })
  } catch (err) {
    next(err)
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { user_id: req.user.userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: formatUser(user) })
  } catch (err) {
    next(err)
  }
}
