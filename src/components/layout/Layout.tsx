import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { salon } from '../../config/salon'
import { Button } from '../ui/Button'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])
  return null
}

export function StickyBookBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_30px_-18px_rgb(194_24_91/0.35)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <a
          href={`tel:${salon.phone.replace(/\D/g, '')}`}
          aria-label={`Call ${salon.phone}`}
          className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-rose-deep/70 text-rose-deep"
        >
          <Phone size={20} />
        </a>
        <Button to="/book" size="md" full>
          Book Appointment
        </Button>
      </div>
    </div>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  const inBooking = pathname.startsWith('/book')
  return (
    <>
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-rose-deep focus:px-5 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      {!inBooking && <Footer />}
      {!inBooking && <div className="h-[76px] lg:hidden" aria-hidden />}
      {!inBooking && <StickyBookBar />}
    </>
  )
}
