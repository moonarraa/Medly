import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { getDoctors, getDoctorAvailability, bookAppointment } from '../../services/api.js'

const SPECIALITIES = ['All Specialties', 'General Practice', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopaedics']

export default function BookAppointment() {
  const navigate = useNavigate()
  const [step, setStep]           = useState(1)
  const [search, setSearch]       = useState('')
  const [specialty, setSpecialty] = useState('All Specialties')
  const [selectedDoctor, setDoc]  = useState(null)
  const [selectedDate, setDate]   = useState('')
  const [selectedSlot, setSlot]   = useState(null)
  const [reason, setReason]       = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const [doctors, setDoctors]           = useState([])
  const [slots, setSlots]               = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [loadingSlots, setLoadingSlots]     = useState(false)
  const [booking, setBooking]               = useState(false)
  const [error, setError]                   = useState('')

  useEffect(() => {
    getDoctors()
      .then(setDoctors)
      .catch(console.error)
      .finally(() => setLoadingDoctors(false))
  }, [])

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) { setSlots([]); return }
    setLoadingSlots(true)
    setSlot(null)
    getDoctorAvailability(selectedDoctor.id, selectedDate)
      .then(setSlots)
      .catch(console.error)
      .finally(() => setLoadingSlots(false))
  }, [selectedDoctor, selectedDate])

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = d.name.toLowerCase().includes(q) ||
      d.specialisation.toLowerCase().includes(q) ||
      d.department.toLowerCase().includes(q)
    const matchSpec = specialty === 'All Specialties' || d.specialisation === specialty
    return matchSearch && matchSpec
  })

  const handleConfirm = async () => {
    setBooking(true)
    setError('')
    try {
      await bookAppointment({
        doctor_id: selectedDoctor.id,
        availability_id: selectedSlot?.id || null,
        appointment_date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        reason: reason || 'General consultation',
      })
      setConfirmed(true)
      setTimeout(() => navigate('/patient/appointments'), 1800)
    } catch (err) {
      setError(err.message)
      setBooking(false)
    }
  }

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
              placeholder="Search by name, specialty, or department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

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

          {loadingDoctors ? (
            <div className="card p-8 text-center text-gray-400 text-sm">Loading doctors…</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(d => (
                <div key={d.id} className="card p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {d.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{d.name}</p>
                    <p className="text-sm text-gray-500">{d.specialisation} · {d.department}</p>
                    {d.available_days.length > 0 && (
                      <p className="text-sm text-brand-700 font-medium mt-1">
                        Available: {d.available_days.map(day => day.slice(0, 3)).join(', ')}
                      </p>
                    )}
                  </div>
                  <button
                    className="btn-primary flex-shrink-0"
                    onClick={() => { setDoc(d); setDate(''); setSlot(null); setStep(2) }}
                  >
                    Select
                  </button>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="card p-8 text-center text-gray-400 text-sm">No doctors match your search.</div>
              )}
            </div>
          )}
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
              <p className="text-sm text-gray-500">{selectedDoctor.specialisation} · {selectedDoctor.department}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              className="input max-w-xs"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Available Time Slots</label>
              {loadingSlots ? (
                <p className="text-sm text-gray-400">Loading slots…</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-400">No availability on this date. Try a different date.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSlot(slot)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedSlot?.id === slot.id
                          ? 'bg-brand-700 text-white border-brand-700'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400'
                      }`}
                    >
                      {slot.start_time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline">Back</button>
            <button
              onClick={() => { if (selectedDate && selectedSlot) setStep(3) }}
              disabled={!selectedDate || !selectedSlot}
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
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
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
                    <span className="text-gray-500">Department</span>
                    <span className="font-medium text-gray-900">{selectedDoctor.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-900">{selectedSlot.start_time} – {selectedSlot.end_time}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  className="input resize-none h-24"
                  placeholder="Describe your symptoms or reason for this appointment…"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline">Back</button>
                <button onClick={handleConfirm} disabled={booking} className="btn-primary disabled:opacity-60">
                  {booking ? 'Booking…' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
