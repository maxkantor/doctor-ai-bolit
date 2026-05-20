import type { SymptomFaq } from './symptomPages'

const f = (question: string, answer: string): SymptomFaq => ({ question, answer })

export const CONDITIONS_HUB = {
  route: '/conditions',
  h1: 'Browse Symptom Categories',
  metaTitle: 'Symptom Categories | Pain, Breathing, Skin & More | DoctorAIBolit',
  metaDescription:
    'Explore curated symptom categories for faster navigation—from pain and breathing to skin, stress, fatigue, and hydration—education only, with hub links and tools.',
  intro:
    'Categories are a navigation aid. They are not diagnoses. Use them to find guides you can read calmly on mobile, then continue with private chat if you want structured follow-up questions.',
}

export const CONDITION_SLUGS = ['pain', 'breathing', 'skin', 'stress', 'fatigue', 'hydration'] as const

export type ConditionSlug = (typeof CONDITION_SLUGS)[number]

export interface ConditionCategoryData {
  slug: ConditionSlug
  route: string
  h1: string
  metaTitle: string
  metaDescription: string
  intro: string
  symptomSlugs: string[]
  guideSlugs: string[]
  toolSlugs: string[]
  faqs: SymptomFaq[]
}

const PAGES: Record<ConditionSlug, ConditionCategoryData> = {
  pain: {
    slug: 'pain',
    route: '/conditions/pain',
    h1: 'Pain-Related Symptoms & Education',
    metaTitle: 'Symptom Category: Pain | DoctorAIBolit',
    metaDescription:
      'Educational hub links for chest pain and headache with guides on workout-related pain, warning signs, and reflection tools.',
    intro:
      'Pain is a signal, not a sentence. These entries focus on commonly searched pain experiences while emphasizing clinician follow-up for new, severe, or changing patterns.',
    symptomSlugs: ['chest-pain', 'headache'],
    guideSlugs: ['chest-pain-after-workout', 'headache-warning-signs', 'stress-vs-heart-problem'],
    toolSlugs: ['headache-pattern-guide', 'symptom-urgency-checker', 'stress-self-assessment'],
    faqs: [
      f(
        'When is pain an emergency?',
        'Sudden severe pain, pain with neurologic symptoms, or difficult breathing are examples where urgent evaluation is often appropriate—this FAQ cannot triage you.',
      ),
      f(
        'Can chat identify the exact cause?',
        'No. It can help you describe quality, timing, and triggers more clearly.',
      ),
    ],
  },
  breathing: {
    slug: 'breathing',
    route: '/conditions/breathing',
    h1: 'Breathing & Shortness of Breath Education',
    metaTitle: 'Symptom Category: Breathing | DoctorAIBolit',
    metaDescription:
      'Navigate shortness-of-breath education, exertional breathlessness guides, and conservative emergency framing.',
    intro:
      'Breathlessness ranges from deconditioning and anxiety-related patterns to serious cardiopulmonary issues; conservative evaluation is important when symptoms are out of proportion or new.',
    symptomSlugs: ['shortness-of-breath', 'chest-pain', 'anxiety-symptoms'],
    guideSlugs: ['shortness-of-breath-causes', 'when-to-go-to-er', 'anxiety-vs-panic-attack'],
    toolSlugs: ['symptom-urgency-checker', 'stress-self-assessment'],
    faqs: [
      f(
        'Is mild shortness of breath always anxiety?',
        'No. Context and risk factors matter—professional evaluation sorts likely contributors.',
      ),
    ],
  },
  skin: {
    slug: 'skin',
    route: '/conditions/skin',
    h1: 'Skin Changes, Rashes & When Details Matter',
    metaTitle: 'Symptom Category: Skin | DoctorAIBolit',
    metaDescription:
      'Education on rashes, associated systemic symptoms, and preparation for clinician photos and timelines.',
    intro:
      'Skin findings are visual. Online text cannot replace examination, but organized descriptions help clinicians use visit time well.',
    symptomSlugs: ['rash', 'dehydration', 'fatigue'],
    guideSlugs: ['signs-of-dehydration', 'when-to-go-to-er'],
    toolSlugs: ['hydration-checker', 'symptom-urgency-checker'],
    faqs: [
      f(
        'Should I send photos in chat?',
        'Follow product guidance and avoid sharing unnecessary identifying details.',
      ),
    ],
  },
  stress: {
    slug: 'stress',
    route: '/conditions/stress',
    h1: 'Stress, Anxiety-Like Symptoms & Nervous System Arousal',
    metaTitle: 'Symptom Category: Stress & Anxiety Education | DoctorAIBolit',
    metaDescription:
      'Crosslinks for anxiety symptoms, stress vs heart education, and private reflection tools.',
    intro:
      'Stress can mimic many medical issues—another reason calm language, boundaries, and clinician follow-up matter.',
    symptomSlugs: ['anxiety-symptoms', 'chest-pain', 'headache'],
    guideSlugs: ['anxiety-vs-panic-attack', 'stress-vs-heart-problem', 'why-am-i-always-tired'],
    toolSlugs: ['stress-self-assessment', 'sleep-quality-checker'],
    faqs: [
      f(
        'Is stress “all in my head”?',
        'Stress impacts the body in measurable ways; that does not mean self-blame or skipping care.',
      ),
    ],
  },
  fatigue: {
    slug: 'fatigue',
    route: '/conditions/fatigue',
    h1: 'Fatigue, Low Energy & Sleep-Related Patterns',
    metaTitle: 'Symptom Category: Fatigue | DoctorAIBolit',
    metaDescription:
      'Fatigue symptom hub links, tiredness guides, dehydration context, and sleep reflection tool.',
    intro:
      'Fatigue is common and multifactorial. These resources help you notice patterns worth mentioning to a clinician.',
    symptomSlugs: ['fatigue', 'dehydration', 'blood-pressure'],
    guideSlugs: ['why-am-i-always-tired', 'signs-of-dehydration', 'understanding-blood-pressure'],
    toolSlugs: ['sleep-quality-checker', 'hydration-checker'],
    faqs: [
      f(
        'Why include blood pressure in fatigue?',
        'Some cardiovascular issues present subtly; clinicians explore based on history—not because the internet said so.',
      ),
    ],
  },
  hydration: {
    slug: 'hydration',
    route: '/conditions/hydration',
    h1: 'Hydration, Electrolytes & Heat-Related Risk',
    metaTitle: 'Symptom Category: Hydration | DoctorAIBolit',
    metaDescription:
      'Dehydration education, dizziness crosslinks, and hydration reflection checklist tool.',
    intro:
      'Hydration intersects with headaches, dizziness, kidney risk, and heat illness—especially during training and acute illness.',
    symptomSlugs: ['dehydration', 'dizziness', 'headache'],
    guideSlugs: ['signs-of-dehydration', 'why-am-i-dizzy', 'headache-warning-signs'],
    toolSlugs: ['hydration-checker', 'symptom-urgency-checker'],
    faqs: [
      f(
        'Can I overhydrate?',
        'Rare but possible in some contexts; clinician guidance matters for endurance athletes and kidney conditions.',
      ),
    ],
  },
}

export function getConditionBySlug(slug: string): ConditionCategoryData | undefined {
  if (CONDITION_SLUGS.includes(slug as ConditionSlug)) return PAGES[slug as ConditionSlug]
  return undefined
}

export function getAllConditions(): ConditionCategoryData[] {
  return CONDITION_SLUGS.map((s) => PAGES[s])
}
