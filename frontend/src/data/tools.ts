import type { SymptomFaq } from './symptomPages'

const f = (question: string, answer: string): SymptomFaq => ({ question, answer })

export const TOOLS_HUB = {
  route: '/tools',
  h1: 'Free Health Tools (Educational)',
  metaTitle: 'Free Health Tools | Hydration, Stress, Sleep & More | DoctorAIBolit',
  metaDescription:
    'Lightweight, privacy-first educational tools to reflect on hydration, stress, sleep, symptom urgency patterns, and more. Not medical advice—explore guides and chat privately when you are stable.',
}

export const TOOL_SLUGS = [
  'hydration-checker',
  'stress-self-assessment',
  'blood-pressure-guide',
  'headache-pattern-guide',
  'symptom-urgency-checker',
  'sleep-quality-checker',
] as const

export type ToolSlug = (typeof TOOL_SLUGS)[number]

export interface ToolPageData {
  slug: ToolSlug
  label: string
  route: string
  h1: string
  metaTitle: string
  metaDescription: string
  intro: string
  educationalNotice: string
  faqs: SymptomFaq[]
  relatedSymptomSlugs: string[]
  relatedGuideSlugs: string[]
}

const PAGES: Record<ToolSlug, Omit<ToolPageData, never>> = {
  'hydration-checker': {
    slug: 'hydration-checker',
    label: 'Hydration Checker',
    route: '/tools/hydration-checker',
    h1: 'Hydration Reflection Tool (Educational)',
    metaTitle: 'Hydration Checker (Educational) | DoctorAIBolit',
    metaDescription:
      'A simple educational checklist to reflect on fluid intake, urine color patterns, and context like heat exposure. Pair with our dehydration guide and private symptom chat—not a medical test.',
    intro:
      'Hydration needs vary by body size, activity, climate, medications, and illness. This page offers a calm, practical reflection you can use between visits—never a substitute for clinician guidance if you feel unwell.',
    educationalNotice:
      'This tool does not measure your hydration status. It summarizes common educational checkpoints people discuss with clinicians. If you have confusion, fainting, very low urine output, or can’t keep fluids down, seek urgent care.',
    faqs: [
      f(
        'Is urine color a reliable hydration test?',
        'It can be one clue among many, but medications, vitamins, and kidney issues can change urine color. Use the pattern as a conversation starter with a clinician—not a verdict.',
      ),
      f(
        'How much water should everyone drink?',
        'There is no single number that fits every person. Clinicians often tailor advice to age, kidney function, heart conditions, pregnancy, and activity level.',
      ),
      f(
        'Can I use this during a stomach bug?',
        'If you can’t retain fluids, feel very weak, or your symptoms are escalating, prioritize real-world care. This page is for stable, educational planning.',
      ),
      f(
        'Does DoctorAIBolit diagnose dehydration?',
        'No. The assistant provides educational language to help you describe what you noticed, not a diagnosis.',
      ),
    ],
    relatedSymptomSlugs: ['dehydration', 'dizziness', 'fatigue', 'headache'],
    relatedGuideSlugs: ['signs-of-dehydration', 'why-am-i-dizzy', 'headache-warning-signs'],
  },
  'stress-self-assessment': {
    slug: 'stress-self-assessment',
    label: 'Stress Self‑Assessment',
    route: '/tools/stress-self-assessment',
    h1: 'Stress Load Reflection (Educational)',
    metaTitle: 'Stress Self‑Assessment (Educational) | DoctorAIBolit',
    metaDescription:
      'A brief educational self‑reflection on sleep, tension, worry, focus, and recovery—helpful for organizing what to mention to a clinician or in private chat. Not a clinical anxiety or depression screening.',
    intro:
      'Stress shows up in the body and the mind. This reflection helps you notice patterns you might want to discuss professionally—especially if symptoms are new, severe, or affecting daily life.',
    educationalNotice:
      'This is not a validated mental health questionnaire and does not output a diagnosis. If you feel unsafe, in crisis, or your symptoms are overwhelming, use appropriate crisis resources and professional care.',
    faqs: [
      f(
        'Is a higher score “bad”?',
        'The score is an educational grouping only. Many people fluctuate week to week. Trends and context matter more than one number.',
      ),
      f(
        'Can stress mimic heart problems?',
        'Sometimes stress and panic can cause sensations that feel cardiovascular. New, exertional, or severe chest symptoms still deserve timely medical evaluation—see our educational guides.',
      ),
      f(
        'Should I share results with my clinician?',
        'You can use your notes as a memory aid. Clinicians still need their own assessment for diagnosis and treatment decisions.',
      ),
      f(
        'What if I’m having panic attacks?',
        'Read our anxiety vs panic attack guide and consider professional evaluation—especially if episodes are frequent or disabling.',
      ),
    ],
    relatedSymptomSlugs: ['anxiety-symptoms', 'fatigue', 'headache', 'chest-pain'],
    relatedGuideSlugs: ['anxiety-vs-panic-attack', 'stress-vs-heart-problem', 'why-am-i-always-tired'],
  },
  'blood-pressure-guide': {
    slug: 'blood-pressure-guide',
    label: 'Blood Pressure Guide',
    route: '/tools/blood-pressure-guide',
    h1: 'Blood Pressure Education Checklist',
    metaTitle: 'Blood Pressure Educational Guide & Checklist | DoctorAIBolit',
    metaDescription:
      'Educational checklist on home monitoring habits, cuff fit, restful measurement posture, and what kinds of patterns clinicians find useful—paired with our blood pressure symptom guide.',
    intro:
      'Home blood pressure readings can be incredibly helpful when the technique is consistent. This page focuses on practical setup and tracking habits, not treatment targets—those are individualized.',
    educationalNotice:
      'DoctorAIBolit cannot interpret your readings as safe or unsafe. Very high readings with symptoms like chest pain, neurologic changes, or severe headache need urgent evaluation.',
    faqs: [
      f(
        'Do I need a home cuff?',
        'Not everyone does. If your clinician suggests tracking, a validated cuff with the right arm size is important for meaningful numbers.',
      ),
      f(
        'Why can my readings differ minute to minute?',
        'Stress, caffeine, pain, talking, a full bladder, arm position, and cuff fit can all shift results. Consistency matters.',
      ),
      f(
        'Should I measure both arms?',
        'Clinicians sometimes compare arms during initial evaluation. Follow your clinician’s instructions for ongoing home logs.',
      ),
      f(
        'Can I use wrist cuffs?',
        'Some devices are acceptable, but many people get less reliable wrist readings. When in doubt, ask a clinician what device class to use.',
      ),
    ],
    relatedSymptomSlugs: ['blood-pressure', 'headache', 'dizziness', 'chest-pain'],
    relatedGuideSlugs: ['understanding-blood-pressure', 'headache-warning-signs', 'when-to-go-to-er'],
  },
  'headache-pattern-guide': {
    slug: 'headache-pattern-guide',
    label: 'Headache Pattern Guide',
    route: '/tools/headache-pattern-guide',
    h1: 'Headache Pattern Explorer (Educational)',
    metaTitle: 'Headache Pattern Guide (Educational) | DoctorAIBolit',
    metaDescription:
      'Tap through common headache patterns in plain language—triggers, timing, and red-flag prompts—then link to warning-sign education and private chat to rehearse your story.',
    intro:
      'Headaches range from tension-type patterns to migraine features and urgent presentations. This explorer helps you describe timing and associated symptoms more clearly before a clinician visit.',
    educationalNotice:
      'Sudden “thunderclap” headache, new neurologic deficits, fever with stiff neck, or headache after head injury require emergency evaluation—do not use online tools to rule these out.',
    faqs: [
      f(
        'Can migraines be disabling but not dangerous?',
        'Some migraine attacks are extremely severe yet not an emergency—context matters. New patterns, focal neurologic symptoms, or “worst ever” headaches deserve urgent assessment.',
      ),
      f(
        'Does eye strain always cause headaches?',
        'Not always. Vision issues, dehydration, tension, and sinus inflammation can overlap. A careful history helps clinicians sort contributions.',
      ),
      f(
        'Should I keep a headache diary?',
        'Many clinicians find sleep, caffeine, menstruation, medications, and stress notes helpful. Track what you can sustain consistently.',
      ),
      f(
        'Can OTC pain medicine cause rebound headaches?',
        'Overuse of certain medications can contribute to headache patterns. Ask a clinician or pharmacist about safe limits for your situation.',
      ),
    ],
    relatedSymptomSlugs: ['headache', 'dizziness', 'dehydration', 'anxiety-symptoms'],
    relatedGuideSlugs: ['headache-warning-signs', 'why-am-i-dizzy', 'signs-of-dehydration'],
  },
  'symptom-urgency-checker': {
    slug: 'symptom-urgency-checker',
    label: 'Symptom Urgency Checker',
    route: '/tools/symptom-urgency-checker',
    h1: 'Symptom Urgency Reflection (Educational)',
    metaTitle: 'Symptom Urgency Educational Checker | DoctorAIBolit',
    metaDescription:
      'A calm educational flow that distinguishes common “prepare for a visit” situations from patterns often discussed as emergencies—paired with our urgent symptom education page.',
    intro:
      'People use the internet because care access varies and anxiety spikes at night. This flow is intentionally conservative: when unsure about severe symptoms, it points you toward emergency resources.',
    educationalNotice:
      'This is not a certified triage engine and cannot see you or measure vitals. It provides general education aligned with conservative safety messaging.',
    faqs: [
      f(
        'Why does it suggest emergency care for some answers?',
        'Public education tools should avoid minimizing possible emergencies. When features sound potentially severe, the safest message is to seek urgent evaluation.',
      ),
      f(
        'Can I use this for children?',
        'Pediatric red flags differ. Prefer clinician guidance and local urgent care protocols for infants and children with concerning symptoms.',
      ),
      f(
        'What if I can’t afford the ER?',
        'If you are stable enough to travel safely, urgent care or nurse lines may be options depending on your region. This site cannot route you to services.',
      ),
      f(
        'After I’m stable, can chat help?',
        'Yes—private chat can help you organize follow-up questions and understand terminology from paperwork.',
      ),
    ],
    relatedSymptomSlugs: ['urgent-symptom-checker', 'chest-pain', 'shortness-of-breath', 'dizziness'],
    relatedGuideSlugs: ['when-to-go-to-er', 'chest-pain-after-workout', 'shortness-of-breath-causes'],
  },
  'sleep-quality-checker': {
    slug: 'sleep-quality-checker',
    label: 'Sleep Quality Checker',
    route: '/tools/sleep-quality-checker',
    h1: 'Sleep Quality Reflection (Educational)',
    metaTitle: 'Sleep Quality Checker (Educational) | DoctorAIBolit',
    metaDescription:
      'Reflect on bedtime consistency, awakenings, daytime sleepiness, and wind‑down habits—useful context for fatigue and stress guides and private educational chat.',
    intro:
      'Sleep is foundational for mood, focus, pain tolerance, and blood pressure variability. This reflection highlights patterns many clinicians explore when fatigue overlaps with other symptoms.',
    educationalNotice:
      'Snoring with choking episodes, severe daytime sleepiness while driving, or insomnia with mood changes may need formal sleep or mental health evaluation.',
    faqs: [
      f(
        'Is this a sleep apnea test?',
        'No. Apnea diagnosis typically requires clinical assessment and often sleep studies for many people.',
      ),
      f(
        'Can poor sleep mimic anxiety?',
        'Sleep loss can amplify worry and physical tension. Clinicians often address both together.',
      ),
      f(
        'What about caffeine timing?',
        'Afternoon caffeine affects some people more than others. Experiment carefully and track symptoms.',
      ),
      f(
        'When should I see a clinician about fatigue?',
        'If fatigue persists for weeks, worsens, or comes with fever, weight change, or shortness of breath, schedule evaluation.',
      ),
    ],
    relatedSymptomSlugs: ['fatigue', 'anxiety-symptoms', 'headache', 'blood-pressure'],
    relatedGuideSlugs: ['why-am-i-always-tired', 'why-am-i-dizzy', 'anxiety-vs-panic-attack'],
  },
}

export function getToolBySlug(slug: string): ToolPageData | undefined {
  if (TOOL_SLUGS.includes(slug as ToolSlug)) return PAGES[slug as ToolSlug]
  return undefined
}

export function getAllToolPages(): ToolPageData[] {
  return TOOL_SLUGS.map((s) => PAGES[s])
}

export function getToolsBySlugs(slugs: string[]): ToolPageData[] {
  return slugs.map((s) => getToolBySlug(s)).filter((t): t is ToolPageData => Boolean(t))
}
