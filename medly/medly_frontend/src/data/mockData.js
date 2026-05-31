export const doctors = [
  { id: 'D001', name: 'Dr. James Patel',   initials: 'JP', specialisation: 'General Practice', experience: '12 years', rating: 4.8, reviews: 124, hospital: 'Central Hospital, Leicester',       nextAvailable: 'Tomorrow 10:30 AM' },
  { id: 'D002', name: 'Dr. Emily Chen',    initials: 'EC', specialisation: 'Cardiology',        experience: '8 years',  rating: 4.9, reviews: 87,  hospital: "St. Mary's Hospital, Leicester",   nextAvailable: 'Mar 15, 2:00 PM' },
  { id: 'D003', name: 'Dr. Michael Brown', initials: 'MB', specialisation: 'Dermatology',       experience: '15 years', rating: 4.7, reviews: 203, hospital: 'Royal Infirmary, Leicester',        nextAvailable: 'Mar 18, 9:00 AM' },
  { id: 'D004', name: 'Dr. Priya Sharma',  initials: 'PS', specialisation: 'Neurology',         experience: '10 years', rating: 4.6, reviews: 156, hospital: 'Central Hospital, Leicester',       nextAvailable: 'Mar 20, 11:00 AM' },
  { id: 'D005', name: 'Dr. Robert Wilson', initials: 'RW', specialisation: 'Orthopaedics',      experience: '18 years', rating: 4.8, reviews: 312, hospital: "St. Mary's Hospital, Leicester",   nextAvailable: 'Mar 16, 3:00 PM' },
]

