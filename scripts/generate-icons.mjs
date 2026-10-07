// Erzeugt einfache Platzhalter-PNG-Icons (emerald Quadrat mit weißem Kreis) ohne externe
// Abhängigkeiten – nutzt nur Node-Bordmittel (zlib) für die PNG-Kodierung.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public/icons');
mkdirSync(outDir, { recursive: true });

const BG = [0x4f, 0x46, 0xe5]; // primary (indigo)
const FG = [0xff, 0xff, 0xff]; // paper

function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function renderPixel(x, y, size, padding) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - padding;
  const dx = x - cx + 0.5;
  const dy = y - cy + 0.5;
  return dx * dx + dy * dy <= radius * radius ? FG : BG;
}

function buildPng(size, padding) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc((1 + size * 3) * size);
  let offset = 0;
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = renderPixel(x, y, size, padding);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
    }
  }

  const idat = deflateSync(raw);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const targets = [
  { file: 'icon-192.png', size: 192, padding: 24 },
  { file: 'icon-512.png', size: 512, padding: 64 },
  { file: 'icon-512-maskable.png', size: 512, padding: 100 },
  { file: 'apple-touch-icon.png', size: 180, padding: 20 },
];

for (const target of targets) {
  const png = buildPng(target.size, target.padding);
  writeFileSync(path.join(outDir, target.file), png);
  console.log('geschrieben:', target.file);
}
