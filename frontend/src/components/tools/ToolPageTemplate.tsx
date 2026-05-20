import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { ToolPageData } from '../../data/tools'
import type { ToolSlug } from '../../data/tools'
import { getRelatedSymptomPages } from '../../data/symptomPages'
import { getGuidesBySlugs } from '../../data/guides'
import { SITE_ORIGIN } from '../../constants/siteOrigin'
import SEOHead from '../symptoms/SEOHead'
import Breadcrumbs from '../symptoms/Breadcrumbs'
import MedicalDisclaimerBox from '../symptoms/MedicalDisclaimerBox'
import EmergencyWarningBox from '../symptoms/EmergencyWarningBox'
import SymptomCTA from '../symptoms/SymptomCTA'
import FAQSection from '../symptoms/FAQSection'
import RelatedSymptomsGrid from '../symptoms/RelatedSymptomsGrid'
import TrustSignalsStrip from '../symptoms/TrustSignalsStrip'
import ToolInteractive from './ToolInteractive'
import '../symptoms/SymptomsPages.css'

type Props = { data: ToolPageData }

export default function ToolPageTemplate({ data }: Props) {
  const canonicalUrl = `${SITE_ORIGIN}${data.route}`

  const jsonLd = useMemo(() => {
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_ORIGIN}/tools` },
        { '@type': 'ListItem', position: 3, name: data.label, item: canonicalUrl },
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

    const medicalWebPage = {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: data.h1,
      description: data.metaDescription,
      url: canonicalUrl,
      inLanguage: 'en-US',
    }

    return [
      { id: 'tool-jsonld-breadcrumb', data: breadcrumb },
      { id: 'tool-jsonld-faq', data: faqPage },
      { id: 'tool-jsonld-webpage', data: webPage },
      { id: 'tool-jsonld-medical', data: medicalWebPage },
    ]
  }, [data, canonicalUrl])

  const relatedSymptoms = getRelatedSymptomPages(data.relatedSymptomSlugs)
  const relatedGuides = getGuidesBySlugs(data.relatedGuideSlugs)

  return (
    <>
      <SEOHead title={data.metaTitle} description={data.metaDescription} canonicalPath={data.route} jsonLd={jsonLd} />
      <article className="symptoms-page">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Tools', to: '/tools' }, { label: data.label }]} />

        <header className="symptoms-hero">
          <p className="section-kicker">Tool</p>
          <h1>{data.h1}</h1>
          <p className="symptoms-hero-intro">{data.intro}</p>
          <SymptomCTA />
        </header>

        <MedicalDisclaimerBox />
        <EmergencyWarningBox items={[data.educationalNotice]} />
        <TrustSignalsStrip />

        <ToolInteractive slug={data.slug as ToolSlug} />

        <FAQSection faqs={data.faqs} />
        <RelatedSymptomsGrid pages={relatedSymptoms} />

        {relatedGuides.length > 0 ? (
          <section className="symptom-content-card" aria-labelledby="tool-guides">
            <h2 id="tool-guides">Related guides</h2>
            <div className="related-symptoms-grid">
              {relatedGuides.map((g) => (
                <Link key={g.slug} to={g.route}>
                  {g.h1}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="symptom-content-card cta-band" aria-labelledby="tool-cta">
          <h2 id="tool-cta">Continue in private chat</h2>
          <p>Turn your reflection into questions you can bring to a clinician—or explore calmly after you’re stable.</p>
          <SymptomCTA />
        </section>

        <section className="symptom-content-card" aria-labelledby="tool-explore">
          <h2 id="tool-explore">Explore more</h2>
          <p>
            <Link to="/tools">All tools</Link>
            {' · '}
            <Link to="/symptoms">Symptom hub</Link>
            {' · '}
            <Link to="/faq">FAQ</Link>
            {' · '}
            <Link to="/">Home</Link>
          </p>
        </section>

        <MedicalDisclaimerBox />
      </article>
    </>
  )
}
