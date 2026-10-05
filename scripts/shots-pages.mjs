// Screenshots every page at 375 and 1280, and checks overflow / images / console.
// Usage: node scripts/shots-pages.mjs [baseUrl]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:5199'
const out = 'screenshots'
mkdirSync(out, { recursive: true })

const pages = [
  ['home', '/'],
  ['services', '/services'],
  ['gallery', '/gallery'],
  ['contact', '/contact'],
  ['admin', '/admin'],
]
const widths = [
  [375, 812],
  [390, 844],
  [768, 1024],
  [1280, 800],
]

const browser = await chromium.launch()
const problems = []

async function settle(page) {
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' })
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight
    for (let y = 0; y < h; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 90))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
}

for (const [w, h] of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800, deviceScaleFactor: 1 })
  for (const [name, path] of pages) {
    const page = await ctx.newPage()
    page.on('console', (m) => ['error', 'warning'].includes(m.type()) && problems.push(`[${w}] ${name} console.${m.type()}: ${m.text()}`))
    page.on('pageerror', (e) => problems.push(`[${w}] ${name} pageerror: ${e.message}`))
    page.on('requestfailed', (r) => problems.push(`[${w}] ${name} requestfailed: ${r.url()}`))
    await page.goto(base + path, { waitUntil: 'networkidle' })
    await settle(page)
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      small: [...document.querySelectorAll('a,button,input,select,textarea')]
        .filter((e) => {
          const r = e.getBoundingClientRect()
          const s = getComputedStyle(e)
          return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && (r.height < 43.5 || r.width < 43.5) && !e.closest('.sr-only') && !e.classList.contains('sr-only') && e.type !== 'checkbox'
        })
        .map((e) => `${e.tagName.toLowerCase()}:${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`),
    }))
    if (info.overflow > 0) problems.push(`[${w}] ${name}: horizontal overflow by ${info.overflow}px`)
    if (info.broken.length) problems.push(`[${w}] ${name}: broken images ${info.broken.join(', ')}`)
    if (info.small.length && w === 375) problems.push(`[${w}] ${name}: small tap targets -> ${info.small.join(' | ')}`)
    if (w === 375 || w === 1280) await page.screenshot({ path: `${out}/${name}-${w}.png`, fullPage: true })
    await page.close()
  }
  await ctx.close()
}
await browser.close()
console.log(problems.length ? problems.join('\n') : 'NO PROBLEMS')
