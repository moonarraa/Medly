import { useState } from 'react'
import React from 'react'
import Layout from '../../components/Layout.jsx'
import { scheduleEvents } from '../../data/mockData.js'

const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DATES  = [10, 11, 12, 13, 14, 15, 16]
const HOURS  = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']

const EVENT_STYLE = {
  BOOKED:   'bg-brand-700 text-white',
  PENDING:  'bg-yellow-400 text-white',
  BLOCKED:  'bg-gray-400 text-white',
}

export default function DoctorSchedule() {
  const [weekOffset, setWeekOffset] = useState(0)

  const getEvent = (day, hour) =>
    scheduleEvents.find(e => e.day === day && e.time === hour)

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">My Schedule</h1>
        <button className="btn-primary text-sm">+ Block Time Slot</button>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-base font-semibold text-gray-900 flex-1">
          Week of {10 + weekOffset * 7} – {16 + weekOffset * 7} March 2026
        </h2>
        <button
          onClick={() => setWeekOffset(o => o - 1)}
          className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
        >‹</button>
        <button
          onClick={() => setWeekOffset(o => o + 1)}
          className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
        >›</button>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-auto">
        <div className="grid" style={{ gridTemplateColumns: '64px repeat(7, 1fr)', minWidth: '700px' }}>
          {/* Header row */}
          <div className="bg-gray-50 border-b border-r border-gray-200 p-3" />
          {DAYS.map((d, i) => (
            <div key={d} className="bg-gray-50 border-b border-r border-gray-200 p-3 text-center">
              <p className="text-xs font-semibold text-gray-500">{d}</p>
              <p className="text-sm font-bold text-gray-900">{DATES[i]}</p>
            </div>
          ))}

          {/* Time rows */}
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              <div className="border-b border-r border-gray-100 px-3 py-4 text-xs text-gray-400 font-medium">
                {hour}
              </div>
              {DAYS.map(day => {
                const event = getEvent(day, hour)
                return (
                  <div key={`${day}-${hour}`} className="border-b border-r border-gray-100 p-1.5 min-h-[60px]">
                    {event && (
                      <div className={`rounded-lg p-2 text-xs ${EVENT_STYLE[event.type]}`}>
                        <p className="font-semibold truncate">{event.type === 'BLOCKED' ? 'BLOCKED' : event.patient}</p>
                        <p className="opacity-80 truncate">{event.reason}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4 text-sm text-gray-600">
        {[['bg-brand-700', 'Booked'], ['bg-yellow-400', 'Pending'], ['bg-gray-400', 'Blocked']].map(([bg, label]) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${bg}`} />
            {label}
          </div>
        ))}
      </div>
    </Layout>
  )
}
