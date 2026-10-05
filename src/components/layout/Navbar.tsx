import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Phone, X } from 'lucide-react'
import { salon } from '../../config/salon'
import { Button, cn } from '../ui/Button'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery & Reviews' },
  { to: '/contact', label: 'Contact' },
]

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" aria-label={`${salon.name} — home`} className={cn('group flex min-h-11 items-center gap-2.5', className)}>
      <span className="grid size-9 place-items-center rounded-full bg-rose-deep text-white shadow-[0_6px_14px_-6px_rgb(194_24_91/0.7)]">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
          <path d="M12 2.5c3.6 4.6 5.6 7.6 5.6 11a5.6 5.6 0 0 1-11.2 0c0-3.4 2-6.4 5.6-11z" />
        </svg>
      </span>
      <span className="font-display text-[1.45rem] font-semibold leading-none tracking-tight text-ink">{salon.name}</span>
    </Link>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const burger = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        burger.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    firstLink.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300',
          scrolled ? 'bg-cream shadow-nav' : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[76px] lg:px-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    'relative flex min-h-11 items-center rounded-full px-4 text-[0.95rem] font-medium transition-colors',
                    isActive ? 'text-rose-deep' : 'text-ink hover:text-rose-deep',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-x-4 bottom-1.5 h-px bg-gold transition-transform duration-300',
                        isActive ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
            <Button to="/book" className="ml-3 min-h-12 px-7">
              Book Now
            </Button>
          </nav>
          <div className="flex items-center gap-1 lg:hidden">
            <Button to="/book" size="md" className="min-h-11 px-5 text-sm">
              Book Now
            </Button>
            <button
              ref={burger}
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
              className="grid size-11 place-items-center rounded-full text-ink hover:bg-blush"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fade-in fixed inset-0 z-[60] flex flex-col bg-cream lg:hidden"
        >
          <div className="flex h-[68px] items-center justify-between px-4 sm:px-6">
            <Logo />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => {
                setOpen(false)
                burger.current?.focus()
              }}
              className="grid size-11 place-items-center rounded-full text-ink hover:bg-blush"
            >
              <X size={26} />
            </button>
          </div>
          <div className="gold-rule mx-6" aria-hidden />
          <nav aria-label="Mobile" className="menu-in flex flex-1 flex-col justify-center gap-1 px-6">
            {links.map((l, i) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                ref={i === 0 ? firstLink : undefined}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 items-center border-b border-line/70 font-display text-[2.1rem] font-semibold',
                    isActive ? 'text-rose-deep' : 'text-ink',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="space-y-3 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
            <Button to="/book" size="lg" full onClick={() => setOpen(false)}>
              Book Now
            </Button>
            <Button href={`tel:${salon.phone.replace(/\D/g, '')}`} variant="secondary" full>
              <Phone size={18} /> {salon.phone}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
