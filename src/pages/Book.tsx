import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, Loader2, X } from 'lucide-react'
import { salon } from '../config/salon'
import { computeSlots, dayStatus } from '../lib/availability'
import { saveBooking } from '../lib/bookingsStore'
import { useBooking } from '../lib/bookingState'
import { money } from '../lib/dates'
import { isEmail, isPhone } from '../lib/format'
import { getService, totals } from '../lib/pricing'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StepIndicator } from '../components/ui/StepIndicator'
import { BookingSummary } from './book/BookingSummary'
import { Confirmation } from './book/Confirmation'
import { StepDate } from './book/StepDate'
import { StepDeposit, emptyPay, payErrors } from './book/StepDeposit'
import type { PayForm } from './book/StepDeposit'
import { StepInfo } from './book/StepInfo'
import { StepReview } from './book/StepReview'
import { StepService } from './book/StepService'
import { StepTech } from './book/StepTech'
import { StepTime } from './book/StepTime'

const STEPS = ['Service', 'Artist', 'Date', 'Time', 'Details', 'Review', 'Deposit']
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const makeCode = () => `${salon.bookingPrefix}-${Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')}`

/** A confirmed booking survives a refresh, but a fresh visit via the nav starts clean. */
let firstMountInPageLife = true

function SummarySheet({ onClose }: { onClose: () => void }) {
  const { state } = useBooking()
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Appointment summary">
      <div className="fade-in absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="sheet-up absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-[1.75rem] bg-cream px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-lift">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-line" aria-hidden />
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close summary" className="absolute right-3 top-3 grid size-11 place-items-center rounded-full hover:bg-blush">
          <X size={22} />
        </button>
        <BookingSummary state={state} />
        <Button full className="mt-5" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}

