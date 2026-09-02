import { chromium } from 'playwright';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { createServer } from 'node:http';
import worker from '../dist/worker.js';
import { companies } from '../src/companies.js';
import { buildReview } from '../src/review-text.js';

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
const bad = [];
p.on('pageerror', (e) => errs.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
p.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });

let fail = 0;
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fail++; };

// 1. Every QR code must scan back to that company's own review page.
for (const c of companies) {
  await p.goto(`${BASE}/${c.slug}`, { waitUntil: 'networkidle' });
  const png = PNG.sync.read(await p.locator('.qr').screenshot());
  const got = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  check(got && got.data === `${BASE}/r/${c.slug}`, `QR ${c.slug} -> ${got ? got.data : 'null'}`);
  const logo = await p.locator('.logo').getAttribute('src');
  check(logo === `/l/${c.logo}`, `logo ${c.slug} ${logo}`);
}

// 2. Prompt mode: the customer writes the text; the button stays off until they have.
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
await p.route('**://*.google.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<html>stub</html>' }));
await p.goto(`${BASE}/r/hantke`, { waitUntil: 'networkidle' });
check(await p.locator('#go').isDisabled(), 'Button ist gesperrt, solange nichts eingetragen ist');

await p.locator('.chips').first().locator('.chip').first().click();
check(await p.locator('#go').isDisabled(), 'ein Stichwort allein reicht nicht');

await p.locator('#a1').fill('Fassade gestrichen und Fenster lackiert');
await p.locator('#a2').fill('pünktlich, sauber, faire Beratung');
const preview = (await p.locator('#prev').innerText()).trim();
check(preview === 'Fassade gestrichen und Fenster lackiert. Pünktlich, sauber, faire Beratung.',
  `Vorschau: "${preview}"`);
check(await p.locator('#go').isEnabled(), 'Button ist frei, sobald beide Fragen beantwortet sind');

// 3. Chips only insert short fragments, never finished sentences.
const frags = await p.locator('.chip').allInnerTexts();
const longest = frags.reduce((a, b) => (a.length > b.length ? a : b));
check(!frags.some((f) => /[.!?]$/.test(f)) && longest.length <= 24,
  `Stichworte sind Fragmente, längstes: "${longest}"`);

// 4. Tapping a chip appends to the right field.
await p.locator('#a1').fill('');
await p.locator('.chips').first().locator('.chip').nth(1).click();
await p.locator('.chips').first().locator('.chip').nth(6).click();
check((await p.locator('#a1').inputValue()) === 'Fassade gestrichen, in Hamburg', 'Stichworte hängen sich an');

// 5. The button copies exactly the preview and goes to Google's review dialog.
await p.locator('#a2').fill('sehr pünktlich und sauber');
const shown = (await p.locator('#prev').innerText()).trim();
await p.locator('#go').click();
const clip = await p.evaluate(() => navigator.clipboard.readText()).catch(() => '<unreadable>');
await p.waitForURL(/google\.com/, { timeout: 6000 }).catch(() => {});
check(clip.trim() === shown, 'Zwischenablage enthält genau die Vorschau');
check(/search\.google\.com\/local\/writereview\?placeid=/.test(p.url()), `Ziel: ${p.url().slice(0, 70)}`);

// 6. The older generated-suggestion page is still reachable for comparison.
const seen = new Set();
for (let i = 0; i < 8; i++) {
  await p.goto(`${BASE}/r/hantke?vorschlag=1`, { waitUntil: 'domcontentloaded' });
  seen.add((await p.locator('#quote').innerText()).trim());
}
check(seen.size >= 7, `?vorschlag=1 liefert weiter wechselnde Texte (${seen.size}/8)`);

// 7. Every company with a placeId links straight to the review dialog.
for (const c of companies.filter((x) => x.placeId)) {
  await p.goto(`${BASE}/r/${c.slug}`, { waitUntil: 'domcontentloaded' });
  const href = await p.locator('#plain').getAttribute('href');
  check(href.includes(`writereview?placeid=${c.placeId}`), `direkter Review-Link ${c.slug}`);
}

// 6. Generated text must never contain an unreplaced placeholder.
let holes = 0;
for (const c of companies) for (let i = 0; i < 300; i++) if (buildReview(c, Math.random).includes('{')) holes++;
check(holes === 0, `2700 Texte ohne Platzhalter-Reste (${holes} Treffer)`);

if (bad.length) { console.log('HTTP-Fehler:\n' + bad.join('\n')); fail++; }
if (errs.length) { console.log('JS-Fehler:\n' + errs.join('\n')); fail++; }
await b.close();
server.close();
console.log(fail ? `\n${fail} FEHLER` : '\nE2E OK');
process.exit(fail ? 1 : 0);
