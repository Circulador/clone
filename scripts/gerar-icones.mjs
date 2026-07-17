/**
 * Ícones PWA — Consolare (navy + emblema verde/vermelho).
 * Requer: Node 18+ (sem dependências externas).
 */
import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

const NAVY = [13, 27, 42];
const VERDE = [0, 146, 70];
const BIANCO = [255, 255, 255];
const ROSSO = [206, 43, 55];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function pngSolid(size, draw) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const row = Buffer.alloc(1 + size * 4);
  const raw = Buffer.alloc((1 + size * 4) * size);
  for (let y = 0; y < size; y++) {
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y, size);
      const i = 1 + x * 4;
      row[i] = r;
      row[i + 1] = g;
      row[i + 2] = b;
      row[i + 3] = a;
    }
    row.copy(raw, y * row.length);
  }
  const compressed = deflateSync(raw);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function inRoundRect(x, y, rx, ry, rw, rh, rad) {
  const cx = Math.max(rx + rad, Math.min(x, rx + rw - rad - 1));
  const cy = Math.max(ry + rad, Math.min(y, ry + rh - rad - 1));
  const dx = x < rx + rad ? x - (rx + rad) : x >= rx + rw - rad ? x - (rx + rw - rad - 1) : 0;
  const dy = y < ry + rad ? y - (ry + rad) : y >= ry + rh - rad ? y - (ry + rh - rad - 1) : 0;
  if (Math.abs(x - cx) <= rad && Math.abs(y - cy) <= rad) return dx * dx + dy * dy <= rad * rad;
  return x >= rx && x < rx + rw && y >= ry && y < ry + rh;
}

function onRing(x, y, size, color) {
  const cx = size / 2;
  const cy = size * 0.44;
  const rOut = size * 0.28;
  const rIn = size * 0.23;
  const dx = x - cx + 0.5;
  const dy = y - cy + 0.5;
  const d2 = dx * dx + dy * dy;
  if (d2 > rOut * rOut || d2 < rIn * rIn) return false;
  const ang = Math.atan2(dy, dx);
  if (color === 'green') return ang > -Math.PI * 0.55 && ang < Math.PI * 0.05;
  return ang >= Math.PI * 0.05 || ang <= -Math.PI * 0.55;
}

function inEmblem(x, y, size) {
  const cx = size / 2;
  const cy = size * 0.44;
  const nx = (x - cx) / (size * 0.1);
  const ny = (y - (cy - size * 0.04)) / (size * 0.08);
  if (ny >= -0.8 && ny <= 0.2 && Math.abs(nx) <= 0.55) {
    if (ny < 0 && Math.abs(nx + ny * 0.3) < 0.35) return true;
    if (ny >= 0 && Math.abs(nx) < 0.45) return true;
  }
  const wy = cy + size * 0.1;
  if (y >= wy && y <= wy + size * 0.04 && x >= cx - size * 0.18 && x <= cx + size * 0.18) return true;
  return false;
}

function drawIcon(x, y, size) {
  const pad = size * 0.08;
  const rad = size * 0.2;
  if (!inRoundRect(x, y, pad, pad, size - pad * 2, size - pad * 2, rad)) {
    return [0, 0, 0, 0];
  }
  if (onRing(x, y, size, 'green')) return [...VERDE, 255];
  if (onRing(x, y, size, 'red')) return [...ROSSO, 255];
  if (inEmblem(x, y, size)) return [...BIANCO, 240];
  return [...NAVY, 255];
}

function drawMaskable(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.48;
  const dx = x - cx + 0.5;
  const dy = y - cy + 0.5;
  if (dx * dx + dy * dy > r * r) return [...NAVY, 255];
  return drawIcon(x, y, size);
}

for (const [name, size, fn] of [
  ['icon-192.png', 192, drawIcon],
  ['icon-512.png', 512, drawIcon],
  ['icon-512-maskable.png', 512, drawMaskable],
]) {
  writeFileSync(join(root, name), pngSolid(size, fn));
  console.log('OK', name);
}
