import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { GUIDES_HUB, getAllGuidePages } from '../data/guides'
import { SITE_ORIGIN } from '../constants/siteOrigin'
import SEOHead from '../components/symptoms/SEOHead'
import Breadcrumbs from '../components/symptoms/Breadcrumbs'
import MedicalDisclaimerBox from '../components/symptoms/MedicalDisclaimerBox'
import SymptomCTA from '../components/symptoms/SymptomCTA'
import TrustSignalsStrip from '../components/symptoms/TrustSignalsStrip'
import '../components/symptoms/SymptomsPages.css'

export default function GuidesHubPage() {
  const guides = getAllGuidePages()

  const jsonLd = useMemo(
    () => [
      {
        id: 'guides-hub-breadcrumb',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_ORIGIN}/guides` },
          ],
        },
      },
      {
        id: 'guides-hub-webpage',
        data: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: GUIDES_HUB.h1,
          description: GUIDES_HUB.metaDescription,
          url: `${SITE_ORIGIN}/guides`,
          inLanguage: 'en-US',
        },
      },
    ],
    [],
  )

  return (
    <>
      <SEOHead title={GUIDES_HUB.metaTitle} description={GUIDES_HUB.metaDescription} canonicalPath="/guides" jsonLd={jsonLd} />
      <div className="symptoms-page">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Guides' }]} />
        <header className="symptoms-hero">
          <p className="section-kicker">Education library</p>
          <h1>{GUIDES_HUB.h1}</h1>
          <p className="symptoms-hero-intro">{GUIDES_HUB.intro}</p>
          <SymptomCTA />
        </header>
        <MedicalDisclaimerBox />
        <TrustSignalsStrip />
        <section aria-labelledby="guides-list">
          <h2 id="guides-list" className="sr-only">
            Guide index
          </h2>
          <div className="symptom-hub-grid">
            {guides.map((g) => (
              <Link key={g.slug} to={g.route} className="symptom-hub-card">
                <h3>{g.h1}</h3>
                <p>{g.metaDescription}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="symptom-content-card" style={{ marginTop: '1rem' }}>
          <p>
            <Link to="/symptoms">Symptom hub</Link>
            {' · '}
            <Link to="/tools">Tools</Link>
            {' · '}
            <Link to="/faq">FAQ</Link>
            {' · '}
            <Link to="/conditions">Categories</Link>
          </p>
        </section>
        <MedicalDisclaimerBox />
      </div>
    </>
  )
}
