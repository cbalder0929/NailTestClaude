/** Bookings made during this demo session. Shared with /admin and with the
 *  availability engine so a booked slot disappears afterwards. */
export interface StoredBooking {
  confirmation: string
  serviceId: string
  addOnIds: string[]
  techId: string
  dateKey: string
  start: number
  end: number
  client: string
  phone: string
  total: number
  deposit: number
  createdAt: number
}
const KEY = 'rna.bookings.v1'
const EVT = 'rna:bookings'

export function loadBookings(): StoredBooking[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}
export function saveBooking(b: StoredBooking) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...loadBookings(), b]))
    window.dispatchEvent(new Event(EVT))
  } catch {
    /* storage unavailable — demo still works for this page view */
  }
}
export function clearBookings() {
  try {
    localStorage.removeItem(KEY)
    window.dispatchEvent(new Event(EVT))
  } catch {
    /* ignore */
  }
}
export function subscribeBookings(fn: () => void) {
  window.addEventListener(EVT, fn)
  window.addEventListener('storage', fn)
  return () => {
    window.removeEventListener(EVT, fn)
    window.removeEventListener('storage', fn)
  }
}
