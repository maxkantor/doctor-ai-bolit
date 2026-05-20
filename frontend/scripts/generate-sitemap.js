/**
 * Generates public/sitemap.xml before replace-domain.js rewrites the domain.
 * Keep route lists in sync with:
 *   src/data/symptomPages.ts (SYMPTOM_SLUGS)
 *   src/data/guides.ts (GUIDE_SLUGS)
 *   src/data/tools.ts (TOOL_SLUGS)
 *   src/data/faqs.ts (FAQ_TOPIC_SLUGS)
 *   src/data/conditions.ts (CONDITION_SLUGS)
 *   src/App.tsx (static routes; /admin/* excluded — use robots.txt Disallow)
 */
const fs = require('fs')
const path = require('path')

const DOMAIN = 'doctoraibolit.com'
const BASE = `https://${DOMAIN}`

const lastmod = new Date().toISOString().slice(0, 10)

const SYMPTOM_SLUGS = [
  'chest-pain',
  'fatigue',
  'rash',
  'dizziness',
  'dehydration',
  'headache',
  'shortness-of-breath',
  'anxiety-symptoms',
  'blood-pressure',
  'urgent-symptom-checker',
]

const GUIDE_SLUGS = [
  'chest-pain-after-workout',
  'stress-vs-heart-problem',
  'why-am-i-dizzy',
  'signs-of-dehydration',
  'why-am-i-always-tired',
  'when-to-go-to-er',
  'anxiety-vs-panic-attack',
  'headache-warning-signs',
  'understanding-blood-pressure',
  'shortness-of-breath-causes',
]

const TOOL_SLUGS = [
  'hydration-checker',
  'stress-self-assessment',
  'blood-pressure-guide',
  'headache-pattern-guide',
  'symptom-urgency-checker',
  'sleep-quality-checker',
]

const FAQ_TOPIC_SLUGS = [
  'getting-started',
  'emergency-and-chat',
  'privacy-and-data',
  'accuracy-and-education',
  'billing-and-credits',
]

const CONDITION_SLUGS = ['pain', 'breathing', 'skin', 'stress', 'fatigue', 'hydration']

/** @type {{ path: string; changefreq: string; priority: string }[]} */
const entries = []

function add(path, changefreq, priority) {
  const loc = path === '/' ? `${BASE}/` : `${BASE}${path}`
  entries.push({ path: loc, changefreq, priority })
}

// Core & utility (indexable marketing / product pages)
add('/', 'weekly', '1.0')
add('/chat', 'monthly', '0.8')
add('/contact', 'monthly', '0.6')
add('/privacy', 'monthly', '0.5')
add('/disclaimer', 'monthly', '0.5')
add('/youtube', 'monthly', '0.45')
add('/platform', 'monthly', '0.45')

// Symptom hub + pages
add('/symptoms', 'weekly', '0.85')
for (const slug of SYMPTOM_SLUGS) {
  add(`/symptoms/${slug}`, 'monthly', '0.75')
}

// Guides
add('/guides', 'weekly', '0.82')
for (const slug of GUIDE_SLUGS) {
  add(`/guides/${slug}`, 'monthly', '0.72')
}

// Tools
add('/tools', 'weekly', '0.8')
for (const slug of TOOL_SLUGS) {
  add(`/tools/${slug}`, 'monthly', '0.7')
}

// FAQ
add('/faq', 'monthly', '0.78')
for (const slug of FAQ_TOPIC_SLUGS) {
  add(`/faq/${slug}`, 'monthly', '0.65')
}

// Symptom categories
add('/conditions', 'monthly', '0.78')
for (const slug of CONDITION_SLUGS) {
  add(`/conditions/${slug}`, 'monthly', '0.68')
}

const urlset = entries
  .map(
    (e) => `  <url>
    <loc>${e.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlset}
</urlset>
`

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
fs.writeFileSync(outPath, xml, 'utf8')
console.log(
  `✅ Generated sitemap.xml (${entries.length} URLs, lastmod ${lastmod}) → ${path.relative(process.cwd(), outPath)}`,
)
