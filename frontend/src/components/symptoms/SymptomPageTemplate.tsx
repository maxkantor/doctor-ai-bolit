import { useMemo } from 'react'
import type { SymptomPageData } from '../../data/symptomPages'
import { getRelatedSymptomPages } from '../../data/symptomPages'
import { SITE_ORIGIN } from '../../constants/siteOrigin'
import SEOHead from './SEOHead'
import Breadcrumbs from './Breadcrumbs'
import MedicalDisclaimerBox from './MedicalDisclaimerBox'
import EmergencyWarningBox from './EmergencyWarningBox'
import SymptomCTA from './SymptomCTA'
import RelatedSymptomsGrid from './RelatedSymptomsGrid'
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

    return [
      { id: 'symptom-jsonld-breadcrumb', data: breadcrumb },
      { id: 'symptom-jsonld-faq', data: faqPage },
      { id: 'symptom-jsonld-medicalwebpage', data: medicalWebPage },
    ]
  }, [data, canonicalUrl])

  const related = getRelatedSymptomPages(data.relatedSlugs)

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
          <SymptomCTA />
        </header>

        <MedicalDisclaimerBox />
        <EmergencyWarningBox items={data.emergencyWarnings} />

        <section className="symptom-content-card" aria-labelledby="meaning-heading">
          <h2 id="meaning-heading">What this symptom can mean</h2>
          <p>{data.whatItCanMean}</p>
        </section>

        <section className="symptom-content-card" aria-labelledby="urgent-heading">
          <h2 id="urgent-heading">When to seek urgent help</h2>
          <ul>
            {data.whenToSeekUrgent.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="symptom-content-card" aria-labelledby="causes-heading">
          <h2 id="causes-heading">Common possible causes</h2>
          <ul>
            {data.commonCauses.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="symptom-content-card" aria-labelledby="watch-heading">
          <h2 id="watch-heading">Symptoms to watch</h2>
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
        <RelatedSymptomsGrid pages={related} />

        <MedicalDisclaimerBox />
        <SymptomCTA />
      </article>
    </>
  )
}
