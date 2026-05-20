import { Link } from 'react-router-dom'
import type { SymptomPageData } from '../../data/symptomPages'
import './SymptomsPages.css'

export default function RelatedSymptomsGrid({ pages }: { pages: SymptomPageData[] }) {
  if (!pages.length) return null
  return (
    <section className="symptom-content-card" aria-labelledby="related-heading">
      <h2 id="related-heading">Related symptoms</h2>
      <div className="related-symptoms-grid">
        {pages.map((p) => (
          <Link key={p.slug} to={p.route}>
            {p.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
