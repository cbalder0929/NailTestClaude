import { Check, Zap } from 'lucide-react'
import { salon } from '../../config/salon'
import { DAY_SHORT } from '../../lib/dates'
import { useBooking } from '../../lib/bookingState'
import { Badge } from '../../components/ui/Badge'
import { cn } from '../../components/ui/Button'
import { SafeImage } from '../../components/ui/SafeImage'
import { StarRating } from '../../components/ui/StarRating'
import { img } from '../../lib/img'

const weekOrder = [1, 2, 3, 4, 5, 6, 0]

export function StepTech() {
  const { state, update } = useBooking()
  return (
    <div>
      <h2 className="text-4xl sm:text-5xl">Choose your artist</h2>
      <p className="mt-2 text-muted">Have a favorite? Pick them. Otherwise “Any available” finds you the earliest opening.</p>

      <div role="radiogroup" aria-label="Technician" className="mt-7 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          role="radio"
          aria-checked={state.techId === 'any'}
          onClick={() => update({ techId: 'any' })}
          className={cn(
            'relative flex min-h-[7rem] items-center gap-4 rounded-2xl border-[1.5px] p-4 text-left transition-[border-color,box-shadow,background-color] duration-200 sm:col-span-2',
            state.techId === 'any' ? 'border-rose-deep bg-blush shadow-soft' : 'border-gold/60 bg-gradient-to-r from-[#FFF6E4] to-white hover:border-gold',
          )}
        >
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-white text-gold shadow-soft ring-1 ring-gold/40">
            <Zap size={28} strokeWidth={1.5} />
          </span>
          <span className="min-w-0 flex-1 pr-7">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[1.6rem] font-semibold leading-tight">Any available artist</span>
              <Badge tone="gold">Fastest</Badge>
            </span>
            <span className="mt-1 block text-sm text-muted">Merges every artist’s openings so you see the most times. We’ll match you with the best fit.</span>
          </span>
          {state.techId === 'any' && <Check className="absolute right-4 top-4 text-rose-deep" size={22} strokeWidth={3} aria-hidden />}
        </button>

        {salon.technicians.map((t) => {
          const on = state.techId === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => update({ techId: t.id })}
              className={cn(
                'relative flex gap-4 rounded-2xl border-[1.5px] p-4 text-left transition-[border-color,box-shadow,background-color] duration-200',
                on ? 'border-rose-deep bg-blush shadow-soft' : 'border-line bg-white hover:border-rose',
              )}
            >
              <SafeImage src={img(t.photo, 240, 240)} alt={`Portrait of ${t.name}`} className="size-[4.5rem] shrink-0 rounded-full" />
              <span className="min-w-0 flex-1 pr-6">
                <span className="block font-display text-[1.5rem] font-semibold leading-tight">{t.name}</span>
                <span className="block text-sm text-muted">{t.title}</span>
                <span className="mt-1.5 flex items-center gap-1.5 text-sm">
                  <StarRating value={t.rating} size={14} />
                  <span className="font-semibold">{t.rating.toFixed(1)}</span>
                  <span className="text-muted">({t.reviews})</span>
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {t.specialties.map((sp) => (
                    <Badge key={sp} tone={on ? 'white' : 'blush'} className="!text-[0.65rem]">
                      {sp}
                    </Badge>
                  ))}
                </span>
                <span className="mt-2.5 flex gap-1" aria-label={`Works ${t.workingDays.map((d) => DAY_SHORT[d]).join(', ')}`}>
                  {weekOrder.map((d) => (
                    <span
                      key={d}
                      aria-hidden
                      className={cn(
                        'grid size-6 place-items-center rounded-full text-[0.62rem] font-semibold',
                        t.workingDays.includes(d) ? 'bg-rose-deep text-white' : 'bg-line/60 text-muted',
                      )}
                    >
                      {DAY_SHORT[d][0]}
                    </span>
                  ))}
                </span>
              </span>
              {on && <Check className="absolute right-4 top-4 text-rose-deep" size={22} strokeWidth={3} aria-hidden />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
