// Minimal QR Code encoder (byte mode, EC level M, versions 1-10).
// Self-contained so the Worker can render a QR for whatever origin it is
// served from, without a build step or an external image service.

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]]);

function rsGenerator(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], 1);
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data, ecLen) {
  const gen = rsGenerator(ecLen);
  const rem = new Array(ecLen).fill(0);
  for (const byte of data) {
    const factor = byte ^ rem[0];
    rem.shift();
    rem.push(0);
    for (let i = 0; i < ecLen; i++) rem[i] ^= gfMul(gen[i + 1], factor);
  }
  return rem;
}

// [ecPerBlock, blocksG1, dataPerBlockG1, blocksG2, dataPerBlockG2] for EC level M
const EC_M = {
  1: [10, 1, 16, 0, 0],
  2: [16, 1, 28, 0, 0],
  3: [26, 1, 44, 0, 0],
  4: [18, 2, 32, 0, 0],
  5: [24, 2, 43, 0, 0],
  6: [16, 4, 27, 0, 0],
  7: [18, 4, 31, 0, 0],
  8: [22, 2, 38, 2, 39],
  9: [22, 3, 36, 2, 37],
  10: [26, 4, 43, 1, 44],
};

const ALIGN = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
};

const dataCodewords = (v) => {
  const [, b1, d1, b2, d2] = EC_M[v];
  return b1 * d1 + b2 * d2;
};

function formatBits(mask) {
  const data = (0b00 << 3) | mask; // 0b00 = EC level M
  let rem = data << 10;
  for (let i = 14; i >= 10; i--) if (rem & (1 << i)) rem ^= 0x537 << (i - 10);
  return ((data << 10) | rem) ^ 0x5412;
}

function versionBits(version) {
  let rem = version << 12;
  for (let i = 17; i >= 12; i--) if (rem & (1 << i)) rem ^= 0x1f25 << (i - 12);
  return (version << 12) | rem;
}

function pickVersion(byteLen) {
  for (let v = 1; v <= 10; v++) {
    const countBits = v < 10 ? 8 : 16;
    if (dataCodewords(v) * 8 >= 4 + countBits + byteLen * 8) return v;
  }
  throw new Error('QR: data too long (max version 10)');
}

function buildCodewords(bytes, version) {
  const countBits = version < 10 ? 8 : 16;
  const total = dataCodewords(version);
  const bits = [];
  const push = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  push(0b0100, 4);
  push(bytes.length, countBits);
  for (const b of bytes) push(b, 8);
  // Terminator, then align to byte boundary.
  for (let i = 0; i < 4 && bits.length < total * 8; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const cw = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    cw.push(byte);
  }
  const PAD = [0xec, 0x11];
  while (cw.length < total) cw.push(PAD[(cw.length - bits.length / 8) % 2]);

  // Split into blocks, compute ECC, then interleave.
  const [ecLen, b1, d1, b2, d2] = EC_M[version];
  const blocks = [];
  let pos = 0;
  for (let i = 0; i < b1; i++) { blocks.push(cw.slice(pos, pos + d1)); pos += d1; }
  for (let i = 0; i < b2; i++) { blocks.push(cw.slice(pos, pos + d2)); pos += d2; }
  const ecBlocks = blocks.map((b) => rsEncode(b, ecLen));

  const out = [];
  const maxData = Math.max(d1, d2);
  for (let i = 0; i < maxData; i++) {
    for (const b of blocks) if (i < b.length) out.push(b[i]);
  }
  for (let i = 0; i < ecLen; i++) {
    for (const b of ecBlocks) out.push(b[i]);
  }
  return out;
}

