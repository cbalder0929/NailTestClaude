import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, PhoneOff, Percent, Wallet } from 'lucide-react'
import { salon } from '../config/salon'
import { appointmentsFor, hoursFor, workingTechs } from '../lib/availability'
import { clearBookings, loadBookings, subscribeBookings } from '../lib/bookingsStore'
import { DAY_SHORT, fmtDateLong, fmtTime, money, nextDays, toKey } from '../lib/dates'
import { getService, totals } from '../lib/pricing'
import { Badge } from '../components/ui/Badge'
import { Button, cn } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const PPM = 1.15 // pixels per minute on the timeline

export default function Admin() {
  const [, tick] = useState(0)
  useEffect(() => subscribeBookings(() => tick((n) => n + 1)), [])

  const days = useMemo(() => nextDays(salon.bookingWindowDays).map(toKey), [])
  const firstOpen = days.find((k) => hoursFor(k)) ?? days[0]
  const [dateKey, setDateKey] = useState(firstOpen)

  const session = loadBookings()
  const techs = workingTechs(dateKey)
  const hrs = hoursFor(dateKey)
  const cols = techs.map((t) => ({ tech: t, appts: appointmentsFor(t.id, dateKey) }))
  const all = cols.flatMap((c) => c.appts)

  const bookedMin = all.reduce((n, a) => n + (a.end - a.start), 0)
  const capacity = hrs ? techs.length * (hrs.close - hrs.open) : 0
  const deposits = all.reduce((n, a) => {
    const s = session.find((b) => b.confirmation === a.id)
    return n + (s ? s.deposit : totals(a.serviceId, []).deposit)
  }, 0)
  const callsAvoided = Math.round(all.length * salon.callsPerBooking)

  const stats = [
    { label: 'Bookings', value: String(all.length), note: 'on this day', Icon: CalendarCheck },
    { label: 'Deposits collected', value: money(deposits), note: 'secured before they arrive', Icon: Wallet },
    { label: 'Calls avoided', value: String(callsAvoided), note: `est. ${salon.callsPerBooking} calls per booking`, Icon: PhoneOff },
    { label: 'Chair utilization', value: capacity ? `${Math.round((bookedMin / capacity) * 100)}%` : '—', note: `${Math.round(bookedMin / 60)} of ${Math.round(capacity / 60)} hours`, Icon: Percent },
  ]

  const open = hrs?.open ?? 600
  const close = hrs?.close ?? 1200
  const hourMarks = Array.from({ length: Math.floor((close - open) / 60) + 1 }, (_, i) => open + i * 60)

  return (
    <div className="bg-blush-fade min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge tone="gold">Preview</Badge>
            <h1 className="mt-3 text-5xl sm:text-6xl">Salon dashboard</h1>
            <p className="mt-2 max-w-xl text-muted">What the owner sees: every booking lands here automatically — no phone tag, no double-booking.</p>
          </div>
          <Button variant="secondary" onClick={() => clearBookings()} disabled={!session.length}>
            Reset demo bookings
          </Button>
        </div>

        <div role="radiogroup" aria-label="Day" className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {days.map((k) => {
            const d = new Date(k + 'T00:00:00')
            const closed = !hoursFor(k)
            const on = k === dateKey
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setDateKey(k)}
                className={cn(
                  'flex min-h-14 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-[1.5px] text-sm font-semibold transition-colors',
                  on ? 'border-rose-deep bg-rose-deep text-white' : 'border-line bg-white hover:border-rose',
                  closed && !on && 'text-muted/70',
                )}
              >
                <span className="text-[0.68rem] uppercase tracking-[0.12em]">{DAY_SHORT[d.getDay()]}</span>
                <span className="font-display text-2xl leading-none">{d.getDate()}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, note, Icon }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">{label}</p>
                <Icon size={20} className="text-gold" />
              </div>
              <p className="mt-3 font-display text-5xl font-semibold leading-none text-rose-deep">{value}</p>
              <p className="mt-2 text-sm text-muted">{note}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-6 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-3xl">{fmtDateLong(dateKey)}</h2>
            <p className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-rose-deep" /> Booked just now</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded border border-rose bg-blush" /> Existing</span>
            </p>
          </div>
          {!hrs ? (
            <p className="rounded-2xl bg-blush p-6 text-center text-muted">The salon is closed this day.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-line/70">
              <div className="grid min-w-[44rem]" style={{ gridTemplateColumns: `3.5rem repeat(${cols.length}, minmax(9.5rem, 1fr))` }}>
                <div className="border-b border-line/70 bg-cream" />
                {cols.map(({ tech }) => (
                  <div key={tech.id} className="border-b border-l border-line/70 bg-cream px-3 py-2.5">
                    <p className="font-display text-xl font-semibold leading-tight">{tech.name.split(' ')[0]}</p>
                    <p className="text-xs text-muted">{tech.title}</p>
                  </div>
                ))}
                <div className="relative bg-cream" style={{ height: (close - open) * PPM }}>
                  {hourMarks.map((m) => (
                    <span key={m} className="absolute right-2 -translate-y-1/2 text-[0.68rem] font-medium text-muted first:translate-y-0" style={{ top: (m - open) * PPM }}>
                      {fmtTime(m).replace(':00', '')}
                    </span>
                  ))}
                </div>
                {cols.map(({ tech, appts }) => (
                  <div key={tech.id} className="relative border-l border-line/70 bg-white" style={{ height: (close - open) * PPM }}>
                    {hourMarks.map((m) => (
                      <div key={m} className="absolute inset-x-0 border-t border-line/50" style={{ top: (m - open) * PPM }} />
                    ))}
                    {appts.map((a) => {
                      const isNew = a.source === 'session'
                      const h = (a.end - a.start) * PPM - 3
                      return (
                        <div
                          key={a.id}
                          className={cn(
                            'absolute inset-x-1.5 overflow-hidden rounded-xl px-2.5 py-1.5 text-xs leading-tight',
                            isNew ? 'bg-rose-deep text-white shadow-[0_8px_16px_-8px_rgb(194_24_91/0.7)]' : 'border border-rose/50 bg-blush text-ink',
                          )}
                          style={{ top: (a.start - open) * PPM + 1, height: h }}
                          title={`${a.client} · ${getService(a.serviceId)?.name}`}
                        >
                          <p className="truncate font-semibold">{a.client}</p>
                          {h > 34 && <p className={cn('truncate', isNew ? 'text-white/90' : 'text-muted')}>{getService(a.serviceId)?.name}</p>}
                          {h > 52 && (
                            <p className={cn('truncate', isNew ? 'text-white/90' : 'text-muted')}>
                              {fmtTime(a.start)} – {fmtTime(a.end)}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="mt-6 p-5 sm:p-6">
          <h2 className="text-3xl">Booked online this session</h2>
          {session.length === 0 ? (
            <p className="mt-3 text-muted">No bookings yet. Make one on the booking page and it appears here instantly.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line/70">
              {[...session].reverse().map((b) => (
                <li key={b.confirmation}>
                  <button type="button" onClick={() => setDateKey(b.dateKey)} className="flex min-h-14 w-full flex-wrap items-center justify-between gap-2 rounded-xl px-2 py-3 text-left hover:bg-blush">
                    <span>
                      <span className="font-semibold">{b.client}</span> · {getService(b.serviceId)?.name}
                      <span className="block text-sm text-muted">
                        {fmtDateLong(b.dateKey)} at {fmtTime(b.start)} with {salon.technicians.find((t) => t.id === b.techId)?.name}
                      </span>
                    </span>
                    <span className="text-right text-sm">
                      <span className="block font-semibold text-[#17603A]">{money(b.deposit)} deposit</span>
                      <span className="text-muted">{b.confirmation}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