export default function Book() {
  const { state, update, reset } = useBooking()
  const [params, setParams] = useSearchParams()
  const [pay, setPay] = useState<PayForm>(emptyPay)
  const [processing, setProcessing] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [payError, setPayError] = useState('')
  const stepRef = useRef<HTMLDivElement>(null)
  const { step } = state
  const t = totals(state.serviceId, state.addOnIds)

  // entering the page: apply ?service=, or start fresh if arriving via navigation after a completed booking
  useEffect(() => {
    const wasFirst = firstMountInPageLife
    firstMountInPageLife = false
    const svc = params.get('service')
    const valid = svc && getService(svc) ? svc : null
    const done = !!state.confirmation
    if (valid) {
      if (done) reset({ serviceId: valid })
      else if (state.serviceId !== valid) update({ serviceId: valid, step: Math.min(step, 0) })
      setParams({}, { replace: true })
    } else if (done && !wasFirst) {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // never sit on a later step without a service (e.g. stale storage)
  useEffect(() => {
    if (!state.serviceId && step > 0 && !state.confirmation) update({ step: 0 })
  }, [state.serviceId, step, state.confirmation, update])

  const goTo = (n: number) => {
    update({ step: n })
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    setTimeout(() => stepRef.current?.focus({ preventScroll: true }), 0)
  }

  const dateOk = useMemo(
    () => !!state.dateKey && dayStatus(state.dateKey, state.techId, t.duration).state === 'open',
    [state.dateKey, state.techId, t.duration],
  )
  const timeOk = useMemo(
    () => dateOk && state.time !== null && computeSlots(state.dateKey as string, state.techId, t.duration).some((s) => s.time === state.time),
    [dateOk, state.dateKey, state.time, state.techId, t.duration],
  )
  const i = state.info
  const infoOk = !!i.first.trim() && !!i.last.trim() && isPhone(i.phone) && isEmail(i.email)
  const payOk = Object.keys(payErrors(pay)).length === 0

  const canContinue = [!!state.serviceId, true, dateOk, timeOk, infoOk, true, payOk && !processing][step] ?? false
  const isLast = step === STEPS.length - 1

  const finish = () => {
    setPayError('')
    setProcessing(true)
    window.setTimeout(() => {
      const slot = computeSlots(state.dateKey as string, state.techId, t.duration).find((s) => s.time === state.time)
      if (!slot) {
        setProcessing(false)
        setPayError('Sorry, that time was just taken. Please choose another.')
        goTo(3)
        return
      }
      const techId = state.techId === 'any' ? (slot.techIds.includes(state.assignedTechId ?? '') ? (state.assignedTechId as string) : slot.assigned) : state.techId
      const code = makeCode()
      saveBooking({
        confirmation: code,
        serviceId: state.serviceId as string,
        addOnIds: state.addOnIds,
        techId,
        dateKey: state.dateKey as string,
        start: state.time as number,
        end: (state.time as number) + t.duration,
        client: `${i.first.trim()} ${i.last.trim()}`,
        phone: i.phone,
        total: t.subtotal,
        deposit: t.deposit,
        createdAt: Date.now(),
      })
      setProcessing(false)
      setPay(emptyPay)
      update({ assignedTechId: techId, confirmation: code, step: STEPS.length })
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, 1500)
  }

  const onContinue = () => {
    if (!canContinue) return
    if (isLast) finish()
    else goTo(step + 1)
  }
  const label = isLast ? (processing ? 'Processing…' : `Pay ${money(t.deposit)} deposit`) : step === 5 ? 'Continue to deposit' : 'Continue'

  /* ── confirmed ─────────────────────────────────────────────────────── */
  if (state.confirmation) {
    return (
      <div className="bg-blush-fade min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:pt-36">
        <Confirmation />
      </div>
    )
  }

  const stepView = [
    <StepService key="s" />,
    <StepTech key="t" />,
    <StepDate key="d" />,
    <StepTime key="ti" />,
    <StepInfo key="i" />,
    <StepReview key="r" goTo={goTo} />,
    <StepDeposit key="p" pay={pay} setPay={setPay} disabled={processing} />,
  ][step]

  const continueBtn = (className?: string) => (
    <Button size="lg" disabled={!canContinue} onClick={onContinue} className={className} aria-busy={processing}>
      {processing && <Loader2 size={20} className="animate-spin" aria-hidden />}
      {label}
    </Button>
  )

  return (
    <div className="bg-blush-fade min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pb-32 pt-24 sm:px-6 lg:px-8 lg:pb-20 lg:pt-32">
        <div className="mb-6 lg:mb-8">
          <StepIndicator steps={STEPS} current={step} onStepClick={(n) => !processing && goTo(n)} />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
          <Card className="p-5 sm:p-8 lg:p-10">
            <div ref={stepRef} tabIndex={-1} className="outline-none">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  disabled={processing}
                  className="-ml-3 mb-3 flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted hover:bg-blush hover:text-rose-deep disabled:opacity-50"
                >
                  <ArrowLeft size={17} /> Back
                </button>
              )}
              {payError && (
                <p role="alert" className="mb-4 rounded-2xl bg-[#FDECEA] p-4 text-sm font-semibold text-[#8C1D18]">
                  {payError}
                </p>
              )}
              <div key={step} className="step-in">
                {stepView}
              </div>
            </div>

            <div className="mt-10 hidden items-center justify-between border-t border-line/70 pt-6 lg:flex">
              <span className="text-sm text-muted">
                Step {step + 1} of {STEPS.length}
              </span>
              {continueBtn()}
            </div>
          </Card>

          <aside className="sticky top-28 hidden lg:block" aria-label="Appointment summary">
            <Card className="p-7">
              <BookingSummary state={state} />
            </Card>
          </aside>
        </div>
      </div>

      {/* mobile: sticky summary + continue bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-18px_rgb(194_24_91/0.35)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button
            type="button"
            onClick={() => setSheet(true)}
            className="min-h-12 shrink-0 rounded-2xl pr-2 text-left"
            aria-label={`View summary. Total ${money(t.subtotal)}`}
          >
            <span className="block font-display text-[1.7rem] font-semibold leading-none text-ink">{t.subtotal ? money(t.subtotal) : '—'}</span>
            <span className="mt-1 block text-xs font-semibold text-rose-deep underline underline-offset-2">View summary</span>
          </button>
          {continueBtn("min-w-0 flex-1 !px-4")}
        </div>
      </div>
      {sheet && <SummarySheet onClose={() => setSheet(false)} />}
    </div>
  )
}
