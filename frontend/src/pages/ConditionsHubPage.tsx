import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CONDITIONS_HUB, getAllConditions } from '../data/conditions'
import { SITE_ORIGIN } from '../constants/siteOrigin'
import SEOHead from '../components/symptoms/SEOHead'
import Breadcrumbs from '../components/symptoms/Breadcrumbs'
import MedicalDisclaimerBox from '../components/symptoms/MedicalDisclaimerBox'
import SymptomCTA from '../components/symptoms/SymptomCTA'
import TrustSignalsStrip from '../components/symptoms/TrustSignalsStrip'
import '../components/symptoms/SymptomsPages.css'

export default function ConditionsHubPage() {
  const cats = getAllConditions()

  const jsonLd = useMemo(
    () => [
      {
        id: 'conditions-hub-breadcrumb',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Symptom categories', item: `${SITE_ORIGIN}/conditions` },
          ],
        },
      },
      {
        id: 'conditions-hub-webpage',
        data: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: CONDITIONS_HUB.h1,
          description: CONDITIONS_HUB.metaDescription,
          url: `${SITE_ORIGIN}/conditions`,
          inLanguage: 'en-US',
        },
      },
    ],
    [],
  )

  return (
    <>
      <SEOHead
        title={CONDITIONS_HUB.metaTitle}
        description={CONDITIONS_HUB.metaDescription}
        canonicalPath="/conditions"
        jsonLd={jsonLd}
      />
      <div className="symptoms-page">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Symptom categories' }]} />
        <header className="symptoms-hero">
          <p className="section-kicker">Navigation</p>
          <h1>{CONDITIONS_HUB.h1}</h1>
          <p className="symptoms-hero-intro">{CONDITIONS_HUB.intro}</p>
          <SymptomCTA />
        </header>
        <MedicalDisclaimerBox />
        <TrustSignalsStrip />
        <section aria-labelledby="cond-list">
          <h2 id="cond-list" className="sr-only">
            Categories
          </h2>
          <div className="symptom-hub-grid">
            {cats.map((c) => (
              <Link key={c.slug} to={c.route} className="symptom-hub-card">
                <h3>{c.h1}</h3>
                <p>{c.metaDescription}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="symptom-content-card" style={{ marginTop: '1rem' }}>
          <p>
            <Link to="/symptoms">Full symptom hub</Link>
            {' · '}
            <Link to="/guides">Guides</Link>
            {' · '}
            <Link to="/tools">Tools</Link>
            {' · '}
            <Link to="/">Home</Link>
          </p>
        </section>
        <MedicalDisclaimerBox />
      </div>
    </>
  )
}
