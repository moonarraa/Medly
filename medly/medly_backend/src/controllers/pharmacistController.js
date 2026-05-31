import prisma from '../db.js'

export async function getMyProfile(req, res, next) {
  try {
    const pharmacist = await prisma.pharmacist.findUnique({
      where: { pharmacist_id: req.user.userId },
      include: { user: true },
    })
    if (!pharmacist) return res.status(404).json({ error: 'Pharmacist not found' })

    res.json({
      id:            pharmacist.pharmacist_id,
      name:          `${pharmacist.user.first_name} ${pharmacist.user.last_name}`,
      initials:      (pharmacist.user.first_name[0] + pharmacist.user.last_name[0]).toUpperCase(),
      email:         pharmacist.user.email,
      phone_number:  pharmacist.user.phone_number,
      license_number: pharmacist.license_number,
      pharmacy_name: pharmacist.pharmacy_name,
      member_since:  pharmacist.user.created_at,
    })
  } catch (err) {
    next(err)
  }
}
