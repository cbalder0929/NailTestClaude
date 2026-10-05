import { useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'
import { salon } from '../config/salon'
import { formatPhone, isEmail, isPhone } from '../lib/format'
import { mapsUrl } from '../lib/ics'
import { HoursTable } from '../components/HoursTable'
import { MapCard } from '../components/MapCard'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FacebookIcon, InstagramIcon, TikTokIcon } from '../components/ui/BrandIcons'
import { Input, Textarea } from '../components/ui/Input'
import { Reveal } from '../components/ui/Reveal'

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'message', string>>

function validate(v: { name: string; email: string; phone: string; message: string }): Errors {
  const e: Errors = {}
  if (v.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!isEmail(v.email)) e.email = 'Enter a valid email, like name@example.com.'
  if (v.phone && !isPhone(v.phone)) e.phone = 'Enter a 10-digit phone number.'
  if (v.message.trim().length < 10) e.message = 'Tell us a little more (at least 10 characters).'
  return e
}

export default function Contact() {
  const [v, setV] = useState({ name: '', email: '', phone: '', topic: salon.contactFormTopics[0], message: '' })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [sent, setSent] = useState(false)
  const errors = validate(v)
  const show = (k: keyof Errors) => (touched[k] ? errors[k] : undefined)
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, phone: true, message: true })
    if (Object.keys(errors).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    setSent(true)
  }

  const a = salon.address
  const tel = `tel:${salon.phone.replace(/\D/g, '')}`
  const social = [
    { href: salon.social.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: salon.social.tiktok, label: 'TikTok', Icon: TikTokIcon },
    { href: salon.social.facebook, label: 'Facebook', Icon: FacebookIcon },
  ]

  return (
    <>
      <PageHeader eyebrow="Get in touch" title="Visit or say hello" subtitle="Questions, group bookings, or a special occasion? We’d love to hear from you." />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-8 lg:px-8">
        <div className="space-y-6">
          <Reveal>
            <Card className="divide-y divide-line/70 p-2 sm:p-3">
              <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-blush">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush text-gold"><MapPin size={20} /></span>
                <span>
                  <span className="eyebrow block">Address</span>
                  <span className="mt-1 block font-medium">{a.street}, {a.city}, {a.state} {a.zip}</span>
                  <span className="block text-sm text-muted">{a.note}</span>
                </span>
              </a>
              <a href={tel} className="flex min-h-14 items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-blush">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush text-gold"><Phone size={20} /></span>
                <span>
                  <span className="eyebrow block">Call or text</span>
                  <span className="mt-1 block font-medium">{salon.phone}</span>
                </span>
              </a>
              <a href={`mailto:${salon.email}`} className="flex min-h-14 items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-blush">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush text-gold"><Mail size={20} /></span>
                <span className="min-w-0">
                  <span className="eyebrow block">Email</span>
                  <span className="mt-1 block break-all font-medium">{salon.email}</span>
                </span>
              </a>
            </Card>
          </Reveal>

          <Reveal>
            <Card className="p-5 sm:p-7">
              <h2 className="mb-3 text-3xl">Hours</h2>
              <HoursTable />
            </Card>
          </Reveal>

          <Reveal>
            <Card tone="blush" className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
              <div>
                <p className="font-display text-2xl font-semibold">Follow along</p>
                <p className="text-sm text-muted">New sets posted weekly.</p>
              </div>
              <div className="flex gap-2">
                {social.map(({ href, label, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-12 place-items-center rounded-full bg-white text-rose-deep shadow-soft transition-transform hover:-translate-y-0.5">
                    <Icon />
                  </a>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>

        <div className="space-y-6">
          <Reveal>
            <Card className="p-5 sm:p-8">
              {sent ? (
                <div className="step-in py-8 text-center" role="status">
                  <CheckCircle2 size={56} className="mx-auto text-rose-deep" strokeWidth={1.4} />
                  <h2 className="mt-4 text-4xl">Thank you, {v.name.trim().split(' ')[0]}.</h2>
                  <p className="mx-auto mt-3 max-w-sm text-muted">
                    Your message is on its way to the team. {salon.replyTime} For anything urgent, call {salon.phone}.
                  </p>
                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button to="/book">Book Appointment</Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSent(false)
                        setTouched({})
                        setV({ ...v, message: '' })
                      }}
                    >
                      Send another
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="space-y-2">
                  <div>
                    <h2 className="text-4xl">Send a message</h2>
                    <p className="mt-2 text-muted">{salon.replyTime}</p>
                  </div>
                  <Input label="Full name" name="name" autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} onBlur={blur('name')} error={show('name')} />
                  <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
                    <Input label="Email" name="email" type="email" inputMode="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} onBlur={blur('email')} error={show('email')} />
                    <Input label="Phone (optional)" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(773) 555-0100" value={v.phone} onChange={(e) => setV({ ...v, phone: formatPhone(e.target.value) })} onBlur={blur('phone')} error={show('phone')} />
                  </div>
                  <div>
                    <label htmlFor="topic" className="mb-1.5 block text-sm font-semibold">Topic</label>
                    <select id="topic" value={v.topic} onChange={(e) => setV({ ...v, topic: e.target.value })} className="min-h-12 w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-base outline-none focus:border-rose-deep focus:shadow-[0_0_0_4px_rgb(232_160_180/0.35)]">
                      {salon.contactFormTopics.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <Textarea label="Message" name="message" value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} onBlur={blur('message')} error={show('message')} />
                  <Button type="submit" size="lg" full>
                    Send message
                  </Button>
                </form>
              )}
            </Card>
          </Reveal>
          <Reveal>
            <MapCard />
          </Reveal>
        </div>
      </div>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <Card tone="blush" className="mx-auto flex max-w-7xl flex-col items-center gap-5 p-9 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h2 className="text-4xl">Skip the back-and-forth.</h2>
              <p className="mt-2 text-muted">See real openings and book in under a minute.</p>
            </div>
            <Button to="/book" size="lg" className="shrink-0">
              Book Appointment
            </Button>
          </Card>
        </Reveal>
      </section>
    </>
  )
}
