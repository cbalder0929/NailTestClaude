// Viewport (not full-page) screenshot: node scripts/viewport.mjs <path> <width> <height> <outfile>
import { chromium } from 'playwright'
const [path, w, h, file] = process.argv.slice(2)
const b = await chromium.launch()
const c = await b.newContext({ viewport: { width: +w, height: +h }, isMobile: +w < 800, hasTouch: +w < 800 })
const p = await c.newPage()
await p.goto('http://localhost:5199' + path, { waitUntil: 'networkidle' })
await p.waitForTimeout(900)
await p.screenshot({ path: file })
await b.close()
