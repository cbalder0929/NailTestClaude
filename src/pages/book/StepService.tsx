import { useRef } from 'react'
import { Check, Clock } from 'lucide-react'
import { salon } from '../../config/salon'
import { fmtDuration } from '../../lib/dates'
import { useBooking } from '../../lib/bookingState'
import { cn } from '../../components/ui/Button'

export function StepService() {
  const { state, update } = useBooking()
  const addOnsRef = useRef<HTMLDivElement>(null)
  const cats = [...new Set(salon.services.map((s) => s.category))]

  const pick = (id: string) => {
    const first = !state.serviceId
    update({ serviceId: id })
    if (first) {
      setTimeout(() => {
        const el = addOnsRef.current
        if (el && el.getBoundingClientRect().top > window.innerHeight * 0.65) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 120)
    }
  }
  const toggle = (id: string) =>
    update({ addOnIds: state.addOnIds.includes(id) ? state.addOnIds.filter((x) => x !== id) : [...state.addOnIds, id] })

  return (
    <div>
      <h2 className="text-4xl sm:text-5xl">Choose your service</h2>
      <p className="mt-2 text-muted">Pick one main service, then customize with add-ons.</p>

      <div role="radiogroup" aria-label="Main service" className="mt-7 space-y-7">
        {cats.map((cat) => (
          <div key={cat}>
            <p className="eyebrow mb-3">{cat}</p>
            <div className="space-y-3">
              {salon.services
                .filter((s) => s.category === cat)
                .map((s) => {
                  const on = state.serviceId === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => pick(s.id)}
                      className={cn(
                        'flex min-h-[4.5rem] w-full items-center gap-4 rounded-2xl border-[1.5px] p-4 text-left transition-[border-color,box-shadow,background-color] duration-200',
                        on ? 'border-rose-deep bg-blush shadow-soft' : 'border-line bg-white hover:border-rose',
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors',
                          on ? 'border-rose-deep bg-rose-deep text-white' : 'border-rose/70',
                        )}
                        aria-hidden
                      >
                        {on && <Check size={14} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[1.45rem] font-semibold leading-tight">{s.name}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                          <Clock size={14} className="text-gold" /> {fmtDuration(s.duration)}
                        </span>
                      </span>
                      <span className="shrink-0 text-right font-display text-2xl font-semibold text-rose-deep">
                        {s.from && <span className="block font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">from</span>}${s.price}
                      </span>
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      <div ref={addOnsRef} className="mt-10 scroll-mt-24">
        <p className="eyebrow mb-1">Add-ons (optional)</p>
        <p className="mb-4 text-sm text-muted">Tap to add. Time and price update instantly.</p>
        <div className="flex flex-wrap gap-2.5" role="group" aria-label="Add-ons">
          {salon.addOns.map((a) => {
            const on = state.addOnIds.includes(a.id)
            return (
              <button
                key={a.id}
                type="button"
                aria-pressed={on}
                disabled={!state.serviceId}
                onClick={() => toggle(a.id)}
                className={cn(
                  'flex min-h-12 items-center gap-2 rounded-full border-[1.5px] px-4 text-sm font-semibold transition-colors duration-200 disabled:opacity-50',
                  on ? 'border-rose-deep bg-rose-deep text-white' : 'border-line bg-white hover:border-rose',
                )}
              >
                {on && <Check size={15} strokeWidth={3} />}
                {a.name}
                <span className={cn('font-normal', on ? 'text-white/85' : 'text-muted')}>
                  +${a.price}
                  {a.from && '+'} · {a.duration}m
                </span>
              </button>
            )
          })}
        </div>
        {!state.serviceId && <p className="mt-3 text-sm text-muted">Choose a service above to enable add-ons.</p>}
      </div>
    </div>
  )
}
