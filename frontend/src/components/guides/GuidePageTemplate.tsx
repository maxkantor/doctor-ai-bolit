import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { GuidePageData } from '../../data/guides'
import { getRelatedSymptomPages } from '../../data/symptomPages'
import { getToolsBySlugs } from '../../data/tools'
import { getGuidesBySlugs } from '../../data/guides'
import { SITE_ORIGIN } from '../../constants/siteOrigin'
import SEOHead from '../symptoms/SEOHead'
import Breadcrumbs from '../symptoms/Breadcrumbs'
import MedicalDisclaimerBox from '../symptoms/MedicalDisclaimerBox'
import EmergencyWarningBox from '../symptoms/EmergencyWarningBox'
import SymptomCTA from '../symptoms/SymptomCTA'
import FAQSection from '../symptoms/FAQSection'
import RelatedSymptomsGrid from '../symptoms/RelatedSymptomsGrid'
import RelatedToolsGrid from '../symptoms/RelatedToolsGrid'
import TrustSignalsStrip from '../symptoms/TrustSignalsStrip'
import '../symptoms/SymptomsPages.css'

type Props = { data: GuidePageData }

export default function GuidePageTemplate({ data }: Props) {
  const canonicalUrl = `${SITE_ORIGIN}${data.route}`

  const jsonLd = useMemo(() => {
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_ORIGIN}/guides` },
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

    const article = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.h1,
      description: data.metaDescription,
      mainEntityOfPage: canonicalUrl,
      inLanguage: 'en-US',
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
      { id: 'guide-jsonld-breadcrumb', data: breadcrumb },
      { id: 'guide-jsonld-faq', data: faqPage },
      { id: 'guide-jsonld-article', data: article },
      { id: 'guide-jsonld-webpage', data: webPage },
    ]
  }, [data, canonicalUrl])

  const relatedSymptoms = getRelatedSymptomPages(data.relatedSymptomSlugs)
  const relatedTools = getToolsBySlugs(data.relatedToolSlugs)
  const moreGuides = getGuidesBySlugs(data.relatedGuideSlugs)

  return (
    <>
      <SEOHead
        title={data.metaTitle}
        description={data.metaDescription}
        canonicalPath={data.route}
        ogType="article"
        jsonLd={jsonLd}
      />
      <article className="symptoms-page">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Guides', to: '/guides' }, { label: data.h1 }]} />

        <header className="symptoms-hero">
          <p className="section-kicker">Guide</p>
          <h1>{data.h1}</h1>
          <p className="symptoms-hero-intro">{data.intro}</p>
          <SymptomCTA />
        </header>

        <MedicalDisclaimerBox />
        <EmergencyWarningBox items={[data.emergencyNote]} />
        <TrustSignalsStrip />

        {data.sections.map((sec) => (
          <section key={sec.id} className="symptom-content-card" aria-labelledby={`${sec.id}-h`}>
            <h2 id={`${sec.id}-h`}>{sec.title}</h2>
            {sec.paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
            {sec.bullets?.length ? (
              <ul>
                {sec.bullets.map((b) => (
                  <li key={b.slice(0, 40)}>{b}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <FAQSection faqs={data.faqs} />
        <RelatedSymptomsGrid pages={relatedSymptoms} />
        <RelatedToolsGrid tools={relatedTools} />

        {moreGuides.length > 0 ? (
          <section className="symptom-content-card" aria-labelledby="more-guides-heading">
            <h2 id="more-guides-heading">Related guides</h2>
            <div className="related-symptoms-grid">
              {moreGuides.map((g) => (
                <Link key={g.slug} to={g.route}>
                  {g.h1}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="symptom-content-card cta-band" aria-labelledby="guide-cta">
          <h2 id="guide-cta">Check symptoms privately</h2>
          <p>Use chat to translate what you read into clear questions for a clinician—with calm pacing on mobile.</p>
          <SymptomCTA />
        </section>

        <section className="symptom-content-card" aria-labelledby="guide-explore">
          <h2 id="guide-explore">Explore more</h2>
          <p>
            <Link to="/symptoms">Symptom hub</Link>
            {' · '}
            <Link to="/guides">All guides</Link>
            {' · '}
            <Link to="/tools">Tools</Link>
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
