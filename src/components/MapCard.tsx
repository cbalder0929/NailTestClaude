import { MapPin, Navigation } from 'lucide-react'
import { salon } from '../config/salon'
import { directionsUrl } from '../lib/ics'
import { Button } from './ui/Button'

/** Styled map placeholder — no third-party embed, so it never fails offline. */
export function MapCard({ className = '' }: { className?: string }) {
  const a = salon.address
  return (
    <div className={`relative overflow-hidden rounded-[1.25rem] bg-blush shadow-soft sm:rounded-3xl ${className}`}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <rect width="400" height="300" fill="#FBE4EA" />
        <g fill="#F6D2DC">
          <rect x="20" y="20" width="110" height="70" rx="10" />
          <rect x="150" y="20" width="90" height="70" rx="10" />
          <rect x="260" y="20" width="120" height="70" rx="10" />
          <rect x="20" y="115" width="110" height="60" rx="10" />
          <rect x="260" y="115" width="120" height="60" rx="10" />
          <rect x="20" y="200" width="110" height="80" rx="10" />
          <rect x="150" y="200" width="90" height="80" rx="10" />
          <rect x="260" y="200" width="120" height="80" rx="10" />
        </g>
        <rect x="150" y="115" width="90" height="60" rx="10" fill="#DDEBD9" />
        <g stroke="#FFFFFF" strokeLinecap="round">
          <line x1="0" y1="100" x2="400" y2="100" strokeWidth="14" />
          <line x1="0" y1="188" x2="400" y2="188" strokeWidth="10" />
          <line x1="140" y1="0" x2="140" y2="300" strokeWidth="18" />
          <line x1="250" y1="0" x2="250" y2="300" strokeWidth="9" />
          <line x1="140" y1="0" x2="140" y2="300" strokeWidth="2" stroke="#C9A96E" strokeDasharray="6 8" opacity="0.7" />
        </g>
        <text x="148" y="262" fontSize="10" fill="#6a5560" fontFamily="DM Sans, sans-serif" letterSpacing="1.5" transform="rotate(-90 148 262)">
          {a.street.replace(/^\d+\s*/, '').toUpperCase()}
        </text>
      </svg>
      <div className="relative flex min-h-[260px] flex-col justify-between p-5 sm:min-h-[300px] sm:p-6">
        <div className="mx-auto mt-6 grid size-14 place-items-center rounded-full bg-rose-deep text-white shadow-[0_14px_28px_-8px_rgb(194_24_91/0.6)] ring-8 ring-white/60">
          <MapPin size={26} />
        </div>
        <div className="rounded-2xl bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="font-display text-xl font-semibold">{salon.name}</p>
            <p className="text-sm text-muted">
              {a.street}, {a.city}, {a.state} {a.zip}
            </p>
            <p className="mt-0.5 text-xs text-muted">{a.note}</p>
          </div>
          <Button href={directionsUrl()} target="_blank" rel="noopener noreferrer" size="md" className="mt-3 w-full sm:mt-0 sm:w-auto">
            <Navigation size={17} /> Directions
          </Button>
        </div>
      </div>
    </div>
  )
}
