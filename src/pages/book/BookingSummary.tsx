import { CalendarDays, Clock, Sparkles, User } from 'lucide-react'
import { salon } from '../../config/salon'
import { fmtDateLong, fmtDuration, fmtTime, money } from '../../lib/dates'
import { getTech, totals } from '../../lib/pricing'
import type { BookingState } from '../../lib/bookingState'

export function useSummary(state: BookingState) {
  const t = totals(state.serviceId, state.addOnIds)
  const tech = state.techId === 'any' ? (state.assignedTechId ? getTech(state.assignedTechId) : undefined) : getTech(state.techId)
  return { ...t, tech }
}

export function BookingSummary({ state }: { state: BookingState }) {
  const s = useSummary(state)
  const empty = <span className="text-muted">Not chosen yet</span>
  return (
    <div className="text-[0.95rem]">
      <p className="eyebrow">Your appointment</p>
      <h2 className="mt-1 text-3xl">{salon.name}</h2>
      <div className="gold-rule my-4" aria-hidden />

      <dl className="space-y-4">
        <div className="flex gap-3">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <dt className="sr-only">Service</dt>
            <dd>
              {s.svc ? (
                <>
                  <div className="flex justify-between gap-3 font-semibold">
                    <span>{s.svc.name}</span>
                    <span>{money(s.svc.price)}</span>
                  </div>
                  {s.adds.map((a) => (
                    <div key={a.id} className="mt-1 flex justify-between gap-3 text-muted">
                      <span>+ {a.name}</span>
                      <span>{money(a.price)}</span>
                    </div>
                  ))}
                </>
              ) : (
                empty
              )}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <User size={18} className="mt-0.5 shrink-0 text-gold" />
          <div>
            <dt className="sr-only">Technician</dt>
            <dd>
              {state.techId === 'any' ? (
                s.tech ? (
                  <>
                    <span className="font-semibold">{s.tech.name}</span> <span className="text-muted">(any available)</span>
                  </>
                ) : (
                  <span className="font-semibold">Any available artist</span>
                )
              ) : (
                <span className="font-semibold">{s.tech?.name}</span>
              )}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <CalendarDays size={18} className="mt-0.5 shrink-0 text-gold" />
          <div>
            <dt className="sr-only">Date and time</dt>
            <dd>
              {state.dateKey ? (
                <span className="font-semibold">
                  {fmtDateLong(state.dateKey)}
                  {state.time !== null && ` · ${fmtTime(state.time)}`}
                </span>
              ) : (
                empty
              )}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Clock size={18} className="mt-0.5 shrink-0 text-gold" />
          <div>
            <dt className="sr-only">Duration</dt>
            <dd>{s.duration ? <span className="font-semibold">{fmtDuration(s.duration)}</span> : empty}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-5 space-y-2 rounded-2xl bg-blush p-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">{money(s.subtotal)}</span>
        </div>
        <div className="flex justify-between text-rose-deep">
          <span className="font-semibold">Deposit due today</span>
          <span className="font-semibold">{money(s.deposit)}</span>
        </div>
        <div className="flex justify-between border-t border-rose/40 pt-2 text-muted">
          <span>Balance due at salon</span>
          <span>{money(s.balance)}</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">
        Deposit is {salon.deposit.percent}% (min {money(salon.deposit.minimum)}), applied to your total.
      </p>
    </div>
  )
}
