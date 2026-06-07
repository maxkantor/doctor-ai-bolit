#!/usr/bin/env node
/**
 * Validates robots.txt and sitemap.xml before production build.
 * Run from frontend/: node scripts/validate-seo-files.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const robotsPath = path.join(publicDir, 'robots.txt')
const sitemapPath = path.join(publicDir, 'sitemap.xml')

const errors = []

if (!fs.existsSync(robotsPath)) {
  errors.push('robots.txt is missing from public/')
} else {
  const robots = fs.readFileSync(robotsPath, 'utf8')
  if (!/Sitemap:\s*https:\/\/doctoraibolit\.com\/sitemap\.xml/i.test(robots)) {
    errors.push('robots.txt must declare Sitemap: https://doctoraibolit.com/sitemap.xml')
  }
  if (!/Disallow:\s*\/admin\//i.test(robots)) {
    errors.push('robots.txt must Disallow: /admin/')
  }
  if (!/Allow:\s*\//i.test(robots)) {
    errors.push('robots.txt should include Allow: /')
  }
}

if (!fs.existsSync(sitemapPath)) {
  errors.push('sitemap.xml is missing — run node scripts/generate-sitemap.js')
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8')
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (locs.length < 40) {
    errors.push(`sitemap.xml has only ${locs.length} URLs (expected ≥40)`)
  }
  const bad = locs.filter((u) => !u.startsWith('https://doctoraibolit.com/'))
  if (bad.length) {
    errors.push(`sitemap.xml has non-production URLs: ${bad.slice(0, 3).join(', ')}`)
  }
  if (locs.includes('https://doctoraibolit.com/admin')) {
    errors.push('sitemap.xml must not list /admin')
  }
  const required = ['https://doctoraibolit.com/', 'https://doctoraibolit.com/symptoms', 'https://doctoraibolit.com/guides']
  for (const url of required) {
    if (!locs.includes(url)) errors.push(`sitemap.xml missing required URL: ${url}`)
  }
}

if (errors.length) {
  console.error('❌ SEO file validation failed:')
  errors.forEach((e) => console.error(`   - ${e}`))
  process.exit(1)
}

console.log('✅ robots.txt and sitemap.xml validated')
process.exit(0)