export const appointments = [
  {
    id: 'APT001',
    doctorName: 'Dr. James Patel', doctorId: 'D001', specialisation: 'General Practice',
    patientId: 'P2773', patientName: 'Sarah Mitchell', patientDob: '15/05/1992', patientGender: 'Female', patientAge: 33, allergies: 'Penicillin',
    date: '10 Mar 2026', time: '10:30 AM', endTime: '11:00 AM', location: 'Central Hospital, Room 204',
    status: 'CONFIRMED', reason: 'Annual checkup', duration: '30 min', bookedDate: '25 Feb 2026',
    notes: 'Patient reports feeling well overall. No major concerns.\nRoutine annual checkup completed. All vitals within normal range.',
    vitals: { bp: '120/80 mmHg', hr: '72 bpm', temp: '36.6 °C' },
  },
  {
    id: 'APT002',
    doctorName: 'Dr. Emily Chen', doctorId: 'D002', specialisation: 'Cardiology',
    patientId: 'P2773', patientName: 'Sarah Mitchell', patientDob: '15/05/1992', patientGender: 'Female', patientAge: 33, allergies: 'Penicillin',
    date: '15 Mar 2026', time: '2:00 PM', endTime: '2:45 PM', location: "St. Mary's Hospital, Room 312",
    status: 'SCHEDULED', reason: 'Cardiology follow-up', duration: '20 min', bookedDate: '1 Mar 2026',
    notes: '', vitals: null,
  },
  {
    id: 'APT003',
    doctorName: 'Dr. Michael Brown', doctorId: 'D003', specialisation: 'Dermatology',
    patientId: 'P2773', patientName: 'Sarah Mitchell', patientDob: '15/05/1992', patientGender: 'Female', patientAge: 33, allergies: 'Penicillin',
    date: '22 Mar 2026', time: '11:15 AM', endTime: '11:45 AM', location: 'Royal Infirmary, Room 108',
    status: 'CONFIRMED', reason: 'Skin rash consultation', duration: '45 min', bookedDate: '10 Mar 2026',
    notes: '', vitals: null,
  },
  {
    id: 'APT007',
    doctorName: 'Dr. Emily Chen', doctorId: 'D002', specialisation: 'Cardiology',
    patientId: 'P3401', patientName: 'John Williams', patientDob: '22/11/1978', patientGender: 'Male', patientAge: 47, allergies: 'None known',
    date: '18 Mar 2026', time: '10:00 AM', endTime: '10:30 AM', location: "St. Mary's Hospital, Room 312",
    status: 'SCHEDULED', reason: 'Chest pain follow-up', duration: '30 min', bookedDate: '5 Mar 2026',
    notes: '', vitals: null,
  },
  {
    id: 'APT008',
    doctorName: 'Dr. Michael Brown', doctorId: 'D003', specialisation: 'Dermatology',
    patientId: 'P4112', patientName: 'Emma Davies', patientDob: '03/08/1985', patientGender: 'Female', patientAge: 40, allergies: 'None known',
    date: '25 Mar 2026', time: '09:30 AM', endTime: '10:00 AM', location: 'Royal Infirmary, Room 108',
    status: 'CONFIRMED', reason: 'Follow-up consultation', duration: '30 min', bookedDate: '12 Mar 2026',
    notes: '', vitals: null,
  },
  {
    id: 'APT004',
    doctorName: 'Dr. James Patel', doctorId: 'D001', specialisation: 'General Practice',
    patientId: 'P3401', patientName: 'John Williams', patientDob: '22/11/1978', patientGender: 'Male', patientAge: 47, allergies: 'None known',
    date: '5 Feb 2026', time: '9:00 AM', endTime: '9:30 AM', location: 'Central Hospital, Room 204',
    status: 'COMPLETED', reason: 'Blood pressure check', duration: '30 min', bookedDate: '20 Jan 2026',
    notes: 'BP slightly elevated at 140/90. Medication dosage reviewed and adjusted.', vitals: { bp: '140/90 mmHg', hr: '78 bpm', temp: '36.8 °C' },
  },
  {
    id: 'APT005',
    doctorName: 'Dr. Emily Chen', doctorId: 'D002', specialisation: 'Cardiology',
    patientId: 'P2773', patientName: 'Sarah Mitchell', patientDob: '15/05/1992', patientGender: 'Female', patientAge: 33, allergies: 'Penicillin',
    date: '1 Jan 2026', time: '3:00 PM', endTime: '3:30 PM', location: "St. Mary's Hospital, Room 312",
    status: 'CANCELLED', reason: 'ECG test', duration: '30 min', bookedDate: '15 Dec 2025',
    notes: 'Patient cancelled due to personal reasons.', vitals: null,
  },
  {
    id: 'APT006',
    doctorName: 'Dr. James Patel', doctorId: 'D001', specialisation: 'General Practice',
    patientId: 'P2890', patientName: 'Robert Lee', patientDob: '17/02/1965', patientGender: 'Male', patientAge: 61, allergies: 'None known',
    date: '10 Mar 2026', time: '14:00', endTime: '14:15', location: 'Central Hospital, Room 204',
    status: 'SCHEDULED', reason: 'Test results review', duration: '15 min', bookedDate: '5 Mar 2026',
    notes: '', vitals: null,
  },
]

