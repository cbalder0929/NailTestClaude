// Mobile menu, lightbox, contact form, sticky bar and link audit. Usage: node scripts/ui-checks.mjs [baseUrl]
import { chromium } from 'playwright'
const base = process.argv[2] ?? 'http://localhost:5199'
const problems = []
const ok = (c, m) => { if (!c) problems.push(m); console.log((c ? '  ok   ' : '  FAIL ') + m) }
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
p.on('console', (m) => ['error', 'warning'].includes(m.type()) && problems.push('console: ' + m.text()))
p.on('pageerror', (e) => problems.push('pageerror: ' + e.message))

await p.goto(base + '/', { waitUntil: 'networkidle' })
ok(await p.getByRole('link', { name: 'Book Appointment' }).last().isVisible(), 'sticky Book bar visible on mobile Home')
await p.getByRole('button', { name: 'Open menu' }).click()
ok(await p.getByRole('dialog', { name: 'Menu' }).isVisible(), 'hamburger opens full-screen menu')
await p.keyboard.press('Escape')
ok(!(await p.getByRole('dialog', { name: 'Menu' }).isVisible().catch(() => false)), 'Escape closes menu')
await p.getByRole('button', { name: 'Open menu' }).click()
await p.getByRole('dialog').getByRole('link', { name: 'Services' }).click()
await p.waitForURL('**/services')
ok(!(await p.getByRole('dialog', { name: 'Menu' }).isVisible().catch(() => false)), 'menu closes on link tap')

await p.goto(base + '/book', { waitUntil: 'networkidle' })
ok((await p.getByRole('link', { name: 'Book Appointment' }).count()) === 0, 'no sticky Book bar inside booking flow')

await p.goto(base + '/gallery', { waitUntil: 'networkidle' })
await p.getByRole('button', { name: 'French', exact: true }).click()
const n = await p.locator('button[aria-label^="Open photo"]').count()
ok(n === 4, `filter French shows 4 photos (${n})`)
await p.locator('button[aria-label^="Open photo"]').first().click()
const dlg = p.getByRole('dialog', { name: 'Gallery viewer' })
ok(await dlg.isVisible(), 'lightbox opens')
await p.keyboard.press('ArrowRight')
ok((await dlg.innerText()).includes('2 / 4'), 'arrow key advances')
const box = await dlg.boundingBox()
await p.touchscreen.tap(box.x + 5, box.y + 5).catch(() => {})
await p.keyboard.press('Escape')
ok(!(await dlg.isVisible().catch(() => false)), 'Escape closes lightbox')

await p.goto(base + '/contact', { waitUntil: 'networkidle' })
await p.getByRole('button', { name: 'Send message' }).click()
ok(await p.getByText('Please enter your name.').isVisible(), 'contact form validation')
await p.getByLabel('Full name').fill('Ana Test')
await p.getByLabel('Email', { exact: true }).fill('ana@example.com')
await p.getByLabel('Message').fill('Hello, do you take group bookings?')
await p.getByRole('button', { name: 'Send message' }).click()
ok(await p.getByText(/Thank you, Ana/).isVisible(), 'contact form success state')

// link audit across all pages
const pages = ['/', '/services', '/gallery', '/contact', '/book', '/admin']
const seen = new Set()
for (const u of pages) {
  await p.goto(base + u, { waitUntil: 'networkidle' })
  const hrefs = await p.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))
  hrefs.forEach((h) => seen.add(h))
}
const bad = [...seen].filter((h) => !h || h === '#' || h.startsWith('#') && h !== '#main')
ok(bad.length === 0, `no dead "#" links (${seen.size} unique hrefs checked)`)
const internal = [...seen].filter((h) => h.startsWith('/'))
for (const h of internal) {
  const r = await p.goto(base + h.split('#')[0], { waitUntil: 'domcontentloaded' })
  const redirected = new URL(p.url()).pathname !== h.split('?')[0].split('#')[0]
  ok(r.ok() && !redirected, `internal link works: ${h}`)
}
console.log('tel/mailto/external:', [...seen].filter((h) => !h.startsWith('/') && h !== '#main').join('  '))
await b.close()
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'ALL UI CHECKS PASSED')
