import { useMemo } from 'react'
import { SYMPTOMS_HUB, getAllSymptomPages } from '../data/symptomPages'
import { SITE_ORIGIN } from '../constants/siteOrigin'
import SEOHead from '../components/symptoms/SEOHead'
import Breadcrumbs from '../components/symptoms/Breadcrumbs'
import MedicalDisclaimerBox from '../components/symptoms/MedicalDisclaimerBox'
import SymptomCTA from '../components/symptoms/SymptomCTA'
import SymptomCard from '../components/symptoms/SymptomCard'
import '../components/symptoms/SymptomsPages.css'

export default function SymptomsHubPage() {
  const pages = getAllSymptomPages()

  const jsonLd = useMemo(() => {
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_ORIGIN}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Symptoms',
          item: `${SITE_ORIGIN}/symptoms`,
        },
      ],
    }

    const webPage = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: SYMPTOMS_HUB.h1,
      description: SYMPTOMS_HUB.metaDescription,
      url: `${SITE_ORIGIN}/symptoms`,
      inLanguage: 'en-US',
    }

    return [
      { id: 'symptom-hub-jsonld-breadcrumb', data: breadcrumb },
      { id: 'symptom-hub-jsonld-webpage', data: webPage },
    ]
  }, [])

  return (
    <>
      <SEOHead
        title={SYMPTOMS_HUB.metaTitle}
        description={SYMPTOMS_HUB.metaDescription}
        canonicalPath="/symptoms"
        jsonLd={jsonLd}
      />
      <div className="symptoms-page">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Symptoms' }]} />

        <header className="symptoms-hero">
          <p className="section-kicker">Education only</p>
          <h1>{SYMPTOMS_HUB.h1}</h1>
          <p className="symptoms-hero-intro">{SYMPTOMS_HUB.intro}</p>
          <SymptomCTA />
        </header>

        <MedicalDisclaimerBox />

        <section aria-labelledby="guides-heading">
          <h2 id="guides-heading" className="sr-only">
            Symptom guides
          </h2>
          <div className="symptom-hub-grid">
            {pages.map((p) => (
              <SymptomCard key={p.slug} page={p} />
            ))}
          </div>
        </section>

        <MedicalDisclaimerBox />
      </div>
    </>
  )
}
