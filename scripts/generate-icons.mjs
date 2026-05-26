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

function createPNG(size, r, g, b) {
  const rowSize = size * 4 + 1
  const raw = Buffer.alloc(rowSize * size)
  const cx = size / 2
  const cy = size / 2
  const rx = size * 0.42
  const ry = size * 0.42

  for (let y = 0; y < size; y++) {
    const row = y * rowSize
    raw[row] = 0
    for (let x = 0; x < size; x++) {
      const dx = Math.abs(x - cx)
      const dy = Math.abs(y - cy)
      const inside = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1
      const p = row + 1 + x * 4
      if (inside) {
        raw[p] = r
        raw[p + 1] = g
        raw[p + 2] = b
        raw[p + 3] = 255
      } else {
        raw[p] = 0
        raw[p + 1] = 0
        raw[p + 2] = 0
        raw[p + 3] = 0
      }
    }
  }

  const compressed = deflateSync(raw)
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([sig, createChunk('IHDR', ihdr), createChunk('IDAT', compressed), createChunk('IEND', Buffer.alloc(0))])
}

mkdirSync(ICONS_DIR, { recursive: true })

writeFileSync(join(ICONS_DIR, 'icon-192.png'), createPNG(192, 59, 130, 246))
writeFileSync(join(ICONS_DIR, 'icon-512.png'), createPNG(512, 59, 130, 246))
writeFileSync(join(ICONS_DIR, 'apple-icon-180.png'), createPNG(180, 59, 130, 246))

console.log('PWA icons generated successfully')
