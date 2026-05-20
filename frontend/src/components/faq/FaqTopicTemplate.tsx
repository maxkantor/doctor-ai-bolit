import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { FaqTopicPageData } from '../../data/faqs'
import { getRelatedSymptomPages } from '../../data/symptomPages'
import { getGuidesBySlugs } from '../../data/guides'
import { getToolsBySlugs } from '../../data/tools'
import { SITE_ORIGIN } from '../../constants/siteOrigin'
import SEOHead from '../symptoms/SEOHead'
import Breadcrumbs from '../symptoms/Breadcrumbs'
import MedicalDisclaimerBox from '../symptoms/MedicalDisclaimerBox'
import SymptomCTA from '../symptoms/SymptomCTA'
import FAQSection from '../symptoms/FAQSection'
import RelatedSymptomsGrid from '../symptoms/RelatedSymptomsGrid'
import RelatedToolsGrid from '../symptoms/RelatedToolsGrid'
import TrustSignalsStrip from '../symptoms/TrustSignalsStrip'
import '../symptoms/SymptomsPages.css'

export default function FaqTopicTemplate({ data }: { data: FaqTopicPageData }) {
  const canonicalUrl = `${SITE_ORIGIN}${data.route}`

  const jsonLd = useMemo(() => {
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${SITE_ORIGIN}/faq` },
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
      { id: 'faqtopic-jsonld-breadcrumb', data: breadcrumb },
      { id: 'faqtopic-jsonld-faq', data: faqPage },
      { id: 'faqtopic-jsonld-webpage', data: webPage },
    ]
  }, [data, canonicalUrl])

  const symptoms = getRelatedSymptomPages(data.relatedSymptomSlugs)
  const guides = getGuidesBySlugs(data.relatedGuideSlugs)
  const tools = getToolsBySlugs(data.relatedToolSlugs)

  return (
    <>
      <SEOHead title={data.metaTitle} description={data.metaDescription} canonicalPath={data.route} jsonLd={jsonLd} />
      <article className="symptoms-page">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'FAQ', to: '/faq' }, { label: data.h1 }]} />
        <header className="symptoms-hero">
          <p className="section-kicker">FAQ</p>
          <h1>{data.h1}</h1>
          <p className="symptoms-hero-intro">{data.intro}</p>
          <SymptomCTA />
        </header>
        <MedicalDisclaimerBox />
        <TrustSignalsStrip />
        <FAQSection faqs={data.faqs} />
        <RelatedSymptomsGrid pages={symptoms} />
        {guides.length > 0 ? (
          <section className="symptom-content-card" aria-labelledby="faq-guides">
            <h2 id="faq-guides">Related guides</h2>
            <div className="related-symptoms-grid">
              {guides.map((g) => (
                <Link key={g.slug} to={g.route}>
                  {g.h1}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        <RelatedToolsGrid tools={tools} />
        <section className="symptom-content-card cta-band" aria-labelledby="faq-cta">
          <h2 id="faq-cta">Check symptoms privately</h2>
          <SymptomCTA />
        </section>
        <section className="symptom-content-card">
          <p>
            <Link to="/faq">All FAQ topics</Link>
            {' · '}
            <Link to="/symptoms">Symptoms</Link>
            {' · '}
            <Link to="/">Home</Link>
          </p>
        </section>
        <MedicalDisclaimerBox />
      </article>
    </>
  )
}
