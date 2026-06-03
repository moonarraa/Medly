// ============================================================
//  Medly - Database Seed Script
//  Populates all tables with realistic synthetic data
//  Uses @faker-js/faker for GDPR-safe test data
//  Prisma 7 - uses @prisma/adapter-pg
// ============================================================

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

// -- Prisma 7 adapter setup --
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// -- Configuration --
const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "Medly@2026"; // All seeded users share this password
const NUM_PATIENTS = 20;
const NUM_DOCTORS = 5;
const NUM_PHARMACISTS = 3;
const NUM_HOSPITALS = 3;

// -- Helper functions --

function randomEnum(enumObj) {
  const values = Object.values(enumObj);
  return values[Math.floor(Math.random() * values.length)];
}

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateNHSNumber() {
  // UK NHS numbers are 10 digits
  return faker.string.numeric(10);
}

function generateLicenseNumber(prefix) {
  return `${prefix}-${faker.string.numeric(6)}`;
}

// Time helper: creates a Date object with only time component for @db.Time fields
function timeOnly(hours, minutes) {
  return new Date(`1970-01-01T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00.000Z`);
}

// -- Enums matching schema.prisma --
const UserRole = { PATIENT: "PATIENT", DOCTOR: "DOCTOR", PHARMACIST: "PHARMACIST", ADMIN: "ADMIN" };
const Gender = { MALE: "MALE", FEMALE: "FEMALE", OTHER: "OTHER", PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY" };
const DayOfWeek = { MONDAY: "MONDAY", TUESDAY: "TUESDAY", WEDNESDAY: "WEDNESDAY", THURSDAY: "THURSDAY", FRIDAY: "FRIDAY", SATURDAY: "SATURDAY", SUNDAY: "SUNDAY" };
const AppointmentStatus = { SCHEDULED: "SCHEDULED", CONFIRMED: "CONFIRMED", COMPLETED: "COMPLETED", CANCELLED: "CANCELLED", NO_SHOW: "NO_SHOW" };
const PrescriptionStatus = { PENDING: "PENDING", DISPENSED: "DISPENSED", CANCELLED: "CANCELLED", EXPIRED: "EXPIRED" };
const NotificationType = { APPOINTMENT_CONFIRMATION: "APPOINTMENT_CONFIRMATION", APPOINTMENT_REMINDER: "APPOINTMENT_REMINDER", APPOINTMENT_CANCELLATION: "APPOINTMENT_CANCELLATION", PRESCRIPTION_READY: "PRESCRIPTION_READY", SYSTEM_ALERT: "SYSTEM_ALERT" };
const NotificationChannel = { EMAIL: "EMAIL", SMS: "SMS", IN_APP: "IN_APP" };
const DeliveryStatus = { PENDING: "PENDING", SENT: "SENT", DELIVERED: "DELIVERED", FAILED: "FAILED" };
const ConsentType = { DATA_PROCESSING: "DATA_PROCESSING", MARKETING_COMMUNICATIONS: "MARKETING_COMMUNICATIONS", MEDICAL_RECORD_SHARING: "MEDICAL_RECORD_SHARING", THIRD_PARTY_SHARING: "THIRD_PARTY_SHARING" };

// -- Medical data for realistic content --
const SPECIALISATIONS = [
  "General Practice", "Cardiology", "Dermatology",
  "Orthopaedics", "Paediatrics", "Neurology",
  "Psychiatry", "Ophthalmology"
];

const DEPARTMENTS = [
  "Emergency Medicine", "Internal Medicine", "Surgery",
  "Outpatient Clinic", "Radiology", "Pathology"
];

const PHARMACY_NAMES = [
  "Boots Pharmacy", "Lloyds Pharmacy", "Superdrug Pharmacy",
  "Well Pharmacy", "Day Lewis Pharmacy", "Rowlands Pharmacy"
];

const APPOINTMENT_REASONS = [
  "Routine check-up", "Follow-up consultation", "Blood test results",
  "Chest pain evaluation", "Skin rash assessment", "Back pain consultation",
  "Vaccination appointment", "Mental health review", "Eye examination",
  "Prescription renewal", "New patient registration", "Referral discussion"
];

const MEDICATIONS = [
  { name: "Amoxicillin 500mg", dosage: "1 capsule", instructions: "Take three times daily with food for 7 days" },
  { name: "Paracetamol 500mg", dosage: "2 tablets", instructions: "Take up to four times daily as needed for pain" },
  { name: "Omeprazole 20mg", dosage: "1 capsule", instructions: "Take once daily before breakfast for 28 days" },
  { name: "Metformin 500mg", dosage: "1 tablet", instructions: "Take twice daily with meals" },
  { name: "Amlodipine 5mg", dosage: "1 tablet", instructions: "Take once daily at the same time each day" },
  { name: "Salbutamol 100mcg", dosage: "2 puffs", instructions: "Inhale as needed for shortness of breath, max 8 puffs daily" },
  { name: "Sertraline 50mg", dosage: "1 tablet", instructions: "Take once daily in the morning with water" },
  { name: "Ibuprofen 400mg", dosage: "1 tablet", instructions: "Take three times daily with food, max 1200mg per day" },
  { name: "Atorvastatin 20mg", dosage: "1 tablet", instructions: "Take once daily in the evening" },
  { name: "Cetirizine 10mg", dosage: "1 tablet", instructions: "Take once daily for allergy symptoms" },
];

const UK_HOSPITALS = [
  { name: "Leicester Royal Infirmary", address: "Infirmary Square, Leicester LE1 5WW", phone: "0300 303 1573" },
  { name: "Glenfield Hospital", address: "Groby Road, Leicester LE3 9QP", phone: "0300 303 1573" },
  { name: "Leicester General Hospital", address: "Gwendolen Road, Leicester LE5 4PW", phone: "0300 303 1573" },
];

// ============================================================
//  MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log("Seeding Medly database...\n");

  // -- Clear existing data (in dependency order) --
  console.log("Clearing existing data...");
  await prisma.inventoryItem.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.pharmacist.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // -- Hash the default password once (reused for all users) --
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // ========================================================
  // 1. ADMIN USER
  // ========================================================
  console.log("Creating admin user...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@medly.nhs.uk",
      password_hash: passwordHash,
      first_name: "System",
      last_name: "Admin",
      phone_number: "07700 900000",
      role: UserRole.ADMIN,
      is_active: true,
    },
  });

  // ========================================================
  // 2. HOSPITALS
  // ========================================================
  console.log("Creating hospitals...");
  const hospitals = [];
  for (const h of UK_HOSPITALS) {
    const hospital = await prisma.hospital.create({
      data: { name: h.name, address: h.address, phone: h.phone },
    });
    hospitals.push(hospital);
  }

  // ========================================================
  // 3. DOCTORS (User + Doctor profile)
  // ========================================================
  console.log(`Creating ${NUM_DOCTORS} doctors...`);
  const doctors = [];
  for (let i = 0; i < NUM_DOCTORS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName, provider: "medly.nhs.uk" }).toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone_number: faker.phone.number({ style: "national" }),
        role: UserRole.DOCTOR,
        is_active: true,
        doctor: {
          create: {
            specialisation: randomFromArray(SPECIALISATIONS),
            license_number: generateLicenseNumber("GMC"),
            department: randomFromArray(DEPARTMENTS),
          },
        },
      },
      include: { doctor: true },
    });
    doctors.push(user);
  }

  // ========================================================
  // 4. PHARMACISTS (User + Pharmacist profile)
  // ========================================================
  console.log(`Creating ${NUM_PHARMACISTS} pharmacists...`);
  const pharmacists = [];
  for (let i = 0; i < NUM_PHARMACISTS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName, provider: "medly.nhs.uk" }).toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone_number: faker.phone.number({ style: "national" }),
        role: UserRole.PHARMACIST,
        is_active: true,
        pharmacist: {
          create: {
            license_number: generateLicenseNumber("GPhC"),
            pharmacy_name: PHARMACY_NAMES[i % PHARMACY_NAMES.length],
          },
        },
      },
      include: { pharmacist: true },
    });
    pharmacists.push(user);
  }

  // ========================================================
  // 5. PATIENTS (User + Patient profile)
  // ========================================================
  console.log(`Creating ${NUM_PATIENTS} patients...`);
  const patients = [];
  for (let i = 0; i < NUM_PATIENTS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone_number: faker.phone.number({ style: "national" }),
        role: UserRole.PATIENT,
        is_active: true,
        patient: {
          create: {
            date_of_birth: faker.date.birthdate({ min: 18, max: 85, mode: "age" }),
            gender: randomEnum(Gender),
            address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.zipCode("?? ???")}`,
            nhs_number: generateNHSNumber(),
            medical_notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }) || null,
          },
        },
      },
      include: { patient: true },
    });
    patients.push(user);
  }

  // ========================================================
  // 6. AVAILABILITY (Weekly schedule per doctor)
  // ========================================================
  console.log("Creating doctor availability slots...");
  const availabilities = [];
  const weekdays = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];

  for (const doc of doctors) {
    // Each doctor works 3-5 days per week
    const workDays = faker.helpers.arrayElements(weekdays, { min: 3, max: 5 });
    for (const day of workDays) {
      const startHour = faker.helpers.arrayElement([8, 9]);
      const endHour = faker.helpers.arrayElement([16, 17]);
      const availability = await prisma.availability.create({
        data: {
          doctor_id: doc.doctor.doctor_id,
          day_of_week: day,
          start_time: timeOnly(startHour, 0),
          end_time: timeOnly(endHour, 0),
          is_available: true,
        },
      });
      availabilities.push(availability);
    }
  }

  // ========================================================
  // 7. APPOINTMENTS
  // ========================================================
  console.log("Creating appointments...");
  const appointments = [];

  for (const pat of patients) {
    // Each patient has 1-3 appointments
    const numAppointments = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numAppointments; i++) {
      const doctor = randomFromArray(doctors);
      const doctorAvailability = availabilities.filter(
        (a) => a.doctor_id === doctor.doctor.doctor_id
      );
      const availability = doctorAvailability.length > 0 ? randomFromArray(doctorAvailability) : null;

      const appointmentDate = faker.date.between({
        from: new Date("2026-03-01"),
        to: new Date("2026-05-31"),
      });
      const startHour = faker.number.int({ min: 9, max: 15 });

      const status = randomEnum(AppointmentStatus);

      const appointment = await prisma.appointment.create({
        data: {
          patient_id: pat.patient.patient_id,
          doctor_id: doctor.doctor.doctor_id,
          availability_id: availability?.availability_id || null,
          appointment_date: appointmentDate,
          start_time: timeOnly(startHour, 0),
          end_time: timeOnly(startHour + 1, 0),
          status: status,
          reason: randomFromArray(APPOINTMENT_REASONS),
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || null,
        },
      });
      appointments.push(appointment);
    }
  }

  // ========================================================
  // 8. PRESCRIPTIONS (for completed appointments)
  // ========================================================
  console.log("Creating prescriptions...");
  const completedAppointments = appointments.filter((a) => a.status === "COMPLETED");

  for (const appt of completedAppointments) {
    const med = randomFromArray(MEDICATIONS);
    const pharmacist = randomFromArray(pharmacists);
    const status = randomFromArray(["DISPENSED", "PENDING"]);

    await prisma.prescription.create({
      data: {
        appointment_id: appt.appointment_id,
        pharmacist_id: status === "DISPENSED" ? pharmacist.pharmacist.pharmacist_id : null,
        medication_name: med.name,
        dosage: med.dosage,
        instructions: med.instructions,
        prescribed_date: appt.appointment_date,
        status: status,
      },
    });
  }

  // ========================================================
  // 9. NOTIFICATIONS
  // ========================================================
  console.log("Creating notifications...");
  for (const appt of appointments) {
    // Confirmation notification for every appointment
    await prisma.notification.create({
      data: {
        user_id: appt.patient_id,
        appointment_id: appt.appointment_id,
        type: NotificationType.APPOINTMENT_CONFIRMATION,
        channel: randomFromArray([NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.IN_APP]),
        message_content: `Your appointment on ${appt.appointment_date.toISOString().split("T")[0]} has been confirmed.`,
        delivery_status: randomEnum(DeliveryStatus),
      },
    });

    // 50% chance of a reminder notification
    if (Math.random() > 0.5) {
      await prisma.notification.create({
        data: {
          user_id: appt.patient_id,
          appointment_id: appt.appointment_id,
          type: NotificationType.APPOINTMENT_REMINDER,
          channel: NotificationChannel.EMAIL,
          message_content: `Reminder: You have an upcoming appointment tomorrow.`,
          delivery_status: DeliveryStatus.DELIVERED,
        },
      });
    }
  }

  // ========================================================
  // 10. CONSENT RECORDS (GDPR compliance)
  // ========================================================
  console.log("Creating consent records...");
  for (const pat of patients) {
    // Every patient must have a DATA_PROCESSING consent
    await prisma.consentRecord.create({
      data: {
        patient_id: pat.patient.patient_id,
        consent_type: ConsentType.DATA_PROCESSING,
        is_granted: true,
        version: "1.0",
      },
    });

    // Random additional consents
    const additionalConsents = faker.helpers.arrayElements(
      [ConsentType.MARKETING_COMMUNICATIONS, ConsentType.MEDICAL_RECORD_SHARING, ConsentType.THIRD_PARTY_SHARING],
      { min: 0, max: 3 }
    );

    for (const type of additionalConsents) {
      const granted = Math.random() > 0.3; // 70% grant consent
      await prisma.consentRecord.create({
        data: {
          patient_id: pat.patient.patient_id,
          consent_type: type,
          is_granted: granted,
          revoked_at: !granted ? faker.date.recent({ days: 30 }) : null,
          version: "1.0",
        },
      });
    }
  }

  // ========================================================
  // 11. INVENTORY
  // ========================================================
  console.log("Creating inventory items...");
  const INVENTORY_ITEMS = [
    { medication_name: "Paracetamol",     strength: "500mg",    quantity_in_stock: 12,  reorder_threshold: 20, unit: "packs" },
    { medication_name: "Ibuprofen",       strength: "400mg",    quantity_in_stock: 8,   reorder_threshold: 20, unit: "packs" },
    { medication_name: "Amoxicillin",     strength: "500mg",    quantity_in_stock: 45,  reorder_threshold: 15, unit: "packs" },
    { medication_name: "Omeprazole",      strength: "20mg",     quantity_in_stock: 60,  reorder_threshold: 25, unit: "packs" },
    { medication_name: "Metformin",       strength: "500mg",    quantity_in_stock: 30,  reorder_threshold: 20, unit: "packs" },
    { medication_name: "Amlodipine",      strength: "5mg",      quantity_in_stock: 22,  reorder_threshold: 15, unit: "packs" },
    { medication_name: "Salbutamol",      strength: "100mcg",   quantity_in_stock: 27,  reorder_threshold: 20, unit: "inhalers" },
    { medication_name: "Sertraline",      strength: "50mg",     quantity_in_stock: 18,  reorder_threshold: 15, unit: "packs" },
    { medication_name: "Atorvastatin",    strength: "20mg",     quantity_in_stock: 50,  reorder_threshold: 20, unit: "packs" },
    { medication_name: "Cetirizine",      strength: "10mg",     quantity_in_stock: 5,   reorder_threshold: 15, unit: "packs" },
    { medication_name: "Lisinopril",      strength: "10mg",     quantity_in_stock: 35,  reorder_threshold: 20, unit: "packs" },
    { medication_name: "Levothyroxine",   strength: "50mcg",    quantity_in_stock: 40,  reorder_threshold: 20, unit: "packs" },
    { medication_name: "Ramipril",        strength: "5mg",      quantity_in_stock: 14,  reorder_threshold: 15, unit: "packs" },
    { medication_name: "Lansoprazole",    strength: "30mg",     quantity_in_stock: 55,  reorder_threshold: 25, unit: "packs" },
    { medication_name: "Bisoprolol",      strength: "5mg",      quantity_in_stock: 25,  reorder_threshold: 20, unit: "packs" },
    { medication_name: "Clopidogrel",     strength: "75mg",     quantity_in_stock: 9,   reorder_threshold: 15, unit: "packs" },
    { medication_name: "Fluoxetine",      strength: "20mg",     quantity_in_stock: 33,  reorder_threshold: 20, unit: "packs" },
    { medication_name: "Codeine",         strength: "30mg",     quantity_in_stock: 10,  reorder_threshold: 10, unit: "packs" },
    { medication_name: "Doxycycline",     strength: "100mg",    quantity_in_stock: 20,  reorder_threshold: 10, unit: "packs" },
    { medication_name: "Prednisolone",    strength: "5mg",      quantity_in_stock: 28,  reorder_threshold: 15, unit: "packs" },
  ];

  for (const item of INVENTORY_ITEMS) {
    await prisma.inventoryItem.create({ data: item });
  }

  // ========================================================
  // 13. AUDIT LOGS
  // ========================================================
  console.log("Creating audit logs...");
  const auditActions = [
    { action: "USER_LOGIN", entity_type: "User" },
    { action: "APPOINTMENT_CREATED", entity_type: "Appointment" },
    { action: "APPOINTMENT_CANCELLED", entity_type: "Appointment" },
    { action: "PRESCRIPTION_CREATED", entity_type: "Prescription" },
    { action: "PATIENT_DATA_VIEWED", entity_type: "Patient" },
    { action: "CONSENT_UPDATED", entity_type: "ConsentRecord" },
    { action: "USER_LOGOUT", entity_type: "User" },
    { action: "PASSWORD_CHANGED", entity_type: "User" },
  ];

  // Create 50 random audit entries
  const allUsers = [admin, ...doctors, ...pharmacists, ...patients];
  for (let i = 0; i < 50; i++) {
    const user = randomFromArray(allUsers);
    const auditAction = randomFromArray(auditActions);

    await prisma.auditLog.create({
      data: {
        user_id: user.user_id,
        action: auditAction.action,
        entity_type: auditAction.entity_type,
        entity_id: faker.string.uuid(),
        details: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) || null,
        ip_address: faker.internet.ipv4(),
        timestamp: faker.date.between({
          from: new Date("2026-03-01"),
          to: new Date(),
        }),
      },
    });
  }

  // ========================================================
  // SUMMARY
  // ========================================================
  const counts = {
    users: await prisma.user.count(),
    patients: await prisma.patient.count(),
    doctors: await prisma.doctor.count(),
    pharmacists: await prisma.pharmacist.count(),
    hospitals: await prisma.hospital.count(),
    availabilities: await prisma.availability.count(),
    appointments: await prisma.appointment.count(),
    prescriptions: await prisma.prescription.count(),
    notifications: await prisma.notification.count(),
    consentRecords: await prisma.consentRecord.count(),
    inventoryItems: await prisma.inventoryItem.count(),
    auditLogs: await prisma.auditLog.count(),
  };

  console.log("\n========================================");
  console.log("  Medly Database Seeded Successfully!");
  console.log("========================================");
  console.log(`  Users:           ${counts.users}`);
  console.log(`    - Admin:       1`);
  console.log(`    - Doctors:     ${counts.doctors}`);
  console.log(`    - Pharmacists: ${counts.pharmacists}`);
  console.log(`    - Patients:    ${counts.patients}`);
  console.log(`  Hospitals:       ${counts.hospitals}`);
  console.log(`  Availabilities:  ${counts.availabilities}`);
  console.log(`  Appointments:    ${counts.appointments}`);
  console.log(`  Prescriptions:   ${counts.prescriptions}`);
  console.log(`  Notifications:   ${counts.notifications}`);
  console.log(`  Consent Records: ${counts.consentRecords}`);
  console.log(`  Inventory Items: ${counts.inventoryItems}`);
  console.log(`  Audit Logs:      ${counts.auditLogs}`);
  console.log("========================================");
  console.log(`\n  Default login password: ${DEFAULT_PASSWORD}`);
  console.log(`  Admin email: admin@medly.nhs.uk`);
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
