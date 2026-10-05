import { Star } from 'lucide-react'
import { cn } from './Button'

export function StarRating({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)))
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }} aria-hidden>
            <Star size={size} className="absolute inset-0 text-gold/35" strokeWidth={1.5} fill="currentColor" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-gold" strokeWidth={1.5} fill="currentColor" />
            </span>
          </span>
        )
      })}
    </span>
  )
}