export const prescriptions = [
  { id: 'RX-2026-0341', medication: 'Amoxicillin',  dosage: '500mg', quantity: '21 capsules', instructions: 'Take 1 capsule 3 times daily for 7 days with food', prescribedBy: 'Dr. James Patel', prescribedDate: '1 Mar 2026',  pharmacy: 'Boots, High Street',          status: 'READY',     patientName: 'Sarah Mitchell', patientId: 'P2773', allergies: 'Penicillin' },
  { id: 'RX-2026-0342', medication: 'Lisinopril',   dosage: '10mg',  quantity: '30 tablets',  instructions: 'Take 1 tablet daily in the morning',            prescribedBy: 'Dr. Emily Chen',   prescribedDate: '5 Mar 2026',  pharmacy: 'LloydsPharmacy',              status: 'PENDING',   patientName: 'John Williams',  patientId: 'P3401', allergies: 'None known' },
  { id: 'RX-2026-0343', medication: 'Metformin',    dosage: '500mg', quantity: '60 tablets',  instructions: 'Take 1 tablet twice daily with meals',           prescribedBy: 'Dr. James Patel', prescribedDate: '8 Mar 2026',  pharmacy: 'Boots, High Street',          status: 'PENDING',   patientName: 'Emma Davies',    patientId: 'P4112', allergies: 'None known' },
  { id: 'RX-2026-0344', medication: 'Atorvastatin', dosage: '20mg',  quantity: '30 tablets',  instructions: 'Take 1 tablet daily in the evening',             prescribedBy: 'Dr. James Patel', prescribedDate: '10 Mar 2026', pharmacy: 'Royal Infirmary Pharmacy',    status: 'PENDING',   patientName: 'Robert Lee',     patientId: 'P2890', allergies: 'None known' },
  { id: 'RX-2026-0345', medication: 'Omeprazole',   dosage: '20mg',  quantity: '28 capsules', instructions: 'Take 1 capsule daily before breakfast',          prescribedBy: 'Dr. Emily Chen',   prescribedDate: '9 Mar 2026',  pharmacy: 'LloydsPharmacy',              status: 'PENDING',   patientName: 'Lisa Park',      patientId: 'P5023', allergies: 'Aspirin' },
  { id: 'RX-2026-0310', medication: 'Ibuprofen',    dosage: '200mg', quantity: '24 tablets',  instructions: 'Take 1-2 tablets every 4-6 hours with food',    prescribedBy: 'Dr. James Patel', prescribedDate: '28 Feb 2026', pharmacy: 'Boots, High Street',          status: 'DISPENSED', patientName: 'Sarah Mitchell', patientId: 'P2773', allergies: 'None known' },
  { id: 'RX-2026-0298', medication: 'Paracetamol',  dosage: '500mg', quantity: '32 tablets',  instructions: 'Take 1-2 tablets every 4-6 hours as needed',    prescribedBy: 'Dr. Michael Brown',prescribedDate: '10 Feb 2026', pharmacy: 'Royal Infirmary Pharmacy',    status: 'DISPENSED', patientName: 'Sarah Mitchell', patientId: 'P2773', allergies: 'None known' },
]

export const patients = [
  { id: 'P2773', name: 'Sarah Mitchell', dob: '15/05/1992', lastVisit: '10 Mar 2026', status: 'Active', allergies: 'Penicillin',  gender: 'Female', age: 33 },
  { id: 'P3401', name: 'John Williams',  dob: '22/11/1978', lastVisit: '10 Mar 2026', status: 'Active', allergies: 'None known', gender: 'Male',   age: 47 },
  { id: 'P4112', name: 'Emma Davies',    dob: '03/08/1985', lastVisit: '10 Mar 2026', status: 'New',    allergies: 'None known', gender: 'Female', age: 40 },
  { id: 'P2890', name: 'Robert Lee',     dob: '17/02/1965', lastVisit: '05 Mar 2026', status: 'Active', allergies: 'None known', gender: 'Male',   age: 61 },
  { id: 'P5023', name: 'Lisa Park',      dob: '28/09/1990', lastVisit: '28 Feb 2026', status: 'Active', allergies: 'Aspirin',    gender: 'Female', age: 35 },
]

