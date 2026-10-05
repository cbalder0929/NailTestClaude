/**
 * Availability engine.
 *
 * Nothing here is random at render time. For every (technician, date) we
 * generate a *seeded* set of existing appointments, add any bookings made in
 * this demo session, and then compute the start times where the full
 * service + add-on duration fits inside opening hours without overlapping.
 */
import { salon } from '../config/salon'
import { loadBookings } from './bookingsStore'
import { fromKey, nowMinutes, parseHM, startOfToday, toKey } from './dates'
import { getService } from './pricing'

export interface Appt {
  id: string
  techId: string
  start: number
  end: number
  serviceId: string
  client: string
  source: 'seed' | 'session'
}
export interface Slot {
  time: number
  /** every technician who can take this start time */
  techIds: string[]
  /** the technician we'd assign (for "Any Available": the least-busy one) */
  assigned: string
}
export type DayState = 'open' | 'closed' | 'off' | 'full' | 'past'
export interface DayStatus {
  state: DayState
  slots: number
  spotsLeft: number
}

/* ── seeded RNG ─────────────────────────────────────────────────────────── */
function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = ['Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Ella', 'Scarlett', 'Grace', 'Chloe', 'Victoria', 'Riley', 'Zoe', 'Nora', 'Lily', 'Hazel', 'Aria', 'Naomi', 'Camila', 'Leah']
const LAST = ['Johnson', 'Martinez', 'Chen', 'Patel', 'Nguyen', 'Brooks', 'Kowalski', 'Rivera', 'Okafor', 'Murphy', 'Bennett', 'Hayes', 'Sullivan', 'Reyes', 'Park', 'Morales']
const EXTRA_MINUTES = [0, 0, 0, 15, 15]

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/* ── salon & technician schedule ───────────────────────────────────────── */
export function hoursFor(dateKey: string) {
  const h = salon.hours[fromKey(dateKey).getDay()]
  return h ? { open: parseHM(h.open), close: parseHM(h.close) } : null
}
export function techWorks(techId: string, dateKey: string) {
  const t = salon.technicians.find((x) => x.id === techId)
  return !!t && !!hoursFor(dateKey) && t.workingDays.includes(fromKey(dateKey).getDay())
}
export function workingTechs(dateKey: string) {
  return salon.technicians.filter((t) => techWorks(t.id, dateKey))
}

/* ── existing appointments ─────────────────────────────────────────────── */
const seedCache = new Map<string, Appt[]>()
function seededAppointments(techId: string, dateKey: string): Appt[] {
  const ck = `${techId}|${dateKey}`
  const hit = seedCache.get(ck)
  if (hit) return hit
  const hrs = hoursFor(dateKey)
  const out: Appt[] = []
  if (hrs && techWorks(techId, dateKey)) {
    const rng = mulberry32(hash(ck))
    const dow = fromKey(dateKey).getDay()
    // Fri/Sat are the rush days; every tech-day gets its own jitter so some are nearly full
    const base = dow === 5 || dow === 6 ? 0.78 : dow === 0 ? 0.5 : 0.4
    const fill = clamp(base + (rng() - 0.5) * 0.55, 0.1, 0.96)
    const span = hrs.close - hrs.open
    const target = span * fill
    let booked = 0
    const tech = salon.technicians.find((t) => t.id === techId)!
    const menu = salon.services.filter((x) => tech.serviceCategories.includes(x.category))
    for (let tries = 0; tries < 400 && booked < target; tries++) {
      const svc = menu[Math.floor(rng() * menu.length)]
      const dur = svc.duration + EXTRA_MINUTES[Math.floor(rng() * EXTRA_MINUTES.length)]
      const steps = Math.floor((span - dur) / 15) + 1
      if (steps <= 0) continue
      const start = hrs.open + 15 * Math.floor(rng() * steps)
      const end = start + dur
      if (out.some((a) => start < a.end && end > a.start)) continue
      out.push({
        id: `seed-${ck}-${start}`,
        techId,
        start,
        end,
        serviceId: svc.id,
        client: `${FIRST[Math.floor(rng() * FIRST.length)]} ${LAST[Math.floor(rng() * LAST.length)][0]}.`,
        source: 'seed',
      })
      booked += dur
    }
    out.sort((a, b) => a.start - b.start)
  }
  seedCache.set(ck, out)
  return out
}
/** Seeded appointments + bookings made in this session. */
export function appointmentsFor(techId: string, dateKey: string): Appt[] {
  const session: Appt[] = loadBookings()
    .filter((b) => b.techId === techId && b.dateKey === dateKey)
    .map((b) => ({
      id: b.confirmation,
      techId,
      start: b.start,
      end: b.end,
      serviceId: b.serviceId,
      client: b.client,
      source: 'session' as const,
    }))
  return [...seededAppointments(techId, dateKey), ...session].sort((a, b) => a.start - b.start)
}
export function appointmentsForDay(dateKey: string): Appt[] {
  return workingTechs(dateKey).flatMap((t) => appointmentsFor(t.id, dateKey))
}

