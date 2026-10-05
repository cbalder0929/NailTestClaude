import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { computeSlots, periodOf, spotsLeft } from '../../lib/availability'
import type { Period } from '../../lib/availability'
import { fmtDateLong, fmtDuration, fmtTime } from '../../lib/dates'
import { useBooking } from '../../lib/bookingState'
import { getTech, totals } from '../../lib/pricing'
import { Badge } from '../../components/ui/Badge'
import { cn } from '../../components/ui/Button'

const periods: Period[] = ['Morning', 'Afternoon', 'Evening']

export function StepTime() {
  const { state, update } = useBooking()
  const { duration } = totals(state.serviceId, state.addOnIds)
  const dateKey = state.dateKey as string
  const slots = useMemo(() => computeSlots(dateKey, state.techId, duration), [dateKey, state.techId, duration])
  const left = useMemo(() => spotsLeft(dateKey, state.techId, duration), [dateKey, state.techId, duration])
  const assigned = state.assignedTechId ? getTech(state.assignedTechId) : null

  return (
    <div>
      <h2 className="text-4xl sm:text-5xl">Choose a time</h2>
      <p className="mt-2 text-muted">
        {fmtDateLong(dateKey)} · your appointment takes {fmtDuration(duration)}.
      </p>

      {left <= 3 && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-blush p-4 text-rose-deep" role="status">
          <Flame size={20} className="shrink-0" />
          <p className="font-semibold">
            Only {left} spot{left === 1 ? '' : 's'} left on this day.
          </p>
        </div>
      )}

      <div className="mt-7 space-y-8">
        {periods.map((p) => {
          const list = slots.filter((s) => periodOf(s.time) === p)
          if (!list.length) return null
          return (
            <section key={p} aria-label={`${p} times`}>
              <div className="mb-3 flex items-baseline gap-3">
                <h3 className="text-2xl">{p}</h3>
                <span className="text-sm text-muted">{list.length} times</span>
              </div>
              <div role="radiogroup" aria-label={`${p} start times`} className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-4">
                {list.map((s) => {
                  const on = state.time === s.time
                  return (
                    <button
                      key={s.time}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => update({ time: s.time, assignedTechId: s.assigned })}
                      className={cn(
                        'min-h-12 rounded-full border-[1.5px] px-2 text-[0.92rem] font-semibold transition-[border-color,background-color,box-shadow] duration-200',
                        on ? 'border-rose-deep bg-rose-deep text-white shadow-[0_10px_18px_-10px_rgb(194_24_91/0.7)]' : 'border-line bg-white hover:border-rose hover:bg-blush',
                      )}
                    >
                      {fmtTime(s.time)}
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
        {!slots.length && <p className="rounded-2xl bg-blush p-5 text-muted">No times remain on this day. Please pick another date.</p>}
      </div>

      {state.techId === 'any' && (
        <p className="mt-7 text-sm text-muted" aria-live="polite">
          {assigned ? (
            <>
              <Badge tone="success" className="mr-2">
                Matched
              </Badge>
              You’ll be with <span className="font-semibold text-ink">{assigned.name}</span> ({assigned.title}).
            </>
          ) : (
            'Choose a time and we’ll match you with an available artist.'
          )}
        </p>
      )}
    </div>
  )
}
