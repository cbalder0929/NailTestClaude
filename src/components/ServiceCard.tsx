import { Clock } from 'lucide-react'
import type { Service } from '../config/salon'
import { fmtDuration } from '../lib/dates'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

export function ServiceCard({ service, showCategory }: { service: Service; showCategory?: boolean }) {
  return (
    <Card interactive className="flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        {showCategory ? <p className="eyebrow">{service.category}</p> : <span />}
        {service.popular && <Badge tone="gold">Popular</Badge>}
      </div>
      <h3 className="mt-2 text-[1.7rem]">{service.name}</h3>
      <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-muted">{service.description}</p>
      <div className="mt-5 flex items-end justify-between border-t border-line/70 pt-4">
        <div>
          <p className="font-display text-3xl font-semibold leading-none text-rose-deep">
            {service.from && <span className="mr-1 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted">from</span>}${service.price}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <Clock size={15} className="text-gold" /> {fmtDuration(service.duration)}
          </p>
        </div>
        <Button to={`/book?service=${service.id}`} aria-label={`Book ${service.name}`}>
          Book
        </Button>
      </div>
    </Card>
  )
}