/* ── slot computation ──────────────────────────────────────────────────── */
function freeStarts(techId: string, dateKey: string, duration: number): number[] {
  const hrs = hoursFor(dateKey)
  if (!hrs || !techWorks(techId, dateKey) || duration <= 0) return []
  const busy = appointmentsFor(techId, dateKey)
  const step = salon.slotIntervalMinutes
  let earliest = hrs.open
  if (dateKey === toKey(startOfToday())) {
    const cutoff = nowMinutes() + salon.leadTimeMinutes
    earliest = Math.max(earliest, Math.ceil(cutoff / step) * step)
  }
  const starts: number[] = []
  for (let t = earliest; t + duration <= hrs.close; t += step) {
    if (!busy.some((a) => t < a.end && t + duration > a.start)) starts.push(t)
  }
  return starts
}
const bookedMinutes = (techId: string, dateKey: string) =>
  appointmentsFor(techId, dateKey).reduce((n, a) => n + (a.end - a.start), 0)

export function computeSlots(dateKey: string, tech: 'any' | string, duration: number): Slot[] {
  const candidates = tech === 'any' ? workingTechs(dateKey).map((t) => t.id) : [tech]
  const byTime = new Map<number, string[]>()
  for (const id of candidates) {
    for (const t of freeStarts(id, dateKey, duration)) {
      byTime.set(t, [...(byTime.get(t) ?? []), id])
    }
  }
  const load = new Map(candidates.map((id) => [id, bookedMinutes(id, dateKey)]))
  return [...byTime.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([time, techIds]) => ({
      time,
      techIds,
      assigned: [...techIds].sort((a, b) => (load.get(a) ?? 0) - (load.get(b) ?? 0))[0],
    }))
}

/** How many back-to-back appointments of this length still fit that day. */
export function spotsLeft(dateKey: string, tech: 'any' | string, duration: number) {
  const candidates = tech === 'any' ? workingTechs(dateKey).map((t) => t.id) : [tech]
  let n = 0
  for (const id of candidates) {
    let cursor = -1
    for (const s of freeStarts(id, dateKey, duration)) {
      if (s >= cursor) {
        n++
        cursor = s + duration
      }
    }
  }
  return n
}

export function dayStatus(dateKey: string, tech: 'any' | string, duration: number): DayStatus {
  if (!hoursFor(dateKey)) return { state: 'closed', slots: 0, spotsLeft: 0 }
  if (tech !== 'any' && !techWorks(tech, dateKey)) return { state: 'off', slots: 0, spotsLeft: 0 }
  const slots = computeSlots(dateKey, tech, duration)
  if (!slots.length) {
    const hrs = hoursFor(dateKey)!
    const passed = dateKey === toKey(startOfToday()) && nowMinutes() + salon.leadTimeMinutes + duration > hrs.close
    return { state: passed ? 'past' : 'full', slots: 0, spotsLeft: 0 }
  }
  return { state: 'open', slots: slots.length, spotsLeft: spotsLeft(dateKey, tech, duration) }
}

export type Period = 'Morning' | 'Afternoon' | 'Evening'
export function periodOf(mins: number): Period {
  return mins < 12 * 60 ? 'Morning' : mins < 17 * 60 ? 'Afternoon' : 'Evening'
}

export function getServiceName(id: string) {
  return getService(id)?.name ?? 'Appointment'
}
