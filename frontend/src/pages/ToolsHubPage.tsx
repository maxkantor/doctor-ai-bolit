import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TOOLS_HUB, getAllToolPages } from '../data/tools'
import { SITE_ORIGIN } from '../constants/siteOrigin'
import SEOHead from '../components/symptoms/SEOHead'
import Breadcrumbs from '../components/symptoms/Breadcrumbs'
import MedicalDisclaimerBox from '../components/symptoms/MedicalDisclaimerBox'
import SymptomCTA from '../components/symptoms/SymptomCTA'
import TrustSignalsStrip from '../components/symptoms/TrustSignalsStrip'
import '../components/symptoms/SymptomsPages.css'

export default function ToolsHubPage() {
  const tools = getAllToolPages()

  const jsonLd = useMemo(
    () => [
      {
        id: 'tools-hub-breadcrumb',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_ORIGIN}/tools` },
          ],
        },
      },
      {
        id: 'tools-hub-webpage',
        data: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: TOOLS_HUB.h1,
          description: TOOLS_HUB.metaDescription,
          url: `${SITE_ORIGIN}/tools`,
          inLanguage: 'en-US',
        },
      },
    ],
    [],
  )

  return (
    <>
      <SEOHead title={TOOLS_HUB.metaTitle} description={TOOLS_HUB.metaDescription} canonicalPath="/tools" jsonLd={jsonLd} />
      <div className="symptoms-page">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Tools' }]} />
        <header className="symptoms-hero">
          <p className="section-kicker">Interactive education</p>
          <h1>{TOOLS_HUB.h1}</h1>
          <p className="symptoms-hero-intro">
            Lightweight, mobile-friendly reflections you can pair with guides and private chat after you are stable—not a substitute
            for urgent or emergency care.
          </p>
          <SymptomCTA />
        </header>
        <MedicalDisclaimerBox />
        <TrustSignalsStrip />
        <section aria-labelledby="tools-list">
          <h2 id="tools-list" className="sr-only">
            Tool index
          </h2>
          <div className="symptom-hub-grid">
            {tools.map((t) => (
              <Link key={t.slug} to={t.route} className="symptom-hub-card">
                <h3>{t.label}</h3>
                <p>{t.intro}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="symptom-content-card" style={{ marginTop: '1rem' }}>
          <p>
            <Link to="/guides">Guides</Link>
            {' · '}
            <Link to="/symptoms">Symptom hub</Link>
            {' · '}
            <Link to="/faq">FAQ</Link>
            {' · '}
            <Link to="/">Home</Link>
          </p>
        </section>
        <MedicalDisclaimerBox />
      </div>
    </>
  )
}
