import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { salon } from '../config/salon'
import type { ServiceCategory } from '../config/salon'
import { fmtDuration } from '../lib/dates'
import { PageHeader } from '../components/PageHeader'
import { ServiceCard } from '../components/ServiceCard'
import { Button, cn } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Reveal } from '../components/ui/Reveal'

const order: ServiceCategory[] = ['Manicures', 'Acrylic', 'Gel / Gel-X', 'Pedicures', 'Nail Art']
const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-')

export default function Services() {
  const sections = [...order.filter((c) => salon.services.some((s) => s.category === c)), 'Add-ons' as const]
  const [active, setActive] = useState<string>(sections[0])

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        let current = sections[0]
        for (const name of sections) {
          const el = document.getElementById(slug(name))
          if (el && el.getBoundingClientRect().top <= 190) current = name
        }
        setActive(current)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const go = (name: string) => {
    setActive(name)
    document.getElementById(slug(name))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <PageHeader
        eyebrow="The menu"
        title="Services & pricing"
        subtitle="Transparent prices, honest timings. Choose a treatment and we’ll find the right time and artist."
      />

      <div className="sticky top-[68px] z-30 border-b border-line/70 bg-cream/95 backdrop-blur lg:top-[76px]">
        <div className="mx-auto max-w-7xl">
          <div role="tablist" aria-label="Service categories" className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 md:justify-center lg:px-8">
            {sections.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={active === s}
                onClick={() => go(s)}
                className={cn(
                  'min-h-11 shrink-0 rounded-full border-[1.5px] px-5 text-sm font-semibold transition-colors',
                  active === s ? 'border-rose-deep bg-rose-deep text-white' : 'border-line bg-white text-ink hover:border-rose',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6 md:space-y-20 md:py-20 lg:px-8">
        {order.map((cat) => {
          const items = salon.services.filter((s) => s.category === cat)
          if (!items.length) return null
          return (
            <section key={cat} id={slug(cat)} data-name={cat} className="scroll-mt-40">
              <Reveal>
                <h2 className="text-4xl sm:text-5xl">{cat}</h2>
                <div className="gold-rule mt-4 w-20" aria-hidden />
              </Reveal>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s, i) => (
                  <Reveal key={s.id} delay={i * 70}>
                    <ServiceCard service={s} />
                  </Reveal>
                ))}
              </div>
            </section>
          )
        })}

        <section id={slug('Add-ons')} data-name="Add-ons" className="scroll-mt-40">
          <Reveal>
            <h2 className="text-4xl sm:text-5xl">Add-ons</h2>
            <div className="gold-rule mt-4 w-20" aria-hidden />
            <p className="mt-4 max-w-xl text-muted">Customize any service. Choose add-ons while booking and the time and total update instantly.</p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {salon.addOns.map((a, i) => (
              <Reveal key={a.id} delay={i * 60}>
                <Card className="flex h-full items-center justify-between gap-4 p-5">
                  <div>
                    <h3 className="text-2xl">{a.name}</h3>
                    <p className="mt-1 text-sm text-muted">{a.description}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                      <Clock size={15} className="text-gold" /> +{a.duration} min
                    </p>
                  </div>
                  <p className="shrink-0 text-right font-display text-3xl font-semibold text-rose-deep">
                    {a.from && <span className="block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted">from</span>}+${a.price}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal>
          <Card tone="blush" className="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h2 className="text-3xl sm:text-4xl">Not sure what to choose?</h2>
              <p className="mt-2 text-muted">Start a booking and add notes for your artist, or call us for a recommendation. Longest service on the menu: {fmtDuration(Math.max(...salon.services.map((s) => s.duration)))}.</p>
            </div>
            <Button to="/book" size="lg" className="shrink-0">
              Book Appointment
            </Button>
          </Card>
        </Reveal>
      </div>
    </>
  )
}
