import { CalendarPlus, Navigation, RotateCcw } from 'lucide-react'
import { salon } from '../../config/salon'
import { fmtDateLong, fmtDuration, fmtTime, money } from '../../lib/dates'
import { buildICS, directionsUrl, downloadICS } from '../../lib/ics'
import { useBooking } from '../../lib/bookingState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useSummary } from './BookingSummary'

export function Confirmation() {
  const { state, reset } = useBooking()
  const s = useSummary(state)
  const code = state.confirmation as string
  const start = state.time as number
  const dateKey = state.dateKey as string
  const a = salon.address

  const addToCalendar = () =>
    downloadICS(
      `${salon.shortName}-appointment-${code}.ics`,
      buildICS({
        confirmation: code,
        title: `${s.svc?.name} at ${salon.name}`,
        dateKey,
        start,
        end: start + s.duration,
        description: `Confirmation ${code}. With ${s.tech?.name}. Balance due at salon: ${money(s.balance)}. ${salon.cancellationPolicy}`,
      }),
    )

  return (
    <div className="step-in mx-auto max-w-2xl text-center">
      <div className="ring-pulse mx-auto grid size-24 place-items-center rounded-full bg-blush">
        <svg viewBox="0 0 72 72" width="72" height="72" fill="none" aria-hidden>
          <circle className="draw-circle" cx="36" cy="36" r="30" stroke="var(--color-rose-deep)" strokeWidth="3" strokeLinecap="round" />
          <path className="draw-check" d="M23 37l9 9 17-19" stroke="var(--color-rose-deep)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="eyebrow mt-6">You’re booked</p>
      <h1 className="mt-2 text-5xl sm:text-6xl">See you soon, {state.info.first}.</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        We’ve sent your confirmation to {state.info.email}{state.info.sms ? ' and by text' : ''}.
      </p>

      <Card className="mt-8 overflow-hidden text-left">
        <div className="bg-blush px-6 py-5 text-center">
          <p className="eyebrow">Confirmation number</p>
          <p className="mt-1 font-display text-4xl font-semibold tracking-[0.08em] text-rose-deep" aria-label={`Confirmation number ${code.split('').join(' ')}`}>
            {code}
          </p>
        </div>
        <dl className="divide-y divide-line/70 px-6 text-[0.95rem]">
          <div className="flex justify-between gap-4 py-3.5">
            <dt className="text-muted">Service</dt>
            <dd className="text-right font-semibold">
              {s.svc?.name}
              {s.adds.map((x) => (
                <span key={x.id} className="block text-sm font-normal text-muted">
                  + {x.name}
                </span>
              ))}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3.5">
            <dt className="text-muted">Artist</dt>
            <dd className="font-semibold">{s.tech?.name}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3.5">
            <dt className="text-muted">When</dt>
            <dd className="text-right font-semibold">
              {fmtDateLong(dateKey)}
              <span className="block">
                {fmtTime(start)} – {fmtTime(start + s.duration)}
              </span>
              <span className="block text-sm font-normal text-muted">{fmtDuration(s.duration)}</span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3.5">
            <dt className="text-muted">Where</dt>
            <dd className="text-right font-semibold">
              {salon.name}
              <span className="block text-sm font-normal text-muted">
                {a.street}, {a.city}, {a.state} {a.zip}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3.5">
            <dt className="text-muted">Deposit paid</dt>
            <dd className="font-semibold text-[#17603A]">{money(s.deposit)}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3.5">
            <dt className="text-muted">Balance due at salon</dt>
            <dd className="font-semibold">{money(s.balance)}</dd>
          </div>
        </dl>
      </Card>

      <p className="mx-auto mt-5 max-w-md text-sm text-muted">{salon.cancellationPolicy}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Button onClick={addToCalendar} size="lg">
          <CalendarPlus size={19} /> Add to Calendar
        </Button>
        <Button href={directionsUrl()} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg">
          <Navigation size={19} /> Get Directions
        </Button>
      </div>
      <Button variant="ghost" className="mt-3" onClick={() => reset()}>
        <RotateCcw size={17} /> Book another appointment
      </Button>
    </div>
  )
}
