import { Link } from 'react-router-dom'
import type { SymptomPageData } from '../../data/symptomPages'
import './SymptomsPages.css'

function teaser(text: string, max = 130): string {
  const t = text.trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  const last = cut.lastIndexOf(' ')
  return `${cut.slice(0, last > 40 ? last : max).trim()}…`
}

/** Hub / grid card linking to a symptom SEO page */
export default function SymptomCard({ page }: { page: SymptomPageData }) {
  return (
    <Link to={page.route} className="symptom-hub-card">
      <h3>{page.label}</h3>
      <p>{teaser(page.intro)}</p>
    </Link>
  )
}
