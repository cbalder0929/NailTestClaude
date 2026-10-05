import type { ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { salon } from '../../config/salon'
import { fmtDateLong, fmtDuration, fmtTime, money } from '../../lib/dates'
import { useBooking } from '../../lib/bookingState'
import { Card } from '../../components/ui/Card'
import { useSummary } from './BookingSummary'

function Row({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="eyebrow">{title}</p>
        <div className="mt-1.5">{children}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${title.toLowerCase()}`}
        className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-rose-deep hover:bg-blush"
      >
        <Pencil size={15} /> Edit
      </button>
    </div>
  )
}

export function StepReview({ goTo }: { goTo: (step: number) => void }) {
  const { state } = useBooking()
  const s = useSummary(state)
  const i = state.info
  return (
    <div>
      <h2 className="text-4xl sm:text-5xl">Review &amp; confirm</h2>
      <p className="mt-2 text-muted">Everything look right? You can change any detail.</p>

      <Card tone="cream" className="mt-7 divide-y divide-line/70 px-5 sm:px-7">
        <Row title="Service" onEdit={() => goTo(0)}>
          <p className="font-semibold">
            {s.svc?.name} <span className="font-normal text-muted">· {money(s.svc?.price ?? 0)}</span>
          </p>
          {s.adds.map((a) => (
            <p key={a.id} className="text-sm text-muted">
              + {a.name} · {money(a.price)}
            </p>
          ))}
          <p className="mt-1 text-sm text-muted">Total time: {fmtDuration(s.duration)}</p>
        </Row>
        <Row title="Artist" onEdit={() => goTo(1)}>
          <p className="font-semibold">{s.tech?.name}</p>
          <p className="text-sm text-muted">{state.techId === 'any' ? 'Matched from “any available”' : s.tech?.title}</p>
        </Row>
        <Row title="Date & time" onEdit={() => goTo(2)}>
          <p className="font-semibold">
            {state.dateKey && fmtDateLong(state.dateKey)} at {state.time !== null && fmtTime(state.time)}
          </p>
          <p className="text-sm text-muted">
            {salon.address.street}, {salon.address.city}
          </p>
        </Row>
        <Row title="Your details" onEdit={() => goTo(4)}>
          <p className="font-semibold">
            {i.first} {i.last}
          </p>
          <p className="text-sm text-muted">
            {i.phone} · {i.email}
          </p>
          {i.notes && <p className="mt-1 text-sm italic text-muted">“{i.notes}”</p>}
          <p className="mt-1 text-sm text-muted">Text reminders: {i.sms ? 'on' : 'off'}</p>
        </Row>
      </Card>

      <div className="mt-6 space-y-2 rounded-2xl bg-blush p-5">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">{money(s.subtotal)}</span>
        </div>
        <div className="flex justify-between font-semibold text-rose-deep">
          <span>Deposit due next</span>
          <span>{money(s.deposit)}</span>
        </div>
        <div className="flex justify-between border-t border-rose/40 pt-2 text-muted">
          <span>Balance due at salon</span>
          <span>{money(s.balance)}</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">{salon.cancellationPolicy}</p>
    </div>
  )
}
