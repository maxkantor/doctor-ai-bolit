import { Link } from 'react-router-dom'
import type { ToolPageData } from '../../data/tools'
import './SymptomsPages.css'

export default function RelatedToolsGrid({
  tools,
  id = 'related-tools-heading',
}: {
  tools: ToolPageData[]
  id?: string
}) {
  if (tools.length === 0) return null
  return (
    <section className="symptom-content-card" aria-labelledby={id}>
      <h2 id={id}>Related tools</h2>
      <p className="related-section-lede">
        Lightweight checklists and reflections you can use on your phone—paired with clinician follow-up when needed.
      </p>
      <div className="related-symptoms-grid">
        {tools.map((t) => (
          <Link key={t.slug} to={t.route}>
            {t.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