export const users = [
  { id: 'P2773',  name: 'Sarah Mitchell',  initials: 'SM', email: 'sarah.m@email.com',       role: 'PATIENT',     status: 'Active',   created: '12 Jan 2026', org: '' },
  { id: 'D001',   name: 'Dr. James Patel', initials: 'JP', email: 'j.patel@medly.uk',        role: 'DOCTOR',      status: 'Active',   created: '05 Mar 2024', org: 'Central Hospital' },
  { id: 'D002',   name: 'Dr. Emily Chen',  initials: 'EC', email: 'e.chen@medly.uk',         role: 'DOCTOR',      status: 'Active',   created: '14 Jun 2024', org: "St. Mary's Hospital" },
  { id: 'PH001',  name: 'Anna Kowalski',   initials: 'AK', email: 'a.kowalski@medly.uk',     role: 'PHARMACIST',  status: 'Active',   created: '22 Aug 2024', org: 'Royal Infirmary' },
  { id: 'P3401',  name: 'John Williams',   initials: 'JW', email: 'jw@email.com',            role: 'PATIENT',     status: 'Inactive', created: '03 Feb 2025', org: '' },
  { id: 'P4112',  name: 'Emma Davies',     initials: 'ED', email: 'emma.d@email.com',        role: 'PATIENT',     status: 'Active',   created: '28 Feb 2026', org: '' },
  { id: 'D003',   name: 'Dr. Michael Brown', initials: 'MB', email: 'm.brown@medly.uk',      role: 'DOCTOR',      status: 'Active',   created: '10 Jan 2024', org: 'Royal Infirmary' },
  { id: 'P2890',  name: 'Robert Lee',      initials: 'RL', email: 'r.lee@email.com',         role: 'PATIENT',     status: 'Active',   created: '15 Nov 2025', org: '' },
  { id: 'P5023',  name: 'Lisa Park',       initials: 'LP', email: 'l.park@email.com',        role: 'PATIENT',     status: 'Active',   created: '02 Jan 2026', org: '' },
]

export const auditLogs = [
  { id: 1,  timestamp: '10/03 14:32:18', user: 'Dr. J. Patel',  event: 'VIEW_RECORD',          resource: 'Patient P2773',          ip: '10.0.1.45',   status: 'SUCCESS' },
  { id: 2,  timestamp: '10/03 14:28:02', user: 'S. Mitchell',   event: 'LOGIN',                resource: 'Auth service',           ip: '82.14.5.211', status: 'SUCCESS' },
  { id: 3,  timestamp: '10/03 14:15:47', user: 'Dr. E. Chen',   event: 'CREATE_RECORD',        resource: 'Prescription RX-0342',   ip: '10.0.1.62',   status: 'SUCCESS' },
  { id: 4,  timestamp: '10/03 13:58:33', user: 'unknown',       event: 'LOGIN_FAIL',           resource: 'Auth service',           ip: '192.0.2.14',  status: 'FAILED' },
  { id: 5,  timestamp: '10/03 13:45:11', user: 'A. Kowalski',   event: 'UPDATE_RECORD',        resource: 'Prescription RX-0341',   ip: '10.0.1.78',   status: 'SUCCESS' },
  { id: 6,  timestamp: '10/03 13:30:00', user: 'S. Mitchell',   event: 'EXPORT_DATA',          resource: 'GDPR Art. 15',           ip: '82.14.5.211', status: 'SUCCESS' },
  { id: 7,  timestamp: '10/03 13:22:14', user: 'admin',         event: 'CREATE_USER',          resource: 'Patient P5024',          ip: '10.0.1.10',   status: 'SUCCESS' },
  { id: 8,  timestamp: '10/03 12:45:00', user: 'Dr. J. Patel',  event: 'APPOINTMENT_CREATED',  resource: 'Appointment APT003',     ip: '10.0.1.45',   status: 'SUCCESS' },
  { id: 9,  timestamp: '10/03 11:30:22', user: 'S. Mitchell',   event: 'PATIENT_DATA_VIEWED',  resource: 'Patient P2773',          ip: '82.14.5.211', status: 'SUCCESS' },
  { id: 10, timestamp: '10/03 10:15:05', user: 'admin',         event: 'USER_DEACTIVATED',     resource: 'Patient P3401',          ip: '10.0.1.10',   status: 'SUCCESS' },
  { id: 11, timestamp: '10/03 09:50:30', user: 'Dr. M. Brown',  event: 'PRESCRIPTION_CREATED', resource: 'Prescription RX-0345',   ip: '10.0.1.33',   status: 'SUCCESS' },
  { id: 12, timestamp: '10/03 09:22:11', user: 'A. Kowalski',   event: 'PRESCRIPTION_DISPENSED', resource: 'Prescription RX-0310', ip: '10.0.1.78',   status: 'SUCCESS' },
]

