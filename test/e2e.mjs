import { chromium } from 'playwright';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { companies } from '../src/companies.js';

import { createServer } from 'node:http';
import worker from '../dist/worker.js';

const PORT = 8788;
const BASE = `http://localhost:${PORT}`;
const server = createServer(async (rq, rs) => {
  const r = await worker.fetch(new Request(BASE + rq.url));
  rs.writeHead(r.status, Object.fromEntries(r.headers));
  rs.end(Buffer.from(await r.arrayBuffer()));
});
await new Promise((ok) => server.listen(PORT, ok));
server.unref();

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

let fail = 0;
for (const c of companies) {
  await p.goto(`${BASE}/${c.slug}`, { waitUntil: 'networkidle' });
  const buf = await p.locator('.qrcard').screenshot();
  const png = PNG.sync.read(buf);
  const got = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  const want = `${BASE}/r/${c.slug}`;
  const ok = got && got.data === want;
  if (!ok) { fail++; console.log(`SCAN FAIL ${c.slug}: got ${got ? JSON.stringify(got.data) : 'null'} want ${want}`); }
  else console.log(`scan OK  ${c.slug.padEnd(18)} -> ${got.data}`);
}

// The customer page: tapping a suggestion must copy the text and navigate to Google.
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
// The sandbox can't reach google.com, so stub it to observe where the tap sends the customer.
await p.route('**://*.google.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>google stub</body></html>' }));
await p.goto(`${BASE}/r/hantke`, { waitUntil: 'networkidle' });
const visible = await p.locator('.tcard:visible').count();
const shownText = await p.locator('.tcard:visible').first().locator('p').innerText();
await p.locator('.tcard:visible').first().click();
// Read the clipboard while still on our own origin — the tap navigates away after ~700ms,
// and reading it on the google.com origin would block on a permission prompt.
const clip = await p.evaluate(() => navigator.clipboard.readText()).catch(() => '<unreadable>');
await p.waitForURL(/google\.com/, { timeout: 6000 }).catch(() => {});
const landed = p.url();
console.log(`\nsuggestions visible: ${visible}`);
console.log(`copied text matches the tapped card: ${clip.trim() === shownText.trim()}`);
console.log(`tap sends customer to: ${landed.slice(0, 80)}`);
if (visible !== 3) { console.log('FAIL expected 3 suggestions'); fail++; }
if (clip.trim() !== shownText.trim()) { console.log('FAIL clipboard mismatch'); fail++; }
if (!/google\.com/.test(landed)) { console.log('FAIL did not reach Google'); fail++; }

// "Andere Vorschläge" must swap the set.
await p.goto(`${BASE}/r/hantke`, { waitUntil: 'networkidle' });
const before = await p.locator('.tcard:visible p').allInnerTexts();
await p.locator('#more').click();
const after = await p.locator('.tcard:visible p').allInnerTexts();
const swapped = JSON.stringify(before) !== JSON.stringify(after) && after.length === 3;
console.log(`"andere Vorschläge" swaps set: ${swapped}`);
if (!swapped) { console.log('FAIL rotation'); fail++; }

if (errs.length) { console.log('\nJS ERRORS:\n' + errs.join('\n')); fail++; }
await b.close();
console.log(fail ? `\n${fail} FAILURE(S)` : '\nE2E OK');
process.exit(fail ? 1 : 0);
