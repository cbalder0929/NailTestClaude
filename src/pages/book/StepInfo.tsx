import { useState } from 'react'
import { Check } from 'lucide-react'
import { formatPhone, isEmail, isPhone } from '../../lib/format'
import { useBooking } from '../../lib/bookingState'
import type { ClientInfo } from '../../lib/bookingState'
import { cn } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'

export type InfoErrors = Partial<Record<'first' | 'last' | 'phone' | 'email', string>>

export function infoErrors(i: ClientInfo): InfoErrors {
  const e: InfoErrors = {}
  if (!i.first.trim()) e.first = 'Please enter your first name.'
  if (!i.last.trim()) e.last = 'Please enter your last name.'
  if (!isPhone(i.phone)) e.phone = 'Enter a 10-digit mobile number.'
  if (!isEmail(i.email)) e.email = 'Enter a valid email, like name@example.com.'
  return e
}

export function StepInfo() {
  const { state, setInfo } = useBooking()
  const i = state.info
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const errors = infoErrors(i)
  const show = (k: keyof InfoErrors) => (touched[k] ? errors[k] : undefined)
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }))

  return (
    <div>
      <h2 className="text-4xl sm:text-5xl">Your details</h2>
      <p className="mt-2 text-muted">So we can confirm your appointment and reach you if anything changes.</p>

      <div className="mt-7 space-y-2">
        <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
          <Input label="First name" name="first" autoComplete="given-name" value={i.first} onChange={(e) => setInfo({ first: e.target.value })} onBlur={blur('first')} error={show('first')} />
          <Input label="Last name" name="last" autoComplete="family-name" value={i.last} onChange={(e) => setInfo({ last: e.target.value })} onBlur={blur('last')} error={show('last')} />
        </div>
        <Input label="Mobile phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(773) 555-0100" value={i.phone} onChange={(e) => setInfo({ phone: formatPhone(e.target.value) })} onBlur={blur('phone')} error={show('phone')} />
        <Input label="Email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={i.email} onChange={(e) => setInfo({ email: e.target.value })} onBlur={blur('email')} error={show('email')} />
        <Textarea label="Notes for your artist (optional)" name="notes" placeholder="Inspo photos, allergies, preferred length or shape…" value={i.notes} onChange={(e) => setInfo({ notes: e.target.value })} />

        <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl bg-blush p-4">
          <input type="checkbox" className="peer sr-only" checked={i.sms} onChange={(e) => setInfo({ sms: e.target.checked })} />
          <span
            aria-hidden
            className={cn(
              'mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-[1.5px] transition-colors peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose-deep',
              i.sms ? 'border-rose-deep bg-rose-deep text-white' : 'border-rose bg-white',
            )}
          >
            {i.sms && <Check size={16} strokeWidth={3} />}
          </span>
          <span className="text-[0.95rem]">
            <span className="font-semibold">Text me appointment reminders</span>
            <span className="block text-sm text-muted">One reminder the day before. Reply STOP anytime.</span>
          </span>
        </label>
      </div>
    </div>
  )
}