export const inventory = [
  { id: 1, medication: 'Amoxicillin',  strength: '500mg', inStock: 85,  threshold: 20, status: 'GOOD' },
  { id: 2, medication: 'Paracetamol',  strength: '500mg', inStock: 12,  threshold: 20, status: 'LOW' },
  { id: 3, medication: 'Lisinopril',   strength: '10mg',  inStock: 42,  threshold: 15, status: 'GOOD' },
  { id: 4, medication: 'Ibuprofen',    strength: '200mg', inStock: 120, threshold: 30, status: 'GOOD' },
  { id: 5, medication: 'Metformin',    strength: '500mg', inStock: 28,  threshold: 25, status: 'WATCH' },
  { id: 6, medication: 'Atorvastatin', strength: '20mg',  inStock: 56,  threshold: 20, status: 'GOOD' },
  { id: 7, medication: 'Omeprazole',   strength: '20mg',  inStock: 63,  threshold: 25, status: 'GOOD' },
  { id: 8, medication: 'Amlodipine',   strength: '5mg',   inStock: 9,   threshold: 15, status: 'LOW' },
]

export const consentRecords = [
  { id: 1, type: 'DATA_PROCESSING',          label: 'Data Processing',          description: 'Allow Medly to process your personal health data for appointment management.',         granted: true,  grantedAt: '12 Jan 2026', version: '1.2' },
  { id: 2, type: 'MARKETING_COMMUNICATIONS', label: 'Marketing Communications', description: 'Receive news, health tips, and promotional content from Medly.',                       granted: false, grantedAt: null,          version: '1.0' },
  { id: 3, type: 'MEDICAL_RECORD_SHARING',   label: 'Medical Record Sharing',   description: 'Allow sharing of your medical records between authorised healthcare providers.',        granted: true,  grantedAt: '12 Jan 2026', version: '1.1' },
  { id: 4, type: 'THIRD_PARTY_SHARING',      label: 'Third Party Sharing',      description: 'Allow Medly to share anonymised data with approved NHS research partners.',            granted: false, grantedAt: null,          version: '1.0' },
]

export const weeklyChartData = [
  { day: 'Mon', count: 18 },
  { day: 'Tue', count: 32 },
  { day: 'Wed', count: 27 },
  { day: 'Thu', count: 41 },
  { day: 'Fri', count: 38 },
  { day: 'Sat', count: 14 },
  { day: 'Sun', count: 9 },
]

export const timeSlots = {
  D001: ['09:00', '09:30', '10:30', '11:00', '14:00', '14:30', '15:00'],
  D002: ['09:30', '10:00', '13:00', '14:00', '16:00'],
  D003: ['09:00', '11:15', '12:00', '15:30'],
  D004: ['10:00', '11:00', '14:30', '15:30'],
  D005: ['09:30', '10:30', '14:00', '15:00'],
}

export const scheduleEvents = [
  { id: 1, day: 'Mon', time: '09:00', patient: 'S. Mitchell', reason: 'Checkup',   type: 'BOOKED' },
  { id: 2, day: 'Mon', time: '10:00', patient: 'J. Williams', reason: 'Follow-up', type: 'BOOKED' },
  { id: 3, day: 'Tue', time: '09:00', patient: 'E. Davies',   reason: 'New patient',type: 'BOOKED' },
  { id: 4, day: 'Wed', time: '11:00', patient: 'R. Kumar',    reason: 'Pending',    type: 'PENDING' },
  { id: 5, day: 'Thu', time: '13:00', patient: '',            reason: 'Lunch',      type: 'BLOCKED' },
  { id: 6, day: 'Fri', time: '09:00', patient: 'M. Khan',     reason: 'Checkup',   type: 'BOOKED' },
  { id: 7, day: 'Sat', time: '10:00', patient: 'L. Park',     reason: 'Follow-up', type: 'BOOKED' },
]
