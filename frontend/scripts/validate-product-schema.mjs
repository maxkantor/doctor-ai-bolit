#!/usr/bin/env node
/**
 * Validates that index.html Product JSON-LD includes crawlable HTTPS image URL(s).
 * Run: node scripts/validate-product-schema.mjs (from frontend/)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const indexPath = path.join(__dirname, '..', 'index.html')

const html = fs.readFileSync(indexPath, 'utf8')

const blocks = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)].map((m) => m[1])
let product = null
for (const raw of blocks) {
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.['@type'] === 'Product') {
      product = parsed
      break
    }
  } catch {
    // skip non-json or fragments
  }
}

if (!product) {
  console.error('❌ No Product schema block found in index.html')
  process.exit(1)
}

const imgs = []
if (!product.image) {
  console.error('❌ Product schema is missing "image"')
  process.exit(1)
}

if (typeof product.image === 'string') {
  imgs.push({ url: product.image })
} else if (Array.isArray(product.image)) {
  for (const item of product.image) {
    if (typeof item === 'string') imgs.push({ url: item })
    else if (item && typeof item.url === 'string') imgs.push({ url: item.url, width: item.width, height: item.height })
  }
} else if (typeof product.image === 'object' && product.image.url) {
  imgs.push({ url: product.image.url, width: product.image.width, height: product.image.height })
}

if (imgs.length === 0) {
  console.error('❌ Could not derive any image URLs from Product.image')
  process.exit(1)
}

for (const { url, width, height } of imgs) {
  if (!url.startsWith('https://')) {
    console.error(`❌ Image URL must be absolute HTTPS: ${url}`)
    process.exit(1)
  }
}

const primary = imgs[0]
if (typeof primary.width === 'number' && primary.width < 1200) {
  console.error(`❌ Primary product image width should be ≥1200 (got ${primary.width})`)
  process.exit(1)
}
if (typeof primary.height === 'number' && primary.height < 630) {
  console.error(`❌ Primary product image height should be ≥630 (got ${primary.height})`)
  process.exit(1)
}

console.log('✅ Product schema has valid https image URL(s):')
imgs.forEach((i, ix) =>
  console.log(`   ${ix + 1}. ${i.url}${i.width ? ` (${i.width}×${i.height ?? '?'})` : ''}`),
)
process.exit(0)
