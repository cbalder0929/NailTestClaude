import { Check } from 'lucide-react'
import { cn } from './Button'

interface Props {
  steps: string[]
  current: number
  onStepClick?: (i: number) => void
}

export function StepIndicator({ steps, current, onStepClick }: Props) {
  const pct = ((current + 1) / steps.length) * 100
  return (
    <nav aria-label="Booking progress">
      {/* mobile: compact label + bar */}
      <div className="md:hidden">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">
            Step {current + 1} of {steps.length}
          </p>
          <p className="font-display text-xl font-semibold">{steps[current]}</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blush" role="progressbar" aria-label="Booking progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={current + 1}>
          <div
            className="h-full rounded-full bg-rose-deep transition-[width] duration-500 ease-[var(--ease-soft)]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* desktop: numbered chain */}
      <ol className="hidden items-center md:flex">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!done || !onStepClick}
                onClick={() => done && onStepClick?.(i)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'group flex min-h-11 items-center gap-2.5 rounded-full pr-2 text-left',
                  done && onStepClick ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors duration-300',
                    active && 'bg-rose-deep text-white shadow-[0_6px_14px_-6px_rgb(194_24_91/0.7)]',
                    done && 'bg-blush text-rose-deep group-hover:bg-rose/50',
                    !active && !done && 'border border-line bg-white text-muted',
                  )}
                >
                  {done ? <Check size={16} strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn('text-sm font-semibold', active ? 'text-ink' : done ? 'text-rose-deep' : 'text-muted')}>
                  {label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <span className={cn('mx-2 h-px flex-1 transition-colors duration-500', i < current ? 'bg-rose' : 'bg-line')} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
