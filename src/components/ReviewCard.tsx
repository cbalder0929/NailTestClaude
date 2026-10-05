import { Quote } from 'lucide-react'
import type { Review } from '../config/salon'
import { fmtDateShort } from '../lib/dates'
import { Card } from './ui/Card'
import { StarRating } from './ui/StarRating'

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-start justify-between">
        <StarRating value={review.stars} size={17} />
        <Quote size={26} className="text-gold/70" strokeWidth={1.4} aria-hidden />
      </div>
      <p className="mt-4 flex-1 text-[1rem] leading-relaxed text-ink/90">{review.text}</p>
      <div className="mt-5 flex items-center gap-3 border-t border-line/70 pt-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blush font-display text-lg font-semibold text-rose-deep" aria-hidden>
          {review.name[0]}
        </span>
        <div className="min-w-0 text-sm">
          <p className="font-semibold">{review.name}</p>
          <p className="truncate text-muted">
            {review.service} · {fmtDateShort(review.date)}
          </p>
        </div>
      </div>
    </Card>
  )
}
