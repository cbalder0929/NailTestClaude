import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { salon } from '../config/salon'
import type { GalleryCategory } from '../config/salon'
import { img } from '../lib/img'
import { PageHeader } from '../components/PageHeader'
import { ReviewCard } from '../components/ReviewCard'
import { Button, cn } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Reveal } from '../components/ui/Reveal'
import { SafeImage } from '../components/ui/SafeImage'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StarRating } from '../components/ui/StarRating'

const filters: ('All' | GalleryCategory)[] = ['All', 'Acrylic', 'Gel-X', 'French', 'Nail Art', 'Pedicure']

function Lightbox({ items, index, onClose, onIndex }: { items: typeof salon.gallery; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchX = useRef<number | null>(null)
  const [broken, setBroken] = useState(false)
  const n = items.length
  const go = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex])
  const item = items[index]

  useEffect(() => setBroken(false), [index])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [go, onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gallery viewer"
      className="fade-in fixed inset-0 z-[70] flex flex-col bg-ink/95"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
        touchX.current = null
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-cream">
        <p className="text-sm font-medium" aria-live="polite">
          {index + 1} / {n}
        </p>
        <button ref={closeRef} type="button" aria-label="Close viewer" onClick={onClose} className="grid size-11 place-items-center rounded-full hover:bg-white/10">
          <X size={26} />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className="absolute left-2 z-10 grid size-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 sm:left-5">
          <ChevronLeft size={26} />
        </button>
        {broken ? (
          <div className="grid aspect-[4/5] h-[60vh] max-w-full place-items-center rounded-3xl bg-blush text-rose-deep">Photo unavailable</div>
        ) : (
          <img
            key={item.id}
            src={img(item.src, 1400)}
            alt={item.alt}
            onError={() => setBroken(true)}
            className="fade-in max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            draggable={false}
          />
        )}
        <button type="button" aria-label="Next photo" onClick={() => go(1)} className="absolute right-2 z-10 grid size-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 sm:right-5">
          <ChevronRight size={26} />
        </button>
      </div>
      <p className="px-6 py-4 text-center text-sm text-cream/85">
        {item.alt} · <span className="text-gold">{item.category}</span>
      </p>
    </div>
  )
}

export default function GalleryReviews() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const [open, setOpen] = useState<number | null>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const { hash } = useLocation()
  const items = filter === 'All' ? salon.gallery : salon.gallery.filter((g) => g.category === filter)
  const { score, count, breakdown } = salon.rating

  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60)
  }, [hash])

  const close = useCallback(() => {
    setOpen(null)
    lastFocus.current?.focus()
  }, [])

  return (
    <>
      <PageHeader eyebrow="Our work" title="Gallery & reviews" subtitle="A look at what’s come off the table lately, and what our guests say about it." />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8" aria-label="Gallery">
        <div role="group" aria-label="Filter gallery" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                'min-h-11 shrink-0 rounded-full border-[1.5px] px-5 text-sm font-semibold transition-colors',
                filter === f ? 'border-rose-deep bg-rose-deep text-white' : 'border-line bg-white hover:border-rose',
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div key={filter} className="step-in mt-8 columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
          {items.map((g, i) => (
            <button
              key={g.id}
              type="button"
              onClick={(e) => {
                lastFocus.current = e.currentTarget
                setOpen(i)
              }}
              aria-label={`Open photo: ${g.alt}`}
              className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-[1.25rem] shadow-soft transition-shadow duration-300 hover:shadow-lift sm:mb-4 sm:rounded-3xl"
            >
              <SafeImage
                src={img(g.src, 600)}
                alt={g.alt}
                aspect={g.aspect}
                imgClassName="transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.05]"
              />
            </button>
          ))}
        </div>
        {items.length === 0 && <p className="py-16 text-center text-muted">No photos in this category yet.</p>}
      </section>

      <section id="reviews" className="scroll-mt-24 bg-cream-blush py-16 md:py-24" aria-label="Reviews">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader eyebrow="Reviews" title="What guests are saying" />
          </Reveal>

          <Reveal className="mt-12">
            <Card className="mx-auto grid max-w-3xl items-center gap-8 p-6 sm:p-9 md:grid-cols-[auto_1fr]">
              <div className="text-center">
                <p className="font-display text-7xl font-semibold leading-none text-rose-deep">{score}</p>
                <StarRating value={score} size={20} className="mt-3" />
                <p className="mt-2 text-sm text-muted">{count} reviews</p>
              </div>
              <ul className="space-y-2.5" aria-label="Rating breakdown">
                {breakdown.map((c, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-9 shrink-0 font-semibold">{5 - i} ★</span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-blush">
                      <span className="block h-full rounded-full bg-gold" style={{ width: `${(c / count) * 100}%` }} />
                    </span>
                    <span className="w-9 shrink-0 text-right text-muted">{c}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {salon.reviews.map((r, i) => (
              <Reveal key={r.id} delay={(i % 3) * 80}>
                <ReviewCard review={r} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center">
            <Button to="/book" size="lg">
              Book Appointment
            </Button>
          </Reveal>
        </div>
      </section>

      {open !== null && <Lightbox items={items} index={open} onClose={close} onIndex={setOpen} />}
    </>
  )
}
