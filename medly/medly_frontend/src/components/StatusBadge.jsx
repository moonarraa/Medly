const STYLES = {
  SCHEDULED:        'bg-yellow-100 text-yellow-800',
  CONFIRMED:        'bg-green-100 text-green-700',
  COMPLETED:        'bg-teal-100 text-teal-700',
  CANCELLED:        'bg-red-100 text-red-600',
  NO_SHOW:          'bg-gray-100 text-gray-600',
  PENDING:          'bg-yellow-100 text-yellow-800',
  DISPENSED:        'bg-green-100 text-green-700',
  READY:            'bg-teal-100 text-teal-700',
  EXPIRED:          'bg-gray-100 text-gray-600',
  ACTIVE:           'bg-green-100 text-green-700',
  INACTIVE:         'bg-gray-100 text-gray-600',
  GOOD:             'bg-green-100 text-green-700',
  LOW:              'bg-red-100 text-red-600',
  WATCH:            'bg-orange-100 text-orange-700',
  SUCCESS:          'bg-green-100 text-green-700',
  FAILED:           'bg-red-100 text-red-600',
  NEW:              'bg-sky-100 text-sky-700',
  BOOKED:           'bg-teal-100 text-teal-700',
}

const LABELS = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW:   'No Show',
  PENDING:   'Pending',
  DISPENSED: 'Dispensed',
  READY:     'Ready for pickup',
  EXPIRED:   'Expired',
  ACTIVE:    'Active',
  INACTIVE:  'Inactive',
  GOOD:      'Good',
  LOW:       'Low',
  WATCH:     'Watch',
  SUCCESS:   'Success',
  FAILED:    'Failed',
  NEW:       'New',
  BOOKED:    'Booked',
}

export default function StatusBadge({ status }) {
  const cls = STYLES[status] ?? 'bg-gray-100 text-gray-600'
  const label = LABELS[status] ?? status
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}
