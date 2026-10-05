import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, Gem, HandHeart, ShieldCheck } from 'lucide-react'
import { salon } from '../config/salon'
import { img } from '../lib/img'
import { HoursTable } from '../components/HoursTable'
import { MapCard } from '../components/MapCard'
import { ReviewCard } from '../components/ReviewCard'
import { ServiceCard } from '../components/ServiceCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Reveal } from '../components/ui/Reveal'
import { SafeImage } from '../components/ui/SafeImage'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StarRating } from '../components/ui/StarRating'

const whyIcons = { shield: ShieldCheck, hand: HandHeart, gem: Gem, calendar: CalendarCheck }

export default function Home() {
  const featured = salon.featuredServiceIds
    .map((id) => salon.services.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s)

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden lg:items-center">
        <SafeImage
          src={img(salon.images.hero, 1400)}
          alt=""
          eager
          className="absolute inset-0 -z-20"
          imgClassName="object-[60%_40%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-cream via-cream/75 to-blush/10 lg:bg-gradient-to-r lg:from-cream lg:via-cream/70 lg:to-transparent"
        />
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pb-0 lg:pt-24">
          <div className="max-w-2xl">
            <p className="eyebrow mb-5">
              {salon.address.neighborhood} · {salon.address.city}
            </p>
            <h1 className="text-[3.5rem] leading-[0.95] sm:text-7xl lg:text-[6.25rem]">{salon.name}</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/80 sm:text-xl">{salon.valueProp}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/book" size="lg">
                Book Appointment
              </Button>
              <Button to="/services" size="lg" variant="secondary">
                View Services
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm">
              <StarRating value={salon.rating.score} size={18} />
              <p className="text-ink/80">
                <span className="font-semibold">{salon.rating.score}</span> from {salon.rating.count} reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured services ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <Reveal>
          <SectionHeader
            eyebrow="Signature services"
            title="Our most-loved treatments"
            subtitle="From a quick gel refresh to a full spa pedicure, every service is unhurried and finished by hand."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((s, i) => (
            <Reveal key={s.id} delay={i * 80}>
              <ServiceCard service={s} showCategory />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link to="/services" className="inline-flex min-h-11 items-center gap-2 font-semibold text-rose-deep hover:underline">
            See the full menu <ArrowRight size={18} />
          </Link>
        </Reveal>
      </section>

      {/* ── Why choose us ───────────────────────────────────────────── */}
      <section className="bg-blush-fade py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader eyebrow="The atelier difference" title={`Why choose ${salon.shortName}`} />
          </Reveal>
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {salon.why.map((w, i) => {
              const Icon = whyIcons[w.icon]
              return (
                <Reveal key={w.title} delay={i * 80} className="text-center">
                  <span className="mx-auto grid size-16 place-items-center rounded-full bg-white text-gold shadow-soft ring-1 ring-gold/30">
                    <Icon size={28} strokeWidth={1.4} />
                  </span>
                  <h3 className="mt-5 text-[1.65rem]">{w.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-[0.95rem] leading-relaxed text-muted">{w.text}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Gallery teaser ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <Reveal>
          <SectionHeader eyebrow="Recent work" title="Fresh off the table" />
        </Reveal>
        <Reveal className="mt-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {salon.gallery.slice(0, 6).map((g, i) => (
              <Link
                key={g.id}
                to="/gallery"
                aria-label={`${g.alt} — view gallery`}
                className={`group block overflow-hidden rounded-[1.25rem] shadow-soft ${i > 3 ? 'hidden sm:block' : ''}`}
              >
                <SafeImage
                  src={img(g.src, 500, 625)}
                  alt={g.alt}
                  aspect="4/5"
                  imgClassName="transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.05]"
                />
              </Link>
            ))}
          </div>
        </Reveal>
        <Reveal className="mt-10 text-center">
          <Button to="/gallery" variant="secondary">
            View full gallery
          </Button>
        </Reveal>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────── */}
      <section className="bg-cream-blush py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Kind words"
              title="Loved in Bucktown"
              subtitle={`${salon.rating.score} average across ${salon.rating.count} verified reviews.`}
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {salon.reviews.slice(0, 3).map((r, i) => (
              <Reveal key={r.id} delay={i * 90}>
                <ReviewCard review={r} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Link to="/gallery#reviews" className="inline-flex min-h-11 items-center gap-2 font-semibold text-rose-deep hover:underline">
              Read all reviews <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Hours + location ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <Reveal>
          <SectionHeader eyebrow="Visit us" title="Hours & location" />
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <Card className="h-full p-5 sm:p-8">
              <HoursTable compact />
            </Card>
          </Reveal>
          <Reveal delay={90}>
            <MapCard className="h-full" />
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="px-4 pb-20 sm:px-6 md:pb-28 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-rose-deep px-6 py-16 text-center text-white shadow-lift sm:rounded-[2.25rem] sm:py-20">
            <div aria-hidden className="absolute -left-20 -top-20 size-72 rounded-full bg-rose/30 blur-3xl" />
            <div aria-hidden className="absolute -bottom-24 -right-16 size-80 rounded-full bg-gold/25 blur-3xl" />
            <div className="relative">
              <p className="eyebrow !text-blush">Your chair is waiting</p>
              <h2 className="mt-3 text-[2.5rem] !text-white sm:text-6xl">Ready for a little glow?</h2>
              <p className="mx-auto mt-4 max-w-md text-lg text-white/90">
                Pick your service and artist, choose a time that actually works, and you’re booked.
              </p>
              <Button to="/book" size="lg" variant="light" className="mt-8">
                Book Appointment
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
