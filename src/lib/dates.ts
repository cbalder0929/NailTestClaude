export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (n: number) => String(n).padStart(2, '0')

export function toKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export function fromKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function startOfToday() {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}
export function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}
export function nextDays(count: number) {
  const t = startOfToday()
  return Array.from({ length: count }, (_, i) => addDays(t, i))
}
export function nowMinutes() {
  const n = new Date()
  return n.getHours() * 60 + n.getMinutes()
}
export function parseHM(hm: string) {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}
/** 855 → "2:15 PM" */
export function fmtTime(mins: number) {
  const h24 = Math.floor(mins / 60)
  const m = mins % 60
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h}:${pad(m)} ${h24 < 12 ? 'AM' : 'PM'}`
}
/** "10:00" → "10 AM", "17:30" → "5:30 PM" */
export function fmtHM(hm: string) {
  const mins = parseHM(hm)
  const h24 = Math.floor(mins / 60)
  const m = mins % 60
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h}${m ? `:${pad(m)}` : ''} ${h24 < 12 ? 'AM' : 'PM'}`
}
export function fmtDateLong(key: string) {
  const d = fromKey(key)
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`
}
export function fmtDateShort(iso: string) {
  const d = fromKey(iso)
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
export function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (!h) return `${m} min`
  return m ? `${h} hr ${m} min` : `${h} hr`
}
export const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`
