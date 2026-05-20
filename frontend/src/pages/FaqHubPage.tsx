import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FAQ_HUB, getAllFaqTopics } from '../data/faqs'
import { SITE_ORIGIN } from '../constants/siteOrigin'
import SEOHead from '../components/symptoms/SEOHead'
import Breadcrumbs from '../components/symptoms/Breadcrumbs'
import MedicalDisclaimerBox from '../components/symptoms/MedicalDisclaimerBox'
import SymptomCTA from '../components/symptoms/SymptomCTA'
import TrustSignalsStrip from '../components/symptoms/TrustSignalsStrip'
import '../components/symptoms/SymptomsPages.css'

export default function FaqHubPage() {
  const topics = getAllFaqTopics()

  const jsonLd = useMemo(
    () => [
      {
        id: 'faq-hub-breadcrumb',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${SITE_ORIGIN}/faq` },
          ],
        },
      },
      {
        id: 'faq-hub-webpage',
        data: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: FAQ_HUB.h1,
          description: FAQ_HUB.metaDescription,
          url: `${SITE_ORIGIN}/faq`,
          inLanguage: 'en-US',
        },
      },
    ],
    [],
  )

  return (
    <>
      <SEOHead title={FAQ_HUB.metaTitle} description={FAQ_HUB.metaDescription} canonicalPath="/faq" jsonLd={jsonLd} />
      <div className="symptoms-page">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]} />
        <header className="symptoms-hero">
          <p className="section-kicker">Transparency</p>
          <h1>{FAQ_HUB.h1}</h1>
          <p className="symptoms-hero-intro">{FAQ_HUB.metaDescription}</p>
          <SymptomCTA />
        </header>
        <MedicalDisclaimerBox />
        <TrustSignalsStrip />
        <section aria-labelledby="faq-topics">
          <h2 id="faq-topics" className="sr-only">
            FAQ topics
          </h2>
          <div className="symptom-hub-grid">
            {topics.map((t) => (
              <Link key={t.slug} to={t.route} className="symptom-hub-card">
                <h3>{t.h1}</h3>
                <p>{t.metaDescription}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="symptom-content-card" style={{ marginTop: '1rem' }}>
          <p>
            <Link to="/symptoms">Symptoms</Link>
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
