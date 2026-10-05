import { useEffect, useMemo, useRef } from 'react'
import { salon } from '../../config/salon'
import { dayStatus } from '../../lib/availability'
import { DAY_SHORT, fmtDateLong, nextDays, toKey } from '../../lib/dates'
import { useBooking } from '../../lib/bookingState'
import { totals } from '../../lib/pricing'
import { cn } from '../../components/ui/Button'

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function StepDate() {
  const { state, update } = useBooking()
  const { duration } = totals(state.serviceId, state.addOnIds)
  const selRef = useRef<HTMLButtonElement>(null)

  const days = useMemo(
    () =>
      nextDays(salon.bookingWindowDays).map((d) => {
        const key = toKey(d)
        return { d, key, status: dayStatus(key, state.techId, duration) }
      }),
    [state.techId, duration],
  )
  const selected = days.find((x) => x.key === state.dateKey)
  const techName = state.techId === 'any' ? null : salon.technicians.find((t) => t.id === state.techId)?.name

  useEffect(() => {
    selRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [])

  const label = (s: (typeof days)[number]['status']) =>
    s.state === 'closed'
      ? 'Closed'
      : s.state === 'off'
        ? 'Day off'
        : s.state === 'full' || s.state === 'past'
          ? 'Full'
          : s.spotsLeft <= 3
            ? `${s.spotsLeft} left`
            : 'Open'

  return (
    <div>
      <h2 className="text-4xl sm:text-5xl">Pick a day</h2>
      <p className="mt-2 text-muted">
        Next {salon.bookingWindowDays} days{techName ? ` with ${techName}` : ''}. Greyed days are closed, fully booked, or {techName ? `${techName.split(' ')[0]}’s` : 'an artist’s'} day off.
      </p>

      <div
        role="radiogroup"
        aria-label="Appointment date"
        className="no-scrollbar -mx-4 mt-7 flex snap-x gap-2.5 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-7 md:overflow-visible md:px-0"
      >
        {days.map(({ d, key, status }) => {
          const ok = status.state === 'open'
          const on = key === state.dateKey && ok
          const low = ok && status.spotsLeft <= 3
          return (
            <button
              key={key}
              ref={on ? selRef : undefined}
              type="button"
              role="radio"
              aria-checked={on}
              aria-disabled={!ok}
              disabled={!ok}
              aria-label={`${fmtDateLong(key)}, ${label(status)}`}
              onClick={() => update({ dateKey: key })}
              className={cn(
                'flex min-h-[5.75rem] w-[4.6rem] shrink-0 snap-center flex-col items-center justify-center rounded-2xl border-[1.5px] px-1 py-2 transition-[border-color,background-color,box-shadow,transform] duration-200 md:w-auto',
                on && 'border-rose-deep bg-rose-deep text-white shadow-[0_12px_22px_-10px_rgb(194_24_91/0.65)]',
                ok && !on && 'border-line bg-white hover:-translate-y-0.5 hover:border-rose',
                !ok && 'cursor-not-allowed border-transparent bg-line/40 text-muted/70',
              )}
            >
              <span className={cn('text-xs font-semibold uppercase tracking-[0.12em]', on ? 'text-white/90' : !ok ? 'text-muted/70' : 'text-muted')}>{DAY_SHORT[d.getDay()]}</span>
              <span className={cn('font-display text-[2rem] font-semibold leading-none', !ok && 'line-through decoration-1')}>{d.getDate()}</span>
              <span className={cn('text-[0.68rem] font-medium', on ? 'text-white/90' : 'text-muted')}>{MONTH[d.getMonth()]}</span>
              <span className={cn('mt-1 text-[0.68rem] font-semibold', on ? 'text-white' : low ? 'text-rose-deep' : !ok ? 'text-muted/80' : 'text-[#17603A]')}>{label(status)}</span>
            </button>
          )
        })}
      </div>

      <p className="mt-4 min-h-6 text-sm font-medium" aria-live="polite">
        {selected && selected.status.state === 'open' ? (
          <span>
            {fmtDateLong(selected.key)} ·{' '}
            <span className={selected.status.spotsLeft <= 3 ? 'text-rose-deep' : 'text-muted'}>
              {selected.status.spotsLeft <= 3 ? `Only ${selected.status.spotsLeft} spot${selected.status.spotsLeft === 1 ? '' : 's'} left` : `${selected.status.slots} start times available`}
            </span>
          </span>
        ) : (
          <span className="text-muted">Select a day to see times.</span>
        )}
      </p>
    </div>
  )
}
