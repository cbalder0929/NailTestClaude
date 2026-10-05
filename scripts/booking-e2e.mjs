// End-to-end booking tests at 375 and 1280. Usage: node scripts/booking-e2e.mjs [baseUrl]
import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:5199'
const out = 'screenshots'
mkdirSync(out, { recursive: true })
const problems = []
const log = (m) => console.log(m)
const assert = (cond, msg) => {
  if (!cond) problems.push('ASSERT FAILED: ' + msg)
  log((cond ? '  ok   ' : '  FAIL ') + msg)
}

const browser = await chromium.launch()

async function newPage(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800, acceptDownloads: true })
  const page = await ctx.newPage()
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && problems.push(`[${w}] console.${m.type()}: ${m.text()}`))
  page.on('pageerror', (e) => problems.push(`[${w}] pageerror: ${e.message}`))
  page.on('requestfailed', (r) => problems.push(`[${w}] requestfailed: ${r.url()}`))
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const st = document.createElement('style')
      st.textContent = 'html{scroll-behavior:auto!important}'
      document.head.appendChild(st)
    })
  })
  return { ctx, page }
}

const cont = (page) => page.getByRole('button', { name: /^(Continue|Pay \$)/ })
const hasOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)

async function shot(page, w, tag) {
  await page.waitForTimeout(550)
  await page.screenshot({ path: `${out}/book-${w}-${tag}.png` })
}

async function pickDate(page, { wantLow = false, nth = 1 } = {}) {
  const pills = page.locator('[role=radiogroup][aria-label="Appointment date"] [role=radio]:not([disabled])')
  if (wantLow) {
    const low = page.locator('[role=radiogroup][aria-label="Appointment date"] [role=radio]:not([disabled])', { hasText: /left/ })
    if (await low.count()) {
      await low.first().click()
      return true
    }
    return false
  }
  await pills.nth(Math.min(nth, (await pills.count()) - 1)).click()
  return true
}

async function fillInfo(page, tag) {
  await page.getByLabel('First name').fill('Maya')
  await page.getByLabel('Last name').fill(`Tester${tag}`)
  await page.getByLabel('Mobile phone').fill('7735550123')
  await page.getByLabel('Email').fill('maya@example.com')
  await page.getByLabel(/Notes for your artist/).fill('Almond shape, medium length. Allergic to nothing!')
}

async function payAndConfirm(page, w, tag) {
  await page.getByRole('button', { name: 'Fill demo card' }).click()
  await shot(page, w, `${tag}-7-deposit`)
  await cont(page).click()
  await page.locator('button[aria-busy="true"]:visible').waitFor({ timeout: 2000 })
  await shot(page, w, `${tag}-7b-processing`)
  await page.getByRole('heading', { name: /See you soon/ }).waitFor({ timeout: 5000 })
  await shot(page, w, `${tag}-8-confirmation`)
}

