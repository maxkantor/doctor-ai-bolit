import type { SymptomFaq } from './symptomPages'

const f = (question: string, answer: string): SymptomFaq => ({ question, answer })

export const GUIDES_HUB = {
  route: '/guides',
  h1: 'Health Guides for Everyday Questions',
  metaTitle: 'Health Guides | Education on Symptoms, Safety & Next Steps | DoctorAIBolit',
  metaDescription:
    'Calm, practical guides on chest pain after exercise, dizziness, dehydration, fatigue, ER decisions, anxiety vs panic, headaches, blood pressure, and shortness of breath—education only, with links to tools and private chat.',
}

export const GUIDE_SLUGS = [
  'chest-pain-after-workout',
  'stress-vs-heart-problem',
  'why-am-i-dizzy',
  'signs-of-dehydration',
  'why-am-i-always-tired',
  'when-to-go-to-er',
  'anxiety-vs-panic-attack',
  'headache-warning-signs',
  'understanding-blood-pressure',
  'shortness-of-breath-causes',
] as const

export type GuideSlug = (typeof GUIDE_SLUGS)[number]

export interface GuideSection {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export interface GuidePageData {
  slug: GuideSlug
  route: string
  h1: string
  metaTitle: string
  metaDescription: string
  intro: string
  emergencyNote: string
  sections: GuideSection[]
  faqs: SymptomFaq[]
  relatedSymptomSlugs: string[]
  relatedToolSlugs: string[]
  relatedGuideSlugs: string[]
}

const PAGES: Record<GuideSlug, GuidePageData> = {
  'chest-pain-after-workout': {
    slug: 'chest-pain-after-workout',
    route: '/guides/chest-pain-after-workout',
    h1: 'Chest Pain After a Workout: What People Commonly Discuss With Clinicians',
    metaTitle: 'Chest Pain After Workout (Educational) | DoctorAIBolit',
    metaDescription:
      'Educational guide on exertional chest discomfort: muscle strain patterns, breathing issues, and red flags that often prompt urgent evaluation—plus links to tools and private symptom chat.',
    intro:
      'A tight or sharp sensation in the chest after lifting, sprinting, or restarting exercise can be alarming even when the cause turns out to be non-dangerous. This guide helps you separate common, discussable patterns from symptoms that deserve prompt medical attention—without pretending to diagnose you from a webpage.',
    emergencyNote:
      'Seek emergency care for pressure-like chest pain with shortness of breath, fainting, cold sweat, pain spreading to jaw or arm, or pain that keeps escalating at rest—especially if new for you.',
    sections: [
      {
        id: 'context',
        title: 'Why timing matters more than intensity alone',
        paragraphs: [
          '“Chest pain” is a lay description that can mean rib muscle soreness, lung lining irritation, heart strain, reflux, anxiety-related tightness, or other issues. The same subjective sensation can have different implications depending on age, baseline fitness, recent illness, medications, and cardiovascular risk factors—topics a clinician explores in person.',
          'After workouts, many people notice pain that worsens with a deep breath, twisting, or pressing on a tender spot—patterns that often steer the conversation toward musculoskeletal causes, though overlapping issues still exist.',
        ],
      },
      {
        id: 'non-emergency',
        title: 'Common non-emergency patterns worth knowing (still mention to a clinician if new)',
        bullets: [
          'Delayed-onset muscle soreness with reproducible tenderness over ribs or pectoral muscles.',
          'Sharp “pinpoint” pain that changes when you change position after a strain.',
          'Upper respiratory infection recovery with cough-triggered chest wall soreness.',
          'Heartburn-like burning after heavy meals or late workouts paired with known reflux triggers.',
        ],
        paragraphs: [
          'Non-emergency does not mean you should ignore new symptoms forever—especially if this is your first episode, you have cardiac risk factors or you’re unsure whether the exertion “matches” the pain.',
        ],
      },
      {
        id: 'red-flags',
        title: 'Patterns that commonly lead clinicians to urgent testing',
        bullets: [
          'Chest pressure that builds with activity and eases with rest (exertional pattern).',
          'Associated faintness, palpitations that feel worse with exertion, or unusual fatigue out of proportion to your usual training.',
          'Symptoms after a viral illness when you’re considering return-to-exercise guidance.',
        ],
        paragraphs: [
          'These bullets are educational guardrails. Only a licensed clinician can decide what tests—if any—are appropriate after listening to your story and examining you.',
        ],
      },
      {
        id: 'prepare',
        title: 'How to prepare a useful story for a visit',
        paragraphs: [
          'Bring specifics: what exercise, what pace, warm-up status, hydration, caffeine, sleep, recent illness, and whether symptoms radiate. Note the duration, whether the pain is reproducible with palpation, and any associated shortness of breath or dizziness.',
          'If you use wearables, screenshots of heart rate trends can be helpful context—but devices are not diagnostic.',
        ],
      },
    ],
    faqs: [
      f(
        'If the pain goes away with rest, am I safe?',
        'Not necessarily. Some cardiac-related patterns improve with rest yet still warrant timely evaluation—especially if new or exertional.',
      ),
      f(
        'Should I take ibuprofen and keep training?',
        'Avoid self-managing potentially cardiac symptoms with painkillers to “power through.” If symptoms concern you, pause strenuous activity until a clinician guides you.',
      ),
      f(
        'Can dehydration cause chest discomfort?',
        'Sometimes people feel cramping, palpitations, or fatigue when dehydrated, but you shouldn’t assume dehydration explains significant chest symptoms.',
      ),
      f(
        'Can DoctorAIBolit tell me if it was my heart?',
        'No. Chat can help you organize details to discuss with a professional—not replace evaluation.',
      ),
    ],
    relatedSymptomSlugs: ['chest-pain', 'shortness-of-breath', 'dehydration', 'anxiety-symptoms'],
    relatedToolSlugs: ['symptom-urgency-checker', 'hydration-checker', 'stress-self-assessment'],
    relatedGuideSlugs: ['stress-vs-heart-problem', 'when-to-go-to-er', 'shortness-of-breath-causes'],
  },
  'stress-vs-heart-problem': {
    slug: 'stress-vs-heart-problem',
    route: '/guides/stress-vs-heart-problem',
    h1: 'Stress Sensations vs Heart-Related Symptoms: A Calm, Practical Frame',
    metaTitle: 'Stress vs Heart Symptoms (Educational) | DoctorAIBolit',
    metaDescription:
      'Educational framing for overlapping chest tightness, racing heart, and shortness of breath—how clinicians sort context, and when conservative urgent care messaging applies.',
    intro:
      'Anxiety and cardiac issues can both produce chest tightness, breathlessness, and a pounding heartbeat. The overlap is why “Dr. Google” spirals exist—and why responsible education emphasizes context, red flags, and professional assessment rather than certainty from a checklist.',
    emergencyNote:
      'Treat possible heart attack symptoms as an emergency until proven otherwise by appropriate care—especially with exertional pressure, fainting, or neurologic symptoms.',
    sections: [
      {
        id: 'overlap',
        title: 'Why the sensations overlap',
        paragraphs: [
          'Stress responses activate the sympathetic nervous system. That can feel like chest tightness, tingling, tingling hands, cold sweat, or a sense of doom. Heart and lung conditions can produce overlapping sensations—so symptoms alone are rarely sufficient for self-classification.',
          'Clinicians weigh timelines, risk factors, associated features, physical exam clues, and sometimes testing. Online content can’t replicate that evaluation.',
        ],
      },
      {
        id: 'clues',
        title: 'Useful clues people track (not rules)',
        bullets: [
          'Triggers: panic may spike during acute stress; cardiac symptoms may track with exertion—though exceptions exist.',
          'Reproducible chest wall tenderness suggests musculoskeletal contributors more often—still not definitive.',
          'Associated fever, cough, or pleuritic pain may steer toward respiratory causes—still needs clinician context.',
        ],
        paragraphs: [
          'Think of these as conversation starters, not a home diagnosis.',
        ],
      },
      {
        id: 'next-steps',
        title: 'Next steps if you’re unsure',
        paragraphs: [
          'If symptoms feel severe, escalating, or unfamiliar, choose the conservative route: emergency evaluation. If symptoms are mild and familiar in a known anxiety pattern, you may still benefit from clinician guidance—especially if the pattern is new or worsening.',
          'DoctorAIBolit can help you rehearse descriptions and questions once you’re in a stable moment—not during an emergency.',
        ],
      },
    ],
    faqs: [
      f(
        'Can panic attacks happen while I’m calm?',
        'Sometimes episodes surprise people without an obvious trigger. Unexpected symptoms still deserve appropriate medical consideration if they’re new or severe.',
      ),
      f(
        'Should I get a heart monitor for reassurance?',
        'Some clinicians use monitors for specific questions—but purchases shouldn’t replace evaluation when red flags exist.',
      ),
      f(
        'Does normal anxiety rule out heart disease?',
        'No. People can have both—and risk factors still matter.',
      ),
    ],
    relatedSymptomSlugs: ['anxiety-symptoms', 'chest-pain', 'shortness-of-breath', 'blood-pressure'],
    relatedToolSlugs: ['stress-self-assessment', 'symptom-urgency-checker', 'blood-pressure-guide'],
    relatedGuideSlugs: ['anxiety-vs-panic-attack', 'when-to-go-to-er', 'understanding-blood-pressure'],
  },
  'why-am-i-dizzy': {
    slug: 'why-am-i-dizzy',
    route: '/guides/why-am-i-dizzy',
    h1: 'Why Am I Dizzy? Common Categories Explained in Plain Language',
    metaTitle: 'Why Am I Dizzy? (Educational) | DoctorAIBolit',
    metaDescription:
      'Educational overview of lightheadedness vs vertigo, hydration and medication contributors, and urgent warning signs—links to dizziness symptom page and reflection tools.',
    intro:
      '“Dizzy” can mean faint feeling, spinning, imbalance, or brain fog. Sorting the story helps clinicians choose appropriate evaluation—especially because some causes are benign and others require urgent attention.',
    emergencyNote:
      'Seek emergency care for sudden severe imbalance, double vision, trouble speaking, one-sided weakness, chest pain, head injury, or thunderclap headache.',
    sections: [
      {
        id: 'types',
        title: 'Three everyday descriptions (oversimplified, but helpful)',
        paragraphs: [
          'Lightheadedness: feeling like you might pass out—often linked to blood pressure shifts, dehydration, illness, or prolonged standing.',
          'Vertigo: a spinning or motion sensation even when still—often discussed with inner-ear problems, though other causes exist.',
          'Disequilibrium: feeling unsteady on your feet—may relate to vision, nerves, joints, medications, or neurologic conditions.',
        ],
      },
      {
        id: 'common',
        title: 'Common contributors people discuss routinely',
        bullets: [
          'Viral illnesses with dehydration.',
          'Starting or changing blood pressure medications.',
          'Anxiety and hyperventilation patterns.',
          'Migraine-associated dizziness in people with headache history.',
        ],
        paragraphs: [
          'Frequency, duration, and triggers matter. Keep simple notes: time of day, meals, caffeine, hydration, recent infections, new drugs, and associated hearing changes or ear fullness.',
        ],
      },
    ],
    faqs: [
      f(
        'Should I drive while dizzy?',
        'If dizzy spells are unpredictable, avoid driving until a clinician clears you.',
      ),
      f(
        'Does ginger “cure” vertigo?',
        'Some people try home remedies, but persistent or severe vertigo deserves professional evaluation.',
      ),
    ],
    relatedSymptomSlugs: ['dizziness', 'dehydration', 'headache', 'anxiety-symptoms'],
    relatedToolSlugs: ['hydration-checker', 'headache-pattern-guide', 'symptom-urgency-checker'],
    relatedGuideSlugs: ['signs-of-dehydration', 'headache-warning-signs', 'when-to-go-to-er'],
  },
  'signs-of-dehydration': {
    slug: 'signs-of-dehydration',
    route: '/guides/signs-of-dehydration',
    h1: 'Signs of Dehydration: Practical Education (and What It Can’t Tell You Online)',
    metaTitle: 'Signs of Dehydration (Educational) | DoctorAIBolit',
    metaDescription:
      'Education on thirst, orthostatic symptoms, urine clues, and illness-related fluid loss—paired with hydration reflection and dehydration symptom guide.',
    intro:
      'Dehydration is not always obvious. Mild fluid deficits can cause headache, fatigue, dizziness on standing, and darker urine while you still feel “okay.” Severe dehydration overlaps with serious illness—especially when vomiting, diarrhea, fever, or inability to drink are involved.',
    emergencyNote:
      'Seek urgent care for confusion, minimal urine, very fast heart rate at rest with dizziness, severe abdominal pain, blood in stool, or inability to keep fluids down.',
    sections: [
      {
        id: 'clusters',
        title: 'Clusters people describe',
        bullets: [
          'Dry mouth and thirst with heat exposure or heavy sweating.',
          'Standing up quickly triggers darkness in vision briefly (orthostatic symptoms).',
          'Illness-related losses: vomiting/diarrhea/fever increase fluid needs.',
        ],
        paragraphs: [
          'Older adults and young children may show subtler signs, which is why conservative in-person guidance matters.',
        ],
      },
      {
        id: 'limits',
        title: 'What online education can’t measure',
        paragraphs: [
          'Websites can’t check orthostatic blood pressures, kidney function, electrolytes, or infection severity. Use education to prepare questions—not to avoid care when symptoms escalate.',
        ],
      },
    ],
    faqs: [
      f(
        'Are sports drinks necessary?',
        'Often water is enough for mild cases; illness and heavy losses may change electrolyte needs—ask a clinician for your scenario.',
      ),
      f(
        'Can coffee dehydrate me?',
        'Caffeine effects vary; large caffeine intake may contribute for some people, but it’s not the whole story.',
      ),
    ],
    relatedSymptomSlugs: ['dehydration', 'dizziness', 'fatigue', 'headache'],
    relatedToolSlugs: ['hydration-checker', 'symptom-urgency-checker'],
    relatedGuideSlugs: ['why-am-i-dizzy', 'why-am-i-always-tired'],
  },
  'why-am-i-always-tired': {
    slug: 'why-am-i-always-tired',
    route: '/guides/why-am-i-always-tired',
    h1: 'Why Am I Always Tired? Organizing Causes Without Jumping to Conclusions',
    metaTitle: 'Why Am I Always Tired? (Educational) | DoctorAIBolit',
    metaDescription:
      'Educational map of sleep debt, stress, illness recovery, thyroid and anemia discussions, medications, and mood—plus our fatigue symptom page and sleep reflection tool.',
    intro:
      'Fatigue is one of the most common reasons people seek care—and one of the hardest symptoms to pin down remotely because it can accompany mental health changes, infections, sleep disorders, hormonal issues, medication side effects, and chronic diseases.',
    emergencyNote:
      'Seek urgent care for fatigue with chest pain, severe shortness of breath, confusion, high fever, or signs of severe bleeding.',
    sections: [
      {
        id: 'buckets',
        title: 'Helpful “buckets” clinicians explore',
        bullets: [
          'Not enough sleep or irregular schedules.',
          'Stress and burnout with cognitive slowing.',
          'Post-viral recovery timelines (variable).',
          'Mood disorders that affect sleep architecture.',
          'Medical contributors evaluated with history, exam, and sometimes labs—individualized.',
        ],
        paragraphs: [
          'Tracking two weeks of sleep/wake times, caffeine, exercise, and major stressors can make appointments more productive.',
        ],
      },
    ],
    faqs: [
      f(
        'Will a multivitamin fix it?',
        'Deficiencies matter when confirmed; blanket supplements aren’t a substitute for evaluation of persistent fatigue.',
      ),
      f(
        'Is afternoon slump normal?',
        'It can be—but new, severe, or progressive fatigue deserves attention.',
      ),
    ],
    relatedSymptomSlugs: ['fatigue', 'anxiety-symptoms', 'dehydration', 'blood-pressure'],
    relatedToolSlugs: ['sleep-quality-checker', 'stress-self-assessment', 'hydration-checker'],
    relatedGuideSlugs: ['signs-of-dehydration', 'anxiety-vs-panic-attack'],
  },
  'when-to-go-to-er': {
    slug: 'when-to-go-to-er',
    route: '/guides/when-to-go-to-er',
    h1: 'When to Go to the ER: Education on Conservative Safety Boundaries',
    metaTitle: 'When to Go to the ER (Educational) | DoctorAIBolit',
    metaDescription:
      'Plain-language guide on emergency thresholds, what telehealth cannot replace, and how to use DoctorAIBolit for preparation after stability—paired with urgent symptom education.',
    intro:
      'Emergency departments exist for time-sensitive threats to life, limb, organ function, or severe symptom burden. Educational websites should bias toward encouraging evaluation when doubt remains—because missing a rare emergency is higher stakes than an extra visit.',
    emergencyNote:
      'If you believe you have a medical emergency, call emergency services now. This guide is not triage.',
    sections: [
      {
        id: 'examples',
        title: 'Examples of presentations people often treat as emergencies',
        bullets: [
          'Possible stroke symptoms.',
          'Severe breathing difficulty at rest or inability to speak full sentences.',
          'Heavy bleeding, major trauma, or serious burns.',
          'Suicidal intent or inability to stay safe—use crisis services.',
        ],
        paragraphs: [
          'Local systems differ; nurse advice lines and telehealth may help for minor issues—but not for suspected emergencies.',
        ],
      },
      {
        id: 'after',
        title: 'After you stabilize: how DoctorAIBolit can help',
        paragraphs: [
          'Private chat can help you understand discharge instructions, prepare follow-up questions, or organize timelines once urgent issues are addressed.',
        ],
      },
    ],
    faqs: [
      f(
        'Is the ER always the right choice?',
        'No—urgent care or primary care fits many issues—but when severe red flags appear, emergency evaluation is appropriate.',
      ),
      f(
        'Will I be “bothering” clinicians?',
        'If you’re uncertain, conservative evaluation is reasonable. Clinicians prefer safety over delayed care for concerning symptoms.',
      ),
    ],
    relatedSymptomSlugs: ['urgent-symptom-checker', 'chest-pain', 'shortness-of-breath', 'dizziness'],
    relatedToolSlugs: ['symptom-urgency-checker'],
    relatedGuideSlugs: ['chest-pain-after-workout', 'headache-warning-signs'],
  },
  'anxiety-vs-panic-attack': {
    slug: 'anxiety-vs-panic-attack',
    route: '/guides/anxiety-vs-panic-attack',
    h1: 'Anxiety vs Panic Attack: Language That Helps You Describe What Happened',
    metaTitle: 'Anxiety vs Panic Attack (Educational) | DoctorAIBolit',
    metaDescription:
      'Educational distinctions, overlap with medical conditions, grounding steps that are not a substitute for care, and links to anxiety symptoms and stress tools.',
    intro:
      '“Anxiety” often describes a longer arc of worry and tension, while “panic attack” often describes intense surges of fear with physical symptoms. In real life the boundaries blur, and clinicians focus on severity, triggers, safety, and function.',
    emergencyNote:
      'First-time severe chest pain, fainting, or shortness of breath should be treated as medically urgent until evaluated—don’t assume panic.',
    sections: [
      {
        id: 'describe',
        title: 'How people describe panic surges',
        bullets: [
          'Sudden peak within minutes: pounding heart, shaking, chills, breathlessness.',
          'Fear of losing control paired with a strong urge to escape.',
        ],
        paragraphs: [
          'If episodes are frequent or disabling, professional evaluation and evidence-based treatments can help significantly.',
        ],
      },
      {
        id: 'support',
        title: 'Supportive (non-medical) grounding is not enough when red flags exist',
        paragraphs: [
          'Slow breathing may help some people once serious causes are reasonably excluded. If you are unsure, seek evaluation.',
        ],
      },
    ],
    faqs: [
      f(
        'Can caffeine trigger panic-like symptoms?',
        'Yes for some people—timing and dose matter.',
      ),
      f(
        'Is medication always required?',
        'Not always; approaches depend on diagnosis, preferences, and severity.',
      ),
    ],
    relatedSymptomSlugs: ['anxiety-symptoms', 'chest-pain', 'dizziness', 'shortness-of-breath'],
    relatedToolSlugs: ['stress-self-assessment', 'symptom-urgency-checker'],
    relatedGuideSlugs: ['stress-vs-heart-problem', 'shortness-of-breath-causes'],
  },
  'headache-warning-signs': {
    slug: 'headache-warning-signs',
    route: '/guides/headache-warning-signs',
    h1: 'Headache Warning Signs: Red Flags to Take Seriously',
    metaTitle: 'Headache Warning Signs (Educational) | DoctorAIBolit',
    metaDescription:
      'Educational overview of thunderclap headaches, neurologic symptoms, fever with stiff neck, and pregnancy-related headache concerns—plus headache pattern tool and symptom pages.',
    intro:
      'Most headaches are not emergencies—but certain patterns warrant urgent evaluation because they overlap with strokes, bleeds, infections, or severe blood pressure problems. This guide explains why “worst ever” or sudden-onset headaches get attention quickly.',
    emergencyNote:
      'Seek emergency care for thunderclap onset, new neurologic deficits, seizures, head injury, or fever with stiff neck.',
    sections: [
      {
        id: 'red',
        title: 'Red-flag patterns (education, not triage)',
        bullets: [
          'Sudden maximal intensity within seconds to a minute.',
          'Progressive confusion, weakness, vision loss, or trouble walking.',
          'Headache with spreading rash and fever.',
        ],
        paragraphs: [
          'Pregnancy and postpartum headache changes may need specialized urgent guidance—when relevant, escalate promptly.',
        ],
      },
    ],
    faqs: [
      f(
        'Are migraines emergencies?',
        'Some migraine attacks are severe yet not emergent—but new severe presentations should be assessed.',
      ),
      f(
        'Should I get imaging for every headache?',
        'Imaging is not universal; clinicians match testing to the story and exam.',
      ),
    ],
    relatedSymptomSlugs: ['headache', 'dizziness', 'blood-pressure', 'dehydration'],
    relatedToolSlugs: ['headache-pattern-guide', 'blood-pressure-guide', 'symptom-urgency-checker'],
    relatedGuideSlugs: ['why-am-i-dizzy', 'when-to-go-to-er'],
  },
  'understanding-blood-pressure': {
    slug: 'understanding-blood-pressure',
    route: '/guides/understanding-blood-pressure',
    h1: 'Understanding Blood Pressure: Numbers, Variability, and What Clinicians Do With Home Logs',
    metaTitle: 'Understanding Blood Pressure (Educational) | DoctorAIBolit',
    metaDescription:
      'Educational guide on systolic/diastolic meaning, measurement technique, white-coat effects, and why trends matter—with BP symptom page and home monitoring checklist tool.',
    intro:
      'Blood pressure is a snapshot of circulatory pressure that fluctuates with stress, sleep, caffeine, pain, medications, and illness. Home logs can help—if the technique is consistent and the cuff fits.',
    emergencyNote:
      'Very high readings with concerning symptoms (chest pain, neurologic symptoms, severe headache) need urgent evaluation—don’t self-manage online.',
    sections: [
      {
        id: 'basics',
        title: 'Basics in plain language',
        paragraphs: [
          'Systolic (top) reflects pressure during heart contraction; diastolic (bottom) reflects pressure between beats—both can matter depending on age and conditions.',
          'Targets and treatment plans are individualized; educational sites shouldn’t tell you what your numbers mean for medication decisions.',
        ],
      },
      {
        id: 'technique',
        title: 'Technique pitfalls that create false highs',
        bullets: [
          'Measuring right after caffeine or exercise.',
          'Talking during the reading.',
          'Arm unsupported or cuff too small.',
        ],
        paragraphs: [],
      },
    ],
    faqs: [
      f(
        'Is one high reading hypertension?',
        'Diagnosis is not based on a single moment for most adults; patterns and clinician assessment matter.',
      ),
      f(
        'Can anxiety raise BP?',
        'Yes—another reason consistent home technique helps separate signal from noise.',
      ),
    ],
    relatedSymptomSlugs: ['blood-pressure', 'headache', 'dizziness', 'chest-pain'],
    relatedToolSlugs: ['blood-pressure-guide', 'stress-self-assessment'],
    relatedGuideSlugs: ['headache-warning-signs', 'when-to-go-to-er'],
  },
  'shortness-of-breath-causes': {
    slug: 'shortness-of-breath-causes',
    route: '/guides/shortness-of-breath-causes',
    h1: 'Shortness of Breath: Cause Categories and How Clinicians Think About Risk',
    metaTitle: 'Shortness of Breath Causes (Educational) | DoctorAIBolit',
    metaDescription:
      'Educational overview of exertional breathlessness, asthma-like patterns, anxiety-related hyperventilation, cardiac and pulmonary red flags—links to symptom page and urgency tool.',
    intro:
      'Breathlessness can mean air hunger, chest tightness, inability to speak full sentences, or fatigue-breath coupling. Because serious heart and lung problems can present similarly to milder issues, conservative evaluation matters when symptoms are new, severe, or progressive.',
    emergencyNote:
      'Seek emergency care for severe SOB at rest, blue lips, confusion, chest pain, or fainting.',
    sections: [
      {
        id: 'categories',
        title: 'Broad categories (education only)',
        bullets: [
          'Pulmonary: infection, asthma exacerbation, clots (risk varies), chronic lung disease.',
          'Cardiac: rhythm issues, heart failure patterns—evaluation-dependent.',
          'Hyperventilation/anxiety: real symptoms with overlapping features.',
          'Anemia and deconditioning: often considered in longer evaluations.',
        ],
        paragraphs: [
          'Spirometry, imaging, labs, and exams belong to clinicians—not websites.',
        ],
      },
    ],
    faqs: [
      f(
        'Can allergies cause SOB?',
        'Yes, among other possibilities; severe reactions may be emergencies.',
      ),
      f(
        'If I can talk, am I safe?',
        'Speaking ability is one clue—not a definitive rule for all conditions.',
      ),
    ],
    relatedSymptomSlugs: ['shortness-of-breath', 'anxiety-symptoms', 'chest-pain', 'fatigue'],
    relatedToolSlugs: ['symptom-urgency-checker', 'stress-self-assessment'],
    relatedGuideSlugs: ['when-to-go-to-er', 'stress-vs-heart-problem'],
  },
}

export function getGuideBySlug(slug: string): GuidePageData | undefined {
  if (GUIDE_SLUGS.includes(slug as GuideSlug)) return PAGES[slug as GuideSlug]
  return undefined
}

export function getAllGuidePages(): GuidePageData[] {
  return GUIDE_SLUGS.map((s) => PAGES[s])
}

export function getGuidesBySlugs(slugs: string[]): GuidePageData[] {
  return slugs.map((s) => getGuideBySlug(s)).filter((g): g is GuidePageData => Boolean(g))
}
