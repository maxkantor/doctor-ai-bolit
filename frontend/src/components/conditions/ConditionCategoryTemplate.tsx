import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { ConditionCategoryData } from '../../data/conditions'
import { getRelatedSymptomPages } from '../../data/symptomPages'
import { getGuidesBySlugs } from '../../data/guides'
import { getToolsBySlugs } from '../../data/tools'
import { SITE_ORIGIN } from '../../constants/siteOrigin'
import SEOHead from '../symptoms/SEOHead'
import Breadcrumbs from '../symptoms/Breadcrumbs'
import MedicalDisclaimerBox from '../symptoms/MedicalDisclaimerBox'
import SymptomCTA from '../symptoms/SymptomCTA'
import FAQSection from '../symptoms/FAQSection'
import TrustSignalsStrip from '../symptoms/TrustSignalsStrip'
import '../symptoms/SymptomsPages.css'

export default function ConditionCategoryTemplate({ data }: { data: ConditionCategoryData }) {
  const canonicalUrl = `${SITE_ORIGIN}${data.route}`

  const jsonLd = useMemo(() => {
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Categories', item: `${SITE_ORIGIN}/conditions` },
        { '@type': 'ListItem', position: 3, name: data.h1, item: canonicalUrl },
      ],
    }
    const faqPage = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    }
    const webPage = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.h1,
      description: data.metaDescription,
      url: canonicalUrl,
      inLanguage: 'en-US',
    }
    return [
      { id: `cond-jsonld-breadcrumb-${data.slug}`, data: breadcrumb },
      { id: `cond-jsonld-faq-${data.slug}`, data: faqPage },
      { id: `cond-jsonld-webpage-${data.slug}`, data: webPage },
    ]
  }, [data, canonicalUrl])

  const symptoms = getRelatedSymptomPages(data.symptomSlugs)
  const guides = getGuidesBySlugs(data.guideSlugs)
  const tools = getToolsBySlugs(data.toolSlugs)

  return (
    <>
      <SEOHead title={data.metaTitle} description={data.metaDescription} canonicalPath={data.route} jsonLd={jsonLd} />
      <article className="symptoms-page">
        <Breadcrumbs
          items={[{ label: 'Home', to: '/' }, { label: 'Symptom categories', to: '/conditions' }, { label: data.h1 }]}
        />
        <header className="symptoms-hero">
          <p className="section-kicker">Category</p>
          <h1>{data.h1}</h1>
          <p className="symptoms-hero-intro">{data.intro}</p>
          <SymptomCTA />
        </header>
        <MedicalDisclaimerBox />
        <TrustSignalsStrip />

        <section className="symptom-content-card" aria-labelledby="cat-symptoms">
          <h2 id="cat-symptoms">Symptom guides</h2>
          <div className="related-symptoms-grid">
            {symptoms.map((s) => (
              <Link key={s.slug} to={s.route}>
                {s.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="symptom-content-card" aria-labelledby="cat-guides">
          <h2 id="cat-guides">Related guides</h2>
          <div className="related-symptoms-grid">
            {guides.map((g) => (
              <Link key={g.slug} to={g.route}>
                {g.h1}
              </Link>
            ))}
          </div>
        </section>

        <section className="symptom-content-card" aria-labelledby="cat-tools">
          <h2 id="cat-tools">Related tools</h2>
          <div className="related-symptoms-grid">
            {tools.map((t) => (
              <Link key={t.slug} to={t.route}>
                {t.label}
              </Link>
            ))}
          </div>
        </section>

        <FAQSection faqs={data.faqs} />

        <section className="symptom-content-card cta-band">
          <h2>Check symptoms privately</h2>
          <SymptomCTA />
        </section>

        <section className="symptom-content-card">
          <p>
            <Link to="/conditions">All categories</Link>
            {' · '}
            <Link to="/symptoms">Symptom hub</Link>
            {' · '}
            <Link to="/">Home</Link>
          </p>
        </section>
        <MedicalDisclaimerBox />
      </article>
    </>
  )
}
