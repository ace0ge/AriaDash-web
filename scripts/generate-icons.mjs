import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ICONS_DIR = join(__dirname, '..', 'public', 'icons')

function createChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeB = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([typeB, data])
  const crc = crc32(crcInput)
  const crcB = Buffer.alloc(4)
  crcB.writeUInt32BE(crc, 0)
  return Buffer.concat([len, typeB, data, crcB])
}

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0)
    }
  }
  return (c ^ 0xFFFFFFFF) >>> 0
}

function distSq(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return (px - x1) ** 2 + (py - y1) ** 2
  let t = ((px - x1) * dx + (py - y1) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return (px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2
}

const CLOUD_RGB = { r: 66, g: 70, b: 82 }
const BOLT_RGB = { r: 255, g: 215, b: 0 }

function isInCloud(px, py, s) {
  const cx = s / 2
  const cy = s * 0.52
  const circles = [
    { x: cx, y: cy, r: s * 0.36 },
    { x: cx - s * 0.22, y: cy - s * 0.08, r: s * 0.16 },
    { x: cx - s * 0.10, y: cy - s * 0.18, r: s * 0.20 },
    { x: cx + s * 0.06, y: cy - s * 0.19, r: s * 0.21 },
    { x: cx + s * 0.20, y: cy - s * 0.08, r: s * 0.17 },
    { x: cx - s * 0.32, y: cy + s * 0.04, r: s * 0.14 },
    { x: cx + s * 0.32, y: cy + s * 0.04, r: s * 0.14 },
  ]
  for (const c of circles) {
    const dx = px - c.x, dy = py - c.y
    if (dx * dx + dy * dy <= c.r * c.r) return true
  }
  const r = s * 0.36
  if (py >= cy + r * 0.15 && py <= cy + r && px >= cx - r && px <= cx + r) return true
  return false
}

function isInLightning(px, py, s) {
  const cx = s / 2
  const cy = s * 0.52
  const pts = [
    { x: cx - s * 0.01, y: cy - s * 0.20 },
    { x: cx + s * 0.11, y: cy - s * 0.04 },
    { x: cx - s * 0.04, y: cy + s * 0.06 },
    { x: cx + s * 0.07, y: cy + s * 0.21 },
  ]
  const t2 = (s * 0.045) ** 2
  for (let i = 0; i < pts.length - 1; i++) {
    if (distSq(px, py, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y) <= t2) return true
  }
  for (const p of pts) {
    const dx = px - p.x, dy = py - p.y
    if (dx * dx + dy * dy <= t2) return true
  }
  return false
}

function isNearBolt(px, py, s) {
  const cx = s / 2
  const cy = s * 0.52
  const pts = [
    { x: cx - s * 0.01, y: cy - s * 0.20 },
    { x: cx + s * 0.11, y: cy - s * 0.04 },
    { x: cx - s * 0.04, y: cy + s * 0.06 },
    { x: cx + s * 0.07, y: cy + s * 0.21 },
  ]
  const gt2 = (s * 0.10) ** 2
  for (let i = 0; i < pts.length - 1; i++) {
    if (distSq(px, py, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y) <= gt2) return true
  }
  return false
}

function createCloudPNG(size) {
  const rowSize = size * 4 + 1
  const raw = Buffer.alloc(rowSize * size)

  for (let y = 0; y < size; y++) {
    const row = y * rowSize
    raw[row] = 0
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0
      const n = 2
      for (let sy = 0; sy < n; sy++) {
        for (let sx = 0; sx < n; sx++) {
          const px = x + (sx + 0.5) / n
          const py = y + (sy + 0.5) / n
          if (isInLightning(px, py, size)) {
            r += BOLT_RGB.r; g += BOLT_RGB.g; b += BOLT_RGB.b; a += 255
          } else if (isInCloud(px, py, size)) {
            if (isNearBolt(px, py, size)) {
              const f = 0.3
              r += CLOUD_RGB.r * (1 - f) + BOLT_RGB.r * f
              g += CLOUD_RGB.g * (1 - f) + BOLT_RGB.g * f
              b += CLOUD_RGB.b * (1 - f) + BOLT_RGB.b * f
              a += 255
            } else {
              r += CLOUD_RGB.r; g += CLOUD_RGB.g; b += CLOUD_RGB.b; a += 255
            }
          }
        }
      }
      const p = row + 1 + x * 4
      const nn = n * n
      raw[p] = r / nn; raw[p + 1] = g / nn; raw[p + 2] = b / nn; raw[p + 3] = a / nn
    }
  }

  const compressed = deflateSync(raw)
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([sig, createChunk('IHDR', ihdr), createChunk('IDAT', compressed), createChunk('IEND', Buffer.alloc(0))])
}

mkdirSync(ICONS_DIR, { recursive: true })
writeFileSync(join(ICONS_DIR, 'icon-192.png'), createCloudPNG(192))
writeFileSync(join(ICONS_DIR, 'icon-512.png'), createCloudPNG(512))
writeFileSync(join(ICONS_DIR, 'apple-icon-180.png'), createCloudPNG(180))
console.log('Cloud + lightning icons generated')