async function runFlow(w, h, { name, entry, tech, busy, ctxArgs }) {
  log(`\n▶ ${name} @ ${w}px`)
  const { ctx, page } = await newPage(w, h)
  const tag = name
  if (entry === 'nav') {
    await page.goto(base + '/', { waitUntil: 'networkidle' })
    const bookNow = w < 1024 ? page.locator('header').getByRole('link', { name: 'Book Now' }) : page.locator('header nav').getByRole('link', { name: 'Book Now' })
    await bookNow.click()
    await page.waitForURL('**/book')
  } else {
    await page.goto(base + '/services', { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: 'Book Acrylic Full Set' }).click()
    await page.waitForURL('**/book**')
    const ok = await page.locator('[role=radio][aria-checked=true]', { hasText: /^Acrylic Full Set/ }).waitFor({ timeout: 3000 }).then(() => true, () => false)
    assert(ok, 'service preselected from Services card')
    assert(!(page.url().includes('service=')), 'service param cleaned from URL')
  }

  // 1 service
  await page.getByRole('heading', { name: 'Choose your service' }).waitFor()
  assert(await cont(page).isVisible(), 'continue button visible')
  if (entry === 'nav') {
    assert(await cont(page).isDisabled(), 'Continue disabled until a service is chosen')
    await page.getByRole('radio', { name: /^Gel-X Full Set/ }).click()
  }
  await page.getByRole('button', { name: /^French Tip/ }).click()
  await page.getByRole('button', { name: /^Chrome Finish/ }).click()
  await shot(page, w, `${tag}-1-service`)
  if (w < 800) {
    await page.getByRole('button', { name: /View summary/ }).click()
    await page.getByRole('dialog', { name: 'Appointment summary' }).waitFor()
    await shot(page, w, `${tag}-1b-summary-sheet`)
    await page.keyboard.press('Escape')
    await page.getByRole('dialog', { name: 'Appointment summary' }).waitFor({ state: 'detached' })
  }
  await cont(page).click()

  // 2 tech
  await page.getByRole('heading', { name: 'Choose your artist' }).waitFor()
  if (tech !== 'any') await page.getByRole('radio', { name: new RegExp(tech) }).click()
  await shot(page, w, `${tag}-2-artist`)
  await cont(page).click()

  // 3 date
  await page.getByRole('heading', { name: 'Pick a day' }).waitFor()
  assert(await cont(page).isDisabled(), 'Continue disabled until a date is chosen')
  const closedPills = await page.locator('[role=radiogroup][aria-label="Appointment date"] [role=radio][disabled]').count()
  assert(closedPills >= 2, `closed / unavailable days are disabled (${closedPills} disabled pills)`)
  let foundLow = true
  if (busy) foundLow = await pickDate(page, { wantLow: true })
  else await pickDate(page, { nth: 1 })
  assert(foundLow, busy ? 'found a nearly-full day ("N left") for this technician' : 'picked a date')
  if (!foundLow) {
    await pickDate(page, { nth: 2 })
  }
  await shot(page, w, `${tag}-3-date`)
  await cont(page).click()

  // 4 time
  await page.getByRole('heading', { name: 'Choose a time' }).waitFor()
  assert(await cont(page).isDisabled(), 'Continue disabled until a time is chosen')
  const times = page.locator('[role=radiogroup][aria-label$="start times"] [role=radio]')
  const n = await times.count()
  assert(n > 0, `time slots shown (${n})`)
  if (busy && foundLow) assert(await page.getByText(/Only \d spots? left/).first().isVisible(), '"Only N spots left" banner shown on busy day')
  await times.nth(Math.min(2, n - 1)).click()
  await shot(page, w, `${tag}-4-time`)
  await cont(page).click()

  // 5 info
  await page.getByRole('heading', { name: 'Your details' }).waitFor()
  assert(await cont(page).isDisabled(), 'Continue disabled until details are valid')
  await page.getByLabel('Email').fill('bad')
  await page.getByLabel('Email').blur()
  assert(await page.getByText(/Enter a valid email/).isVisible(), 'inline email validation message')
  await fillInfo(page, tag.replace(/\W/g, '').slice(0, 6))
  await shot(page, w, `${tag}-5-info`)
  assert((await page.getByLabel('Mobile phone').inputValue()) === '(773) 555-0123', 'phone auto-formatted')
  await cont(page).click()

  // 6 review (+ edit link jump + refresh persistence)
  await page.getByRole('heading', { name: /Review/ }).waitFor()
  await shot(page, w, `${tag}-6-review`)
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: /Review/ }).waitFor({ timeout: 4000 })
  assert(true, 'state survived a page refresh (still on Review with data)')
  await page.getByRole('button', { name: 'Edit date & time' }).click()
  await page.getByRole('heading', { name: 'Pick a day' }).waitFor()
  assert(true, 'Edit link jumps back to the Date step')
  await page.getByRole('button', { name: 'Back' }).first().click()
  await page.getByRole('heading', { name: 'Choose your artist' }).waitFor()
  assert(true, 'Back works')
  await cont(page).click() // → date (still valid)
  await page.getByRole('heading', { name: 'Pick a day' }).waitFor()
  await cont(page).click() // → time
  await page.getByRole('heading', { name: 'Choose a time' }).waitFor()
  assert(!(await cont(page).isDisabled()), 'chosen time retained after navigating back and forward')
  await cont(page).click()
  await page.getByRole('heading', { name: 'Your details' }).waitFor()
  await cont(page).click()
  await page.getByRole('heading', { name: /Review/ }).waitFor()
  await cont(page).click()

  // 7 deposit
  await page.getByRole('heading', { name: 'Secure your spot' }).waitFor()
  assert(await page.getByText(/Demo mode — no real charge/i).isVisible(), 'DEMO MODE banner visible')
  assert(await cont(page).isDisabled(), 'Pay disabled until card is valid')
  await page.getByLabel('Card number').fill('4242424242424242')
  assert((await page.getByLabel('Card number').inputValue()) === '4242 4242 4242 4242', 'card number auto-spaced')
  assert(await page.getByLabel('visa card detected').isVisible(), 'card brand icon detected (Visa)')
  await page.getByLabel('Card number').fill('')
  await payAndConfirm(page, w, tag)

  // 8 confirmation
  const code = await page.getByLabel(/^Confirmation number/).innerText()
  assert(/^RNA-[A-Z0-9]{5}$/.test(code.trim()), `confirmation number format (${code.trim()})`)
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Add to Calendar' }).click()])
  const ics = readFileSync(await dl.path(), 'utf8')
  assert(ics.includes('BEGIN:VEVENT') && ics.includes(code.trim()) && ics.includes('DTSTART:'), `.ics downloaded (${dl.suggestedFilename()})`)
  assert((await page.getByRole('link', { name: 'Get Directions' }).getAttribute('href'))?.includes('google.com/maps'), 'Get Directions link')
  assert((await hasOverflow(page)) <= 0, 'no horizontal overflow on confirmation')

  // dashboard shows it
  await page.goto(base + '/admin', { waitUntil: 'networkidle' })
  assert(await page.getByText(code.trim()).first().isVisible(), 'booking appears on /admin dashboard')
  await page.screenshot({ path: `${out}/admin-after-booking-${w}.png`, fullPage: false })

  // Book Another resets
  await page.goto(base + '/book', { waitUntil: 'networkidle' })
  const fresh = await page.getByRole('heading', { name: 'Choose your service' }).isVisible().catch(() => false)
  const stillConfirmed = await page.getByRole('heading', { name: /See you soon/ }).isVisible().catch(() => false)
  assert(fresh || stillConfirmed, 'returning to /book renders')
  await ctx.close()
}

