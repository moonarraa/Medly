import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { doctors, timeSlots } from '../../data/mockData.js'

const SPECIALITIES = ['All Specialties', 'General Practice', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopaedics']

export default function BookAppointment() {
  const navigate = useNavigate()
  const [step, setStep]                 = useState(1)
  const [search, setSearch]             = useState('')
  const [specialty, setSpecialty]       = useState('All Specialties')
  const [selectedDoctor, setDoc]        = useState(null)
  const [selectedDate, setDate]         = useState('')
  const [selectedTime, setTime]         = useState('')
  const [reason, setReason]             = useState('')
  const [confirmed, setConfirmed]       = useState(false)

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialisation.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital.toLowerCase().includes(search.toLowerCase())
    const matchSpec = specialty === 'All Specialties' || d.specialisation === specialty
    return matchSearch && matchSpec
  })

  const slots = selectedDoctor ? (timeSlots[selectedDoctor.id] ?? []) : []

  const handleConfirm = () => {
    setConfirmed(true)
    setTimeout(() => navigate('/patient/appointments'), 1800)
  }

  // Step indicators
  const steps = ['Find Doctor', 'Select Slot', 'Confirm']

  return (
    <Layout>
      <h1 className="page-title mb-6">Book an Appointment</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => {
          const num = i + 1
          const active = step === num
          const done   = step > num
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                active ? 'bg-brand-700 text-white' : done ? 'bg-brand-200 text-brand-800' : 'bg-gray-200 text-gray-500'
              }`}>
                {done ? '✓' : num}
              </div>
              <span className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className="w-10 h-px bg-gray-200 mx-1" />}
            </div>
          )
        })}
      </div>

      {/* ─── Step 1: Find Doctor ─── */}
      {step === 1 && (
        <>
          <div className="flex gap-3 mb-4">
            <input
              className="input flex-1"
              placeholder="Search by name, specialty, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="btn-outline">Filters</button>
            <button className="btn-primary">Search</button>
          </div>

          {/* Specialty chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {SPECIALITIES.map(s => (
              <button
                key={s}
                onClick={() => setSpecialty(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  specialty === s
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(d => (
              <div key={d.id} className="card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {d.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{d.name}</p>
                  <p className="text-sm text-gray-500">{d.specialisation} – {d.experience}</p>
                  <p className="text-sm text-gray-400">
                    ★ {d.rating} ({d.reviews} reviews) · {d.hospital}
                  </p>
                  <p className="text-sm text-brand-700 font-medium mt-1">
                    Next available: {d.nextAvailable}
                  </p>
                </div>
                <button
                  className="btn-primary flex-shrink-0"
                  onClick={() => { setDoc(d); setStep(2) }}
                >
                  Select
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="card p-8 text-center text-gray-400 text-sm">No doctors match your search.</div>
            )}
          </div>
        </>
      )}

      {/* ─── Step 2: Select Slot ─── */}
      {step === 2 && selectedDoctor && (
        <>
          <div className="card p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center">
              {selectedDoctor.initials}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{selectedDoctor.name}</p>
              <p className="text-sm text-gray-500">{selectedDoctor.specialisation} · {selectedDoctor.hospital}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              className="input max-w-xs"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={e => { setDate(e.target.value); setTime('') }}
            />
          </div>

          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Available Time Slots</label>
              <div className="flex flex-wrap gap-2">
                {slots.map(t => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedTime === t
                        ? 'bg-brand-700 text-white border-brand-700'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline">Back</button>
            <button
              onClick={() => { if (selectedDate && selectedTime) setStep(3) }}
              disabled={!selectedDate || !selectedTime}
              className="btn-primary disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {/* ─── Step 3: Confirm ─── */}
      {step === 3 && selectedDoctor && (
        <>
          {confirmed ? (
            <div className="card p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
              <p className="text-gray-500 text-sm">Redirecting to your appointments…</p>
            </div>
          ) : (
            <div className="max-w-lg">
              <div className="card p-6 mb-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doctor</span>
                    <span className="font-medium text-gray-900">{selectedDoctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Speciality</span>
                    <span className="font-medium text-gray-900">{selectedDoctor.specialisation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hospital</span>
                    <span className="font-medium text-gray-900">{selectedDoctor.hospital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-900">{selectedTime}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  className="input resize-none h-24"
                  placeholder="Describe your symptoms or reason for this appointment..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline">Back</button>
                <button onClick={handleConfirm} className="btn-primary">Confirm Booking</button>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
