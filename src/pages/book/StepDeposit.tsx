import { FlaskConical, Lock } from 'lucide-react'
import { cardBrand, formatCard, formatExpiry, validExpiry } from '../../lib/format'
import type { CardBrand } from '../../lib/format'
import { money } from '../../lib/dates'
import { useBooking } from '../../lib/bookingState'
import { totals } from '../../lib/pricing'
import { Button, cn } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useState } from 'react'

export interface PayForm {
  name: string
  number: string
  expiry: string
  cvv: string
  zip: string
}
export const emptyPay: PayForm = { name: '', number: '', expiry: '', cvv: '', zip: '' }
export type PayErrors = Partial<Record<keyof PayForm, string>>

export function payErrors(p: PayForm): PayErrors {
  const e: PayErrors = {}
  const digits = p.number.replace(/\D/g, '')
  const brand = cardBrand(digits)
  if (p.name.trim().length < 2) e.name = 'Enter the name on the card.'
  if (digits.length < (brand === 'amex' ? 15 : 16)) e.number = 'Enter the full card number.'
  if (!validExpiry(p.expiry)) e.expiry = 'Use a future date, MM/YY.'
  if (p.cvv.length < (brand === 'amex' ? 4 : 3)) e.cvv = brand === 'amex' ? '4 digits.' : '3 digits.'
  if (p.zip.length !== 5) e.zip = '5-digit ZIP.'
  return e
}

const brandStyle: Record<Exclude<CardBrand, 'unknown'>, { label: string; cls: string }> = {
  visa: { label: 'VISA', cls: 'bg-[#1A1F71] text-white italic tracking-wider' },
  mastercard: { label: 'MC', cls: 'bg-[#EB001B] text-white' },
  amex: { label: 'AMEX', cls: 'bg-[#2E77BC] text-white' },
  discover: { label: 'DISC', cls: 'bg-[#F76F20] text-white' },
}

export function StepDeposit({ pay, setPay, disabled }: { pay: PayForm; setPay: (p: PayForm) => void; disabled: boolean }) {
  const { state } = useBooking()
  const { subtotal, deposit, balance } = totals(state.serviceId, state.addOnIds)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const errors = payErrors(pay)
  const show = (k: keyof PayForm) => (touched[k] ? errors[k] : undefined)
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }))
  const brand = cardBrand(pay.number)

  return (
    <div>
      <div className="mb-6 flex items-start gap-3 rounded-2xl border-[1.5px] border-dashed border-gold bg-[#FFF6E4] p-4" role="note">
        <FlaskConical size={20} className="mt-0.5 shrink-0 text-[#6B5320]" />
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6B5320]">Demo mode — no real charge</p>
          <p className="mt-0.5 text-sm text-[#6B5320]">
            Nothing is billed or stored. Try <span className="font-semibold">4242 4242 4242 4242</span> with any future date.
          </p>
        </div>
      </div>

      <h2 className="text-4xl sm:text-5xl">Secure your spot</h2>
      <p className="mt-2 text-muted">A small deposit holds your time. The rest is paid at the salon.</p>

      <div className="mt-6 space-y-2 rounded-2xl bg-blush p-5">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">{money(subtotal)}</span>
        </div>
        <div className="flex items-baseline justify-between text-rose-deep">
          <span className="font-semibold">Deposit today</span>
          <span className="font-display text-3xl font-semibold">{money(deposit)}</span>
        </div>
        <div className="flex justify-between border-t border-rose/40 pt-2 text-muted">
          <span>Remaining balance due at salon</span>
          <span>{money(balance)}</span>
        </div>
      </div>

      <fieldset disabled={disabled} className="mt-7 space-y-2">
        <legend className="sr-only">Payment details</legend>
        <Input label="Cardholder name" name="cc-name" autoComplete="cc-name" value={pay.name} onChange={(e) => setPay({ ...pay, name: e.target.value })} onBlur={blur('name')} error={show('name')} />
        <Input
          label="Card number"
          name="cc-number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={pay.number}
          onChange={(e) => setPay({ ...pay, number: formatCard(e.target.value) })}
          onBlur={blur('number')}
          error={show('number')}
          trailing={
            brand !== 'unknown' ? (
              <span className={cn('rounded-md px-2 py-1 text-[0.68rem] font-bold', brandStyle[brand].cls)} aria-label={`${brand} card detected`}>
                {brandStyle[brand].label}
              </span>
            ) : (
              <Lock size={16} className="text-muted/60" aria-hidden />
            )
          }
        />
        <div className="grid grid-cols-3 gap-x-3 gap-y-2 sm:gap-x-4">
          <Input label="Expiry" name="cc-exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={pay.expiry} onChange={(e) => setPay({ ...pay, expiry: formatExpiry(e.target.value) })} onBlur={blur('expiry')} error={show('expiry')} />
          <Input label="CVV" name="cc-csc" inputMode="numeric" autoComplete="cc-csc" placeholder={brand === 'amex' ? '1234' : '123'} value={pay.cvv} onChange={(e) => setPay({ ...pay, cvv: e.target.value.replace(/\D/g, '').slice(0, brand === 'amex' ? 4 : 3) })} onBlur={blur('cvv')} error={show('cvv')} />
          <Input label="Billing ZIP" name="postal" inputMode="numeric" autoComplete="postal-code" placeholder="60647" value={pay.zip} onChange={(e) => setPay({ ...pay, zip: e.target.value.replace(/\D/g, '').slice(0, 5) })} onBlur={blur('zip')} error={show('zip')} />
        </div>
        <Button variant="ghost" className="min-h-11 !px-3 text-sm text-rose-deep" onClick={() => setPay({ name: `${state.info.first} ${state.info.last}`.trim(), number: '4242 4242 4242 4242', expiry: '12/30', cvv: '123', zip: '60647' })}>
          Fill demo card
        </Button>
      </fieldset>
    </div>
  )
}
