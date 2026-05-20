import { Link } from 'react-router-dom'
import type { GuidePageData } from '../../data/guides'
import './SymptomsPages.css'

export default function RelatedGuidesGrid({
  guides,
  id = 'related-guides-heading',
}: {
  guides: GuidePageData[]
  id?: string
}) {
  if (guides.length === 0) return null
  return (
    <section className="symptom-content-card" aria-labelledby={id}>
      <h2 id={id}>Related guides</h2>
      <p className="related-section-lede">
        Longer educational reads that connect to real-world care decisions—helpful context, not a diagnosis.
      </p>
      <div className="related-symptoms-grid">
        {guides.map((g) => (
          <Link key={g.slug} to={g.route}>
            {g.h1}
          </Link>
        ))}
      </div>
    </section>
  )
}
