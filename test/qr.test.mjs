import { qrMatrix } from '../src/qr.js';
import QRCode from 'qrcode';

const cases = [
  'https://review.gruppenwerk.de/r/hantke',
  'https://gruppenwerk-review.pages.dev/r/brink',
  'a', 'AB', 'https://x.de/r/seehafer-elemente',
  'https://reviews.example-company-name-here.de/r/werner-geruestbau?src=qr',
  'x'.repeat(14), 'y'.repeat(26), 'z'.repeat(42), 'q'.repeat(62),
  'w'.repeat(84), 'e'.repeat(106), 'r'.repeat(122), 't'.repeat(152),
  'u'.repeat(180), 'i'.repeat(213),
  'Grüße aus Hamburg — Umlaute äöüß und ein längerer Text zum Testen der Bytecodierung.',
];

let fail = 0;
for (const text of cases) {
  const mine = qrMatrix(text);
  const ref = QRCode.create([{ data: text, mode: 'byte' }], { errorCorrectionLevel: 'M' });
  const size = ref.modules.size;
  const refData = ref.modules.data;
  let ok = mine.length === size;
  if (ok) {
    outer: for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (mine[r][c] !== refData[r * size + c]) { ok = false; break outer; }
  }
  const label = text.length > 34 ? text.slice(0, 31) + '...' : text;
  console.log(`${ok ? 'PASS' : 'FAIL'}  v${ref.version} ${size}x${size}  len=${text.length}  ${label}`);
  if (!ok) fail++;
}
console.log(fail === 0 ? '\nALL MATCH reference encoder' : `\n${fail} MISMATCH(ES)`);
process.exit(fail ? 1 : 0);