function buildMatrix(version, codewords) {
  const size = version * 4 + 17;
  const mod = Array.from({ length: size }, () => new Array(size).fill(null));
  const fn = Array.from({ length: size }, () => new Array(size).fill(false));

  const setFn = (r, c, v) => {
    if (r < 0 || c < 0 || r >= size || c >= size) return;
    mod[r][c] = v;
    fn[r][c] = true;
  };

  // Finder patterns + separators
  for (const [fr, fc] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const inner = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const dark = inner && ((r === 0 || r === 6 || c === 0 || c === 6) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        setFn(fr + r, fc + c, dark ? 1 : 0);
      }
    }
  }
  // Timing patterns
  for (let i = 0; i < size; i++) {
    if (mod[6][i] === null) setFn(6, i, i % 2 === 0 ? 1 : 0);
    if (mod[i][6] === null) setFn(i, 6, i % 2 === 0 ? 1 : 0);
  }
  // Alignment patterns
  const centers = ALIGN[version];
  for (const r of centers) {
    for (const c of centers) {
      const onFinder = (r === 6 && c === 6) || (r === 6 && c === size - 7) ||
        (r === size - 7 && c === 6);
      if (onFinder) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setFn(r + dr, c + dc, dark ? 1 : 0);
        }
      }
    }
  }
  // Reserve format info area + dark module (timing modules already placed win)
  for (let i = 0; i < 9; i++) {
    if (!fn[8][i]) setFn(8, i, 0);
    if (!fn[i][8]) setFn(i, 8, 0);
  }
  for (let i = 0; i < 8; i++) { setFn(8, size - 1 - i, 0); setFn(size - 1 - i, 8, 0); }
  setFn(size - 8, 8, 1);
  // Version info (v7+)
  if (version >= 7) {
    const vb = versionBits(version);
    for (let i = 0; i < 18; i++) {
      const bit = (vb >> i) & 1;
      setFn(Math.floor(i / 3), size - 11 + (i % 3), bit);
      setFn(size - 11 + (i % 3), Math.floor(i / 3), bit);
    }
  }

  // Place data in the zig-zag pattern
  let bitIdx = 0;
  const nextBit = () => {
    if (bitIdx >= codewords.length * 8) return 0;
    const bit = (codewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1;
    bitIdx++;
    return bit;
  };
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // skip the vertical timing column
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const c = right - j;
        const upward = ((right + 1) & 2) === 0;
        const r = upward ? size - 1 - vert : vert;
        if (mod[r][c] === null) mod[r][c] = nextBit();
      }
    }
  }
  return { mod, fn, size };
}

const maskFn = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function penalty(m, size) {
  let score = 0;
  // Rule 1: runs of 5+ same-colour modules in a row/column
  for (let i = 0; i < size; i++) {
    for (const horizontal of [true, false]) {
      let run = 1;
      for (let j = 1; j < size; j++) {
        const a = horizontal ? m[i][j] : m[j][i];
        const b = horizontal ? m[i][j - 1] : m[j - 1][i];
        if (a === b) { run++; } else { if (run >= 5) score += run - 2; run = 1; }
      }
      if (run >= 5) score += run - 2;
    }
  }
  // Rule 2: 2x2 blocks of the same colour
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = m[r][c];
      if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
    }
  }
  // Rule 3: finder-like 1:1:3:1:1 patterns
  const P1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const P2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j + 11 <= size; j++) {
      let h1 = true, h2 = true, v1 = true, v2 = true;
      for (let k = 0; k < 11; k++) {
        if (m[i][j + k] !== P1[k]) h1 = false;
        if (m[i][j + k] !== P2[k]) h2 = false;
        if (m[j + k][i] !== P1[k]) v1 = false;
        if (m[j + k][i] !== P2[k]) v2 = false;
      }
      if (h1) score += 40;
      if (h2) score += 40;
      if (v1) score += 40;
      if (v2) score += 40;
    }
  }
  // Rule 4: deviation from a 50/50 dark ratio
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) dark += m[r][c];
  const total = size * size;
  score += Math.abs(Math.ceil(((dark * 100) / total) / 5) - 10) * 10;
  return score;
}

function applyFormat(m, size, mask) {
  const bits = formatBits(mask);
  for (let i = 0; i < 15; i++) {
    const bit = (bits >> (14 - i)) & 1; // bit 14 is placed first
    // Copy 1 (around the top-left finder)
    if (i < 6) m[8][i] = bit;
    else if (i === 6) m[8][7] = bit;
    else if (i === 7) m[8][8] = bit;
    else if (i === 8) m[7][8] = bit;
    else m[14 - i][8] = bit;
    // Copy 2 (split between the top-right and bottom-left finders)
    if (i < 7) m[size - 1 - i][8] = bit;
    else m[8][size - 15 + i] = bit;
  }
  m[size - 8][8] = 1; // dark module, always set
}

/** Encode a string into a QR module matrix (array of 0/1 rows). */
export function qrMatrix(text, forceMask = null) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = pickVersion(bytes.length);
  const codewords = buildCodewords(bytes, version);
  const { mod, fn, size } = buildMatrix(version, codewords);

  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    if (forceMask !== null && mask !== forceMask) continue;
    const m = mod.map((row) => row.slice());
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!fn[r][c] && maskFn[mask](r, c)) m[r][c] ^= 1;
      }
    }
    applyFormat(m, size, mask);
    const score = penalty(m, size);
    if (!best || score < best.score) best = { score, m };
  }
  return best.m;
}

/** Render a QR code as a standalone SVG string. */
export function qrSvg(text, { margin = 2, dark = '#111827', light = '#ffffff' } = {}) {
  const m = qrMatrix(text);
  const size = m.length;
  const dim = size + margin * 2;
  let path = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (m[r][c]) path += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges" role="img" aria-label="QR-Code">` +
    `<rect width="${dim}" height="${dim}" fill="${light}"/>` +
    `<path d="${path}" fill="${dark}"/></svg>`;
}