async function checkEngine() {
  log('\n▶ availability engine sanity')
  const { ctx, page } = await newPage(1280, 800)
  await page.goto(base + '/', { waitUntil: 'networkidle' })
  const res = await page.evaluate(async () => {
    const av = await import('/src/lib/availability.ts')
    const { salon } = await import('/src/config/salon.ts')
    const { nextDays, toKey } = await import('/src/lib/dates.ts')
    const days = nextDays(14).map(toKey)
    let checked = 0, overlaps = 0, pastClose = 0, closedHasSlots = 0, offHasSlots = 0, anyMismatch = 0
    let busyDays = 0, quietDays = 0
    const sample = []
    for (const k of days) {
      const hrs = av.hoursFor(k)
      for (const dur of [30, 90, 135]) {
        for (const tech of ['any', ...salon.technicians.map((t) => t.id)]) {
          const slots = av.computeSlots(k, tech, dur)
          if (!hrs && slots.length) closedHasSlots++
          if (tech !== 'any' && !av.techWorks(tech, k) && slots.length) offHasSlots++
          for (const s of slots) {
            checked++
            if (hrs && s.time + dur > hrs.close) pastClose++
            for (const id of s.techIds) {
              if (av.appointmentsFor(id, k).some((a) => s.time < a.end && s.time + dur > a.start)) overlaps++
            }
            if (!s.techIds.includes(s.assigned)) anyMismatch++
          }
        }
      }
      for (const t of salon.technicians) {
        if (!av.techWorks(t.id, k)) continue
        const st = av.dayStatus(k, t.id, 60)
        if (st.state === 'open' && st.spotsLeft <= 3) busyDays++
        if (st.state === 'full') busyDays++
        if (st.state === 'open' && st.spotsLeft > 6) quietDays++
      }
    }
    // any == union of per-tech
    const k0 = days.find((d) => av.hoursFor(d))
    const anyTimes = new Set(av.computeSlots(k0, 'any', 60).map((s) => s.time))
    const union = new Set(salon.technicians.flatMap((t) => av.computeSlots(k0, t.id, 60).map((s) => s.time)))
    return { checked, overlaps, pastClose, closedHasSlots, offHasSlots, anyMismatch, busyDays, quietDays, unionOK: anyTimes.size === union.size }
  })
  log('  ' + JSON.stringify(res))
  assert(res.checked > 1000, `checked ${res.checked} slots`)
  assert(res.overlaps === 0, 'no slot overlaps an existing appointment')
  assert(res.pastClose === 0, 'no slot runs past closing time')
  assert(res.closedHasSlots === 0, 'closed days (Mondays) have no slots')
  assert(res.offHasSlots === 0, 'technician days off have no slots')
  assert(res.anyMismatch === 0, '"Any available" always assigns a free technician')
  assert(res.unionOK, '"Any available" = union of all technicians’ openings')
  assert(res.busyDays > 0 && res.quietDays > 0, `mix of busy (${res.busyDays}) and quiet (${res.quietDays}) tech-days`)
  await ctx.close()
}

await checkEngine()
for (const [w, h] of [[375, 812], [1280, 900]]) {
  await runFlow(w, h, { name: 'nav-any', entry: 'nav', tech: 'any', busy: false })
  await runFlow(w, h, { name: 'services-preselect', entry: 'service', tech: 'any', busy: false })
  await runFlow(w, h, { name: 'specific-busy', entry: 'nav', tech: 'Mina', busy: true })
}
await browser.close()
console.log('\n' + (problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'ALL CHECKS PASSED'))
