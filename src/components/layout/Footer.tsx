import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { salon } from '../../config/salon'
import { DAY_SHORT, fmtHM } from '../../lib/dates'
import { mapsUrl } from '../../lib/ics'
import { FacebookIcon, InstagramIcon, TikTokIcon } from '../ui/BrandIcons'

const social = [
  { href: salon.social.instagram, label: 'Instagram', Icon: InstagramIcon },
  { href: salon.social.tiktok, label: 'TikTok', Icon: TikTokIcon },
  { href: salon.social.facebook, label: 'Facebook', Icon: FacebookIcon },
]
const order = [2, 3, 4, 5, 6, 0, 1]

export function Footer() {
  const a = salon.address
  return (
    <footer className="bg-ink text-cream/85">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-3xl font-semibold text-cream">{salon.name}</p>
          <p className="mt-2 text-sm text-cream/70">{salon.tagline}</p>
          <div className="mt-5 flex gap-2">
            {social.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-11 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:border-gold hover:text-gold"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="eyebrow !text-gold">Visit</h3>
          <ul className="mt-4 space-y-3 text-[0.95rem]">
            <li>
              <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-start gap-3 hover:text-white">
                <MapPin size={18} className="mt-0.5 shrink-0 text-gold" />
                <span>
                  {a.street}
                  <br />
                  {a.city}, {a.state} {a.zip}
                </span>
              </a>
            </li>
            <li>
              <a href={`tel:${salon.phone.replace(/\D/g, '')}`} className="flex min-h-11 items-center gap-3 hover:text-white">
                <Phone size={18} className="shrink-0 text-gold" /> {salon.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${salon.email}`} className="flex min-h-11 items-center gap-3 break-all hover:text-white">
                <Mail size={18} className="shrink-0 text-gold" /> {salon.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow !text-gold">Hours</h3>
          <ul className="mt-4 space-y-1.5 text-[0.95rem]">
            {order.map((d) => {
              const h = salon.hours[d]
              return (
                <li key={d} className="flex justify-between gap-4">
                  <span>{DAY_SHORT[d]}</span>
                  <span className="text-cream/70">{h ? `${fmtHM(h.open)} – ${fmtHM(h.close)}` : 'Closed'}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow !text-gold">Explore</h3>
          <ul className="mt-4 text-[0.95rem]">
            {[
              ['/', 'Home'],
              ['/services', 'Services'],
              ['/gallery', 'Gallery & Reviews'],
              ['/contact', 'Contact'],
              ['/book', 'Book an appointment'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="flex min-h-11 items-center hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-cream/60 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {salon.name}. {a.neighborhood}, {a.city}.
        </p>
      </div>
    </footer>
  )
}
