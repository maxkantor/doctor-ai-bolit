import type { SymptomFaq } from './symptomPages'

const f = (question: string, answer: string): SymptomFaq => ({ question, answer })

export const FAQ_HUB = {
  route: '/faq',
  h1: 'Frequently Asked Questions',
  metaTitle: 'FAQ | DoctorAIBolit Health Education & Privacy',
  metaDescription:
    'Answers about educational boundaries, emergency care, privacy, and credits—plus deep links to symptoms, guides, and tools.',
}

export const FAQ_TOPIC_SLUGS = [
  'getting-started',
  'emergency-and-chat',
  'privacy-and-data',
  'accuracy-and-education',
  'billing-and-credits',
] as const

export type FaqTopicSlug = (typeof FAQ_TOPIC_SLUGS)[number]

export interface FaqTopicPageData {
  slug: FaqTopicSlug
  route: string
  h1: string
  metaTitle: string
  metaDescription: string
  intro: string
  faqs: SymptomFaq[]
  relatedSymptomSlugs: string[]
  relatedGuideSlugs: string[]
  relatedToolSlugs: string[]
}

const PAGES: Record<FaqTopicSlug, FaqTopicPageData> = {
  'getting-started': {
    slug: 'getting-started',
    route: '/faq/getting-started',
    h1: 'Getting Started with DoctorAIBolit',
    metaTitle: 'FAQ: Getting Started | DoctorAIBolit',
    metaDescription:
      'How to use DoctorAIBolit as educational support: starting a chat, no signup flow, and how symptom pages and tools connect to private guidance.',
    intro:
      'DoctorAIBolit is designed as a premium-feeling, privacy-conscious way to explore symptom education and rehearse questions—not to replace clinicians or crisis services.',
    faqs: [
      f(
        'Do I need an account to begin?',
        'You can start with a browser-based visitor ID for chat continuity. Educational hub pages are publicly readable.',
      ),
      f(
        'Is this a symptom checker?',
        'Hub pages and tools offer education and reflection. Chat offers guided conversation—still not a medical diagnosis.',
      ),
      f(
        'Where should I begin if I feel scared?',
        'If you might be having an emergency, contact emergency services. After you are safe, educational pages can help you prepare follow-up questions.',
      ),
      f(
        'Can I read guides without chatting?',
        'Yes. Guides and symptom articles are meant to be shareable and easy to skim on mobile.',
      ),
    ],
    relatedSymptomSlugs: ['urgent-symptom-checker', 'chest-pain', 'anxiety-symptoms'],
    relatedGuideSlugs: ['when-to-go-to-er', 'anxiety-vs-panic-attack'],
    relatedToolSlugs: ['symptom-urgency-checker'],
  },
  'emergency-and-chat': {
    slug: 'emergency-and-chat',
    route: '/faq/emergency-and-chat',
    h1: 'Emergencies, Urgent Care, and Educational Chat',
    metaTitle: 'FAQ: Emergency Care & Chat Boundaries | DoctorAIBolit',
    metaDescription:
      'What DoctorAIBolit cannot do in emergencies, why response time is not guaranteed, and how to use education responsibly alongside real-world care.',
    intro:
      'Educational chat can reduce anxiety after stability returns—or help you organize your narrative before routine visits. It cannot observe you, measure oxygen, or dispatch help.',
    faqs: [
      f(
        'Can I use chat instead of calling emergency services?',
        'No. For suspected emergencies, use appropriate urgent channels immediately.',
      ),
      f(
        'Why emphasize boundaries so often?',
        'Clear boundaries protect users and align with how licensed care works in real life.',
      ),
      f(
        'Can chat give triage instructions?',
        'It should not replace professional triage tools and clinician judgment.',
      ),
      f(
        'What if my symptoms feel worse while reading?',
        'Stop and seek real-world evaluation if symptoms escalate.',
      ),
    ],
    relatedSymptomSlugs: ['urgent-symptom-checker', 'shortness-of-breath', 'chest-pain'],
    relatedGuideSlugs: ['when-to-go-to-er', 'headache-warning-signs'],
    relatedToolSlugs: ['symptom-urgency-checker'],
  },
  'privacy-and-data': {
    slug: 'privacy-and-data',
    route: '/faq/privacy-and-data',
    h1: 'Privacy, Data, and Confidentiality Expectations',
    metaTitle: 'FAQ: Privacy & Data | DoctorAIBolit',
    metaDescription:
      'How to think about privacy on educational sites: what to avoid pasting into chat, visitor IDs, and where to read formal policies.',
    intro:
      'Privacy-first design means minimizing unnecessary personal data and being transparent about limitations. Still, no web app is a HIPAA-covered telemedicine visit unless explicitly provided as such.',
    faqs: [
      f(
        'Should I paste my full medical record into chat?',
        'Only share what you need for your educational question; avoid highly sensitive identifiers when possible.',
      ),
      f(
        'Are chats medical records?',
        'Treat chat content as personal information you control—and read our Privacy Policy for specifics.',
      ),
      f(
        'Can I delete history?',
        'Product capabilities may evolve; follow in-app flows and policy pages for the latest options.',
      ),
      f(
        'Do you sell my symptoms to advertisers?',
        'Our positioning is education and support; review policies for formal commitments.',
      ),
    ],
    relatedSymptomSlugs: ['anxiety-symptoms', 'rash'],
    relatedGuideSlugs: ['anxiety-vs-panic-attack'],
    relatedToolSlugs: ['stress-self-assessment'],
  },
  'accuracy-and-education': {
    slug: 'accuracy-and-education',
    route: '/faq/accuracy-and-education',
    h1: 'Accuracy, Education, and What “Not Diagnosis” Means',
    metaTitle: 'FAQ: Educational Accuracy | DoctorAIBolit',
    metaDescription:
      'How large language models fit into health education, why uncertainty is normal, and how to cross-check with clinicians.',
    intro:
      'Medical knowledge changes; individual contexts differ. Responsible health education acknowledges uncertainty and encourages professional follow-up for decisions that affect safety.',
    faqs: [
      f(
        'Why can’t you just tell me what I have?',
        'Diagnosis requires individualized evaluation. Online education can list possibilities and help you prepare questions—not conclude.',
      ),
      f(
        'How do I spot unreliable health content?',
        'Be wary of certainty, miracle claims, and vague authorship. Prefer transparent disclaimers and clinician follow-up prompts.',
      ),
      f(
        'Do symptom pages replace medical advice?',
        'No. They supplement literacy and organization.',
      ),
    ],
    relatedSymptomSlugs: ['headache', 'blood-pressure', 'fatigue'],
    relatedGuideSlugs: ['understanding-blood-pressure', 'headache-warning-signs'],
    relatedToolSlugs: ['headache-pattern-guide', 'blood-pressure-guide'],
  },
  'billing-and-credits': {
    slug: 'billing-and-credits',
    route: '/faq/billing-and-credits',
    h1: 'Billing, Credits, and Continuing Conversations',
    metaTitle: 'FAQ: Billing & Credits | DoctorAIBolit',
    metaDescription:
      'Educational FAQ on free message limits, purchasing credits thoughtfully, and Stripe checkout basics—without replacing support channels.',
    intro:
      'Credits help sustain high-quality models and keep the service available. Purchasing should feel straightforward and never pressure you to skip emergency care.',
    faqs: [
      f(
        'What does paying for messages support?',
        'Operational costs, model usage, and ongoing improvements to safety UX and education pages.',
      ),
      f(
        'If checkout fails, what should I do?',
        'Retry after confirming card permissions; contact support if issues persist.',
      ),
      f(
        'Will payment affect medical advice quality?',
        'Educational boundaries are the same regardless of purchase; payment changes capacity to continue conversations.',
      ),
    ],
    relatedSymptomSlugs: ['fatigue', 'anxiety-symptoms'],
    relatedGuideSlugs: ['why-am-i-always-tired'],
    relatedToolSlugs: ['sleep-quality-checker'],
  },
}

export function getFaqTopicBySlug(slug: string): FaqTopicPageData | undefined {
  if (FAQ_TOPIC_SLUGS.includes(slug as FaqTopicSlug)) return PAGES[slug as FaqTopicSlug]
  return undefined
}

export function getAllFaqTopics(): FaqTopicPageData[] {
  return FAQ_TOPIC_SLUGS.map((s) => PAGES[s])
}
