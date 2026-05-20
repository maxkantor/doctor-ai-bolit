import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { SymptomPageData } from '../../data/symptomPages'
import { getRelatedSymptomPages } from '../../data/symptomPages'
import { getGuidesBySlugs } from '../../data/guides'
import { getToolsBySlugs } from '../../data/tools'
import { SITE_ORIGIN } from '../../constants/siteOrigin'
import SEOHead from './SEOHead'
import Breadcrumbs from './Breadcrumbs'
import MedicalDisclaimerBox from './MedicalDisclaimerBox'
import EmergencyWarningBox from './EmergencyWarningBox'
import SymptomCTA from './SymptomCTA'
import RelatedSymptomsGrid from './RelatedSymptomsGrid'
import RelatedGuidesGrid from './RelatedGuidesGrid'
import RelatedToolsGrid from './RelatedToolsGrid'
import TrustSignalsStrip from './TrustSignalsStrip'
import FAQSection from './FAQSection'
import './SymptomsPages.css'

type Props = { data: SymptomPageData }

export default function SymptomPageTemplate({ data }: Props) {
  const canonicalUrl = `${SITE_ORIGIN}${data.route}`

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
        {
          '@type': 'ListItem',
          position: 3,
          name: data.label,
          item: canonicalUrl,
        },
      ],
    }

    const faqPage = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }

    const medicalWebPage = {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: data.h1,
      description: data.metaDescription,
      url: canonicalUrl,
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
      { id: 'symptom-jsonld-breadcrumb', data: breadcrumb },
      { id: 'symptom-jsonld-faq', data: faqPage },
      { id: 'symptom-jsonld-medicalwebpage', data: medicalWebPage },
      { id: 'symptom-jsonld-webpage', data: webPage },
    ]
  }, [data, canonicalUrl])

  const relatedSymptoms = getRelatedSymptomPages(data.relatedSlugs)
  const relatedGuides = getGuidesBySlugs(data.relatedGuideSlugs)
  const relatedTools = getToolsBySlugs(data.relatedToolSlugs)

  return (
    <>
      <SEOHead
        title={data.metaTitle}
        description={data.metaDescription}
        canonicalPath={data.route}
        jsonLd={jsonLd}
      />
      <article className="symptoms-page">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Symptoms', to: '/symptoms' },
            { label: data.label },
          ]}
        />

        <header className="symptoms-hero">
          <h1>{data.h1}</h1>
          <p className="symptoms-hero-intro">{data.intro}</p>
          {data.introSecondary ? <p className="symptoms-hero-intro">{data.introSecondary}</p> : null}
          <SymptomCTA />
        </header>

        <MedicalDisclaimerBox />
        <EmergencyWarningBox items={data.emergencyWarnings} />
        <TrustSignalsStrip />

        <section className="symptom-content-card" aria-labelledby="meaning-heading">
          <h2 id="meaning-heading">What this symptom can mean</h2>
          <p>{data.whatItCanMean}</p>
          {data.deepDiveParagraphs.map((para) => (
            <p key={para.slice(0, 42)}>{para}</p>
          ))}
        </section>

        <section className="symptom-content-card" aria-labelledby="causes-heading">
          <h2 id="causes-heading">Common non-emergency causes</h2>
          <p>
            These are frequent topics in primary care and urgent care—not a complete list, and not specific to you without an
            exam.
          </p>
          <ul>
            {data.commonCauses.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="symptom-content-card" aria-labelledby="urgent-heading">
          <h2 id="urgent-heading">When to seek urgent help</h2>
          <ul>
            {data.whenToSeekUrgent.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
        </section>

        <RelatedSymptomsGrid pages={relatedSymptoms} />

        <section className="symptom-content-card" aria-labelledby="clinician-q-heading">
          <h2 id="clinician-q-heading">Questions clinicians may ask</h2>
          <p>Writing answers in your notes can make real-world visits feel less rushed.</p>
          <ul>
            {data.clinicianQuestions.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="symptom-content-card" aria-labelledby="track-heading">
          <h2 id="track-heading">What you can track at home</h2>
          <ul>
            {data.trackAtHome.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="symptom-content-card" aria-labelledby="watch-heading">
          <h2 id="watch-heading">Symptoms and patterns to watch</h2>
          <ul>
            {data.watchFor.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="symptom-content-card" aria-labelledby="steps-heading">
          <h2 id="steps-heading">Safe next steps to consider</h2>
          <ul>
            {data.safeNextSteps.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="symptom-content-card" aria-labelledby="ai-heading">
          <h2 id="ai-heading">How DoctorAIBolit can help</h2>
          <ul>
            {data.howAiCanHelp.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
        </section>

        <FAQSection faqs={data.faqs} />
        <RelatedGuidesGrid guides={relatedGuides} />
        <RelatedToolsGrid tools={relatedTools} />

        <section className="symptom-content-card cta-band" aria-labelledby="private-cta-heading">
          <h2 id="private-cta-heading">Check symptoms privately</h2>
          <p>
            When you’re stable and looking for calm, structured education, a private chat can help you rehearse your story and
            questions—without replacing a clinician.
          </p>
          <SymptomCTA />
        </section>

        <section className="symptom-content-card" aria-labelledby="explore-heading">
          <h2 id="explore-heading">Explore the health library</h2>
          <p>
            <Link to="/symptoms">Symptom hub</Link>
            {' · '}
            <Link to="/guides">Guides</Link>
            {' · '}
            <Link to="/tools">Tools</Link>
            {' · '}
            <Link to="/faq">FAQ</Link>
            {' · '}
            <Link to="/conditions">Symptom categories</Link>
            {' · '}
            <Link to="/">Home</Link>
          </p>
        </section>

        <MedicalDisclaimerBox />
        <TrustSignalsStrip />
      </article>
    </>
  )
}
