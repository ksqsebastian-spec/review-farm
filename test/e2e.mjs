import { chromium } from 'playwright';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { createServer } from 'node:http';
import worker from '../dist/worker.js';
import { companies } from '../src/companies.js';
import { buildReview } from '../src/review-text.js';
import { RECOMMEND } from '../src/phrases.js';

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

// 2. Standard: jeder Aufruf liefert einen anderen Vorschlag.
const seen = new Set();
for (let i = 0; i < 15; i++) {
  await p.goto(`${BASE}/r/hantke`, { waitUntil: 'domcontentloaded' });
  seen.add((await p.locator('#quote').innerText()).trim());
}
check(seen.size >= 14, `15 Aufrufe -> ${seen.size} verschiedene Texte`);

// 3. Kein Baustein taucht bei zwei Betrieben auf - das ist die eigentliche Absicherung.
// Verglichen wird der fertige Satz, nicht der rohe Baustein: ein
// kleingeschriebener Qualitätsbaustein und ein Schlusssatz können sich sonst
// erst im Text treffen ("wir sind sehr zufrieden" -> "Wir sind sehr zufrieden.").
const norm = (s) => {
  const t = s.trim().replace('{kw}', 'X');
  const c = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?\u{1F44D}]$/u.test(c) ? c : c + '.';
};
const owner = new Map();
let shared = 0;
for (const c of companies) {
  for (const raw of [...c.quality, ...c.recommend, ...c.closer, ...(c.extra || []), ...c.open.map((o) => o[0])]) {
    const s = norm(raw);
    if (owner.has(s) && owner.get(s) !== c.slug) { shared++; console.log('   doppelt:', s); }
    owner.set(s, c.slug);
  }
}
check(shared === 0, `keine gemeinsamen Bausteine zwischen Betrieben (${shared})`);

// 3b. Die Suchbegriffe stehen im Akkusativ - eine Dativ-Präposition davor
// erzeugt "Bei ein Büro in Hamburg ...". Deshalb darf {kw} nur hinter "für"
// oder als Objekt stehen.
const dativ = RECOMMEND.filter((r) => /\b(bei|mit|von|zu|nach|aus) \{kw\}/.test(r));
check(dativ.length === 0, `keine Dativ-Präposition vor dem Suchbegriff (${dativ.join(' | ') || 'ok'})`);

// 4. Texte enthalten nie einen unersetzten Platzhalter und sind vollständige Sätze.
let broken = 0;
for (const c of companies) {
  for (let i = 0; i < 400; i++) {
    const t = buildReview(c, Math.random);
    // Emoji-Schluss ist gewollt, Gedankenstriche sind es nicht - die sind das
    // deutlichste Erkennungszeichen für generierten Text.
    if (t.includes('{') || !/[.!?\u{1F44D}]$/u.test(t) || /\s\s/.test(t) || t.length < 40 || /[—–]/.test(t)) broken++;
  }
}
check(broken === 0, `3600 Texte ohne Platzhalter, Gedankenstriche oder Bruchstücke (${broken})`);

// 5. "Anderer Text" tauscht den Vorschlag ohne Neuladen.
await p.goto(`${BASE}/r/hantke`, { waitUntil: 'networkidle' });
const before = await p.locator('#quote').innerText();
await p.locator('#again').click();
const after = await p.locator('#quote').innerText();
check(before !== after && after.length > 60, '"Anderer Text" tauscht den Vorschlag');

// 6. Ein Tipp kopiert genau den gezeigten Text und führt direkt ins Google-Fenster.
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
await p.route('**://*.google.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<html>stub</html>' }));
await p.goto(`${BASE}/r/hantke`, { waitUntil: 'networkidle' });
const shown = (await p.locator('#quote').innerText()).trim();
await p.locator('#go').click();
const clip = await p.evaluate(() => navigator.clipboard.readText()).catch(() => '<unreadable>');
await p.waitForURL(/google\.com/, { timeout: 6000 }).catch(() => {});
check(clip.trim() === shown, 'Zwischenablage enthält genau den gezeigten Text');
check(/search\.google\.com\/local\/writereview\?placeid=/.test(p.url()), `Ziel: ${p.url().slice(0, 68)}`);

// 6b. Die Selbst-schreiben-Variante bleibt erreichbar.
await p.goto(`${BASE}/r/hantke?selbst=1`, { waitUntil: 'networkidle' });
check((await p.locator('textarea').count()) === 2 && (await p.locator('#go').isDisabled()),
  '?selbst=1 liefert weiter den Fragen-Modus');

// 7. Every company with a placeId links straight to the review dialog.
for (const c of companies.filter((x) => x.placeId)) {
  await p.goto(`${BASE}/r/${c.slug}`, { waitUntil: 'domcontentloaded' });
  const href = await p.locator('#plain').getAttribute('href');
  check(href.includes(`writereview?placeid=${c.placeId}`), `direkter Review-Link ${c.slug}`);
}

if (bad.length) { console.log('HTTP-Fehler:\n' + bad.join('\n')); fail++; }
if (errs.length) { console.log('JS-Fehler:\n' + errs.join('\n')); fail++; }
await b.close();
server.close();
console.log(fail ? `\n${fail} FEHLER` : '\nE2E OK');
process.exit(fail ? 1 : 0);
