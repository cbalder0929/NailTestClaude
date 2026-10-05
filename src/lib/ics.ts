import { salon } from '../config/salon'
import { fromKey } from './dates'

const p = (n: number) => String(n).padStart(2, '0')
const stamp = (dateKey: string, mins: number) => {
  const d = fromKey(dateKey)
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(Math.floor(mins / 60))}${p(mins % 60)}00`
}
const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

export function buildICS(o: {
  confirmation: string
  title: string
  dateKey: string
  start: number
  end: number
  description: string
}) {
  const a = salon.address
  const loc = `${salon.name}, ${a.street}, ${a.city}, ${a.state} ${a.zip}`
  const now = new Date()
  const dtstamp = `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}T${p(now.getUTCHours())}${p(now.getUTCMinutes())}00Z`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${salon.name}//Booking//EN`,
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${o.confirmation}@${salon.email.split('@')[1]}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${stamp(o.dateKey, o.start)}`,
    `DTEND:${stamp(o.dateKey, o.end)}`,
    `SUMMARY:${esc(o.title)}`,
    `LOCATION:${esc(loc)}`,
    `DESCRIPTION:${esc(o.description)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Appointment reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadICS(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const directionsUrl = () => {
  const a = salon.address
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${salon.name}, ${a.street}, ${a.city}, ${a.state} ${a.zip}`,
  )}`
}
export const mapsUrl = () => {
  const a = salon.address
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${salon.name}, ${a.street}, ${a.city}, ${a.state} ${a.zip}`,
  )}`
}
