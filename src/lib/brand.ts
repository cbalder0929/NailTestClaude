import { salon } from '../config/salon'

/** Push the colours from salon.ts into the Tailwind theme variables. */
export function applyBrand() {
  const s = document.documentElement.style
  const c = salon.colors
  s.setProperty('--color-rose', c.rose)
  s.setProperty('--color-rose-deep', c.roseDeep)
  s.setProperty('--color-blush', c.blush)
  s.setProperty('--color-cream', c.cream)
  s.setProperty('--color-gold', c.gold)
  s.setProperty('--color-ink', c.ink)
  document.title = `${salon.name} — ${salon.address.neighborhood}, ${salon.address.city}`
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.cream)
}
