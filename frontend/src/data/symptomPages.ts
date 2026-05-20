import { SYMPTOM_ENRICHMENT } from './symptomEnrichment'

export const MEDICAL_DISCLAIMER_FULL =
  'DoctorAIBolit does not provide a medical diagnosis and is not a replacement for a licensed clinician. For severe or life-threatening symptoms, call emergency services immediately.'

export interface SymptomFaq {
  question: string
  answer: string
}

export interface SymptomPageData {
  slug: string
  label: string
  route: string
  h1: string
  metaTitle: string
  metaDescription: string
  intro: string
  /** Second hero paragraph merged from enrichment for depth and SEO. */
  introSecondary: string
  whatItCanMean: string
  whenToSeekUrgent: string[]
  emergencyWarnings: string[]
  commonCauses: string[]
  watchFor: string[]
  safeNextSteps: string[]
  howAiCanHelp: string[]
  faqs: SymptomFaq[]
  relatedSlugs: string[]
  deepDiveParagraphs: string[]
  clinicianQuestions: string[]
  trackAtHome: string[]
  relatedGuideSlugs: string[]
  relatedToolSlugs: string[]
}

/** Base records in `PAGES` before merge with `symptomEnrichment.ts`. */
export type SymptomPageSeed = Omit<
  SymptomPageData,
  | 'introSecondary'
  | 'deepDiveParagraphs'
  | 'clinicianQuestions'
  | 'trackAtHome'
  | 'relatedGuideSlugs'
  | 'relatedToolSlugs'
>

export interface SymptomsHubData {
  route: string
  h1: string
  metaTitle: string
  metaDescription: string
  intro: string
}

const f = (question: string, answer: string): SymptomFaq => ({ question, answer })

export const SYMPTOMS_HUB: SymptomsHubData = {
  route: '/symptoms',
  h1: 'Educational Symptom Guides',
  metaTitle: 'Symptom Education Hub | Calm Health Guides | DoctorAIBolit',
  metaDescription:
    'Explore educational guides on common symptoms—from chest discomfort to fatigue. Learn possible patterns, when urgent care may be appropriate, and start a private AI health chat to organize your questions. Not medical advice.',
  intro:
    'These pages explain common symptoms in plain language so you can feel more prepared before you speak with a clinician or start a private chat. Every guide is educational only—calm, practical, and easy to read on a phone.',
}

export const SYMPTOM_SLUGS = [
  'chest-pain',
  'fatigue',
  'rash',
  'dizziness',
  'dehydration',
  'headache',
  'shortness-of-breath',
  'anxiety-symptoms',
  'blood-pressure',
  'urgent-symptom-checker',
] as const

export type SymptomSlug = (typeof SYMPTOM_SLUGS)[number]

const PAGES: Record<SymptomSlug, SymptomPageSeed> = {
  'chest-pain': {
    slug: 'chest-pain',
    label: 'Chest Pain',
    route: '/symptoms/chest-pain',
    h1: 'Chest Pain: Educational Overview & Next Steps',
    metaTitle: 'Chest Pain Guide (Educational) | When to Seek Care | DoctorAIBolit',
    metaDescription:
      'Educational overview of chest discomfort: possible non-urgent and urgent patterns, what to watch for, and how to organize your story before a private AI health chat. Not a diagnosis.',
    intro:
      'Chest discomfort can range from muscle strain to conditions that need urgent attention. This page helps you understand possible causes in general terms and what information is helpful to gather—without jumping to conclusions.',
    whatItCanMean:
      'Many people experience chest-related sensations from posture, reflux, anxiety, respiratory issues, or heart and vascular conditions. The same symptom pattern may mean different things in different people, which is why context—your age, activity, timing, and associated symptoms—matters for a licensed clinician.',
    whenToSeekUrgent: [
      'Pain that spreads to the arm, jaw, neck, or back together with sweating or nausea.',
      'A crushing or pressure-like sensation that started with exertion and does not ease with rest.',
      'New severe shortness of breath with dizziness or fainting.',
      'Sudden, sharp pain with trouble breathing after travel, surgery, or long immobility.',
    ],
    emergencyWarnings: [
      'Call emergency services if chest pain is severe, sudden, crushing, or paired with trouble breathing, fainting, or blue lips.',
      'Do not drive yourself if you feel faint, confused, or the pain is rapidly worsening.',
    ],
    commonCauses: [
      'Muscle strain or costochondritis-type soreness after lifting or coughing.',
      'Acid reflux or esophageal spasm may be felt behind the breastbone.',
      'Anxiety or panic may cause tightness with rapid breathing—still worth discussing with a clinician when new or severe.',
      'Respiratory infections or inflammation can sometimes cause pleuritic-type discomfort.',
      'Heart and blood vessel conditions remain important possibilities your clinician will consider with exams and tests.',
    ],
    watchFor: [
      'Pain that changes with position or deep breaths versus pain with exertion.',
      'Associated fever, cough, or recent illness.',
      'Whether symptoms are new versus long-standing and stable.',
      'Medications, caffeine, and family history you can list for your visit.',
    ],
    safeNextSteps: [
      'Note timing, triggers, duration, and anything that improves or worsens the pain.',
      'If symptoms are mild and stable, schedule a routine visit; if red flags appear, seek urgent or emergency care.',
      'Avoid heavy exertion until a clinician has guided you if pain is unexplained or exertional.',
      'Use DoctorAIBolit to rehearse how you will describe the pain—clear language helps real-world visits.',
    ],
    howAiCanHelp: [
      'You can describe the quality, location, and timeline of discomfort in a private chat.',
      'The assistant can help you organize possible causes as educational topics to discuss—not conclusions.',
      'You can draft a short list of questions for your clinician or urgent care visit.',
    ],
    faqs: [
      f(
        'Is chest pain always a heart issue?',
        'No. Many possible causes exist—from strain to reflux—but some heart-related patterns are serious. This page cannot tell which applies to you; seek emergency care for severe or concerning symptoms.',
      ),
      f(
        'Can DoctorAIBolit tell me what is causing my chest pain?',
        'No. It offers educational guidance only and does not provide a medical diagnosis. A licensed clinician uses history, exam, and sometimes tests.',
      ),
      f(
        'What details help a clinician take my story seriously without panic?',
        'Duration, exact location, radiation, relation to exercise or meals, associated shortness of breath, and your risk factors. Writing these down calmly can help.',
      ),
      f(
        'Should I exercise if I have mild chest tightness?',
        'If symptoms are new, unexplained, or worse with exertion, avoid pushing through workouts until a clinician advises. When in doubt, get evaluated.',
      ),
      f(
        'How is this different from an emergency hotline?',
        'Emergency services coordinate immediate care. DoctorAIBolit is for educational organization and private chat—not emergencies.',
      ),
    ],
    relatedSlugs: ['shortness-of-breath', 'anxiety-symptoms', 'urgent-symptom-checker', 'dizziness', 'fatigue'],
  },

  fatigue: {
    slug: 'fatigue',
    label: 'Fatigue',
    route: '/symptoms/fatigue',
    h1: 'Fatigue: Possible Causes & Practical Self-Care Ideas',
    metaTitle: 'Fatigue Guide (Educational) | Energy, Sleep & Next Steps | DoctorAIBolit',
    metaDescription:
      'Learn how fatigue may relate to sleep, stress, illness, and lifestyle—in educational terms. Explore safe next steps and use private AI chat to sort symptoms before a clinician visit. Not a diagnosis.',
    intro:
      'Feeling worn out can sneak up gradually or hit after an illness. This guide frames fatigue as a symptom to explore calmly—with attention to sleep, mood, nutrition, and medical follow-up when needed.',
    whatItCanMean:
      'Fatigue may be related to poor sleep, stress, low activity, recovery from infection, thyroid or iron issues, mood changes, medication side effects, or many other conditions. Patterns over weeks matter as much as a single rough day.',
    whenToSeekUrgent: [
      'Sudden confusion, weakness on one side, or trouble speaking.',
      'Chest pain or severe shortness of breath with exhaustion.',
      'High fever with severe body aches and you feel unsafe at home.',
    ],
    emergencyWarnings: [
      'Seek emergency care if fatigue comes with fainting, chest pain, trouble breathing, or new neurologic symptoms.',
      'If you cannot stay awake, feel severely confused, or may harm yourself, seek immediate help locally or via crisis services.',
    ],
    commonCauses: [
      'Insufficient or fragmented sleep and irregular schedules.',
      'Stress, burnout, or low mood that drains motivation.',
      'Recent viral illness, including post-viral tiredness as you recover.',
      'Low physical activity or dehydration.',
      'Nutrient issues, thyroid changes, or other conditions your clinician may screen for with labs.',
    ],
    watchFor: [
      'Whether tiredness improves after restful nights for several days.',
      'Weight change, hair loss, cold intolerance, or palpitations.',
      'Snoring or gasping that could suggest poor sleep breathing.',
      'New medications or higher alcohol or caffeine use.',
    ],
    safeNextSteps: [
      'Prioritize consistent sleep and daylight exposure when possible.',
      'Hydrate, eat regular meals, and add gentle movement if cleared by a clinician.',
      'Track energy levels and sleep for one to two weeks to share at an appointment.',
      'Use our chat to phrase your fatigue story clearly for a medical visit.',
    ],
    howAiCanHelp: [
      'Organize possible lifestyle factors you want to mention.',
      'Draft questions about labs or sleep study referrals to ask a clinician.',
      'Explore educational explanations of terms you heard elsewhere—without replacing professional advice.',
    ],
    faqs: [
      f(
        'Is being tired the same as being depressed?',
        'Not always. They can overlap, but many medical and lifestyle factors affect energy. A clinician can help separate contributing causes.',
      ),
      f(
        'When should I book a non-urgent visit for fatigue?',
        'If low energy lasts several weeks, affects daily life, or comes with other new symptoms, scheduling a visit is reasonable.',
      ),
      f(
        'Can supplements fix fatigue?',
        'Some deficiencies may contribute, but self-treating without guidance can miss the real issue. Educational chats can help you ask smarter questions in clinic.',
      ),
      f(
        'Does DoctorAIBolit diagnose anemia or thyroid problems?',
        'No. Those require testing. We provide educational guidance and help you prepare for conversations with licensed clinicians.',
      ),
      f(
        'Can I use the chat if I feel slightly dizzy with fatigue?',
        'You can describe symptoms privately for educational organization. Seek urgent care if dizziness is severe or sudden.',
      ),
    ],
    relatedSlugs: ['dehydration', 'headache', 'anxiety-symptoms', 'dizziness', 'blood-pressure'],
  },

  rash: {
    slug: 'rash',
    label: 'Skin Rash',
    route: '/symptoms/rash',
    h1: 'Skin Rash: Patterns, Care Tips & When to Get Seen',
    metaTitle: 'Skin Rash Guide (Educational) | Itching, Hives & Next Steps | DoctorAIBolit',
    metaDescription:
      'Educational guide to rashes: common patterns, itch care, when urgent care makes sense, and how to describe changes for a clinician or private AI chat. Not a diagnosis.',
    intro:
      'Rashes can be allergic, infectious, irritant, or related to medications. Photos and a clear timeline help clinicians—this page walks through calm observation skills without guessing a single label for your skin.',
    whatItCanMean:
      'A rash may be related to contact with a product, insect bites, viral illnesses, eczema flares, medication reactions, or autoimmune conditions. The shape, location, spread speed, and associated fever or pain narrow possibilities for clinicians.',
    whenToSeekUrgent: [
      'Rapidly spreading rash with fever, stiff neck, or confusion.',
      'Swelling of lips, tongue, or throat with hives.',
      'Painful blisters involving eyes, mouth, or genitals.',
      'Purple spots that do not blanch plus illness appearance.',
    ],
    emergencyWarnings: [
      'Call emergency services for airway swelling, widespread blistering with mucosal involvement, or sepsis-like appearance.',
      'Do not rely on this page to exclude a serious drug reaction—when in doubt, seek urgent evaluation.',
    ],
    commonCauses: [
      'Contact irritation from soaps, plants, metals, or latex.',
      'Heat rash or friction in hot, humid conditions.',
      'Viral exanthems that accompany colds—educational patterns vary by age.',
      'Eczema or psoriasis flares in people with prior skin history.',
      'Medication-related rashes that warrant clinician review.',
    ],
    watchFor: [
      'Itch versus pain; raised bumps versus flat spots.',
      'Spread over hours versus days; symmetry on both sides.',
      'New products, antibiotics, or vaccines in the prior weeks.',
      'Fever, joint pain, or mouth sores alongside skin change.',
    ],
    safeNextSteps: [
      'Take date-stamped photos in good light if the rash changes.',
      'Use bland moisturizers unless a clinician advised otherwise; avoid harsh scratching.',
      'Pause new nonessential skincare products until you have guidance.',
      'Prepare a timeline of exposures for your visit or for chat notes.',
    ],
    howAiCanHelp: [
      'Practice describing the rash location with clear everyday language.',
      'List questions about patch testing or referral to dermatology.',
      'Understand educational definitions when you read brochures—not to self-label.',
    ],
    faqs: [
      f(
        'Can I send photos through DoctorAIBolit instead of seeing a doctor?',
        'DoctorAIBolit is a text chat focused on educational guidance. Do not use it as a substitute for an in-person or video skin exam when a rash is concerning.',
      ),
      f(
        'Are all itchy rashes allergies?',
        'Not necessarily. Itch occurs in many rashes. Clinicians consider exposures, timing, and associated symptoms.',
      ),
      f(
        'Should children with rashes and fever stay home?',
        'Many schools and clinics have policies; when you are worried, contact your pediatric clinician for guidance about contagious illness.',
      ),
      f(
        'Does calamine help every rash?',
        'It may soothe itch for some issues but is not right for all skin conditions. Persistent rash deserves evaluation.',
      ),
      f(
        'Can stress cause a rash?',
        'Stress may worsen some skin conditions; clinicians still look for other contributors.',
      ),
    ],
    relatedSlugs: ['urgent-symptom-checker', 'dehydration', 'fatigue', 'headache', 'anxiety-symptoms'],
  },

  dizziness: {
    slug: 'dizziness',
    label: 'Dizziness',
    route: '/symptoms/dizziness',
    h1: 'Dizziness: Types, Triggers & Safety Basics',
    metaTitle: 'Dizziness Guide (Educational) | Vertigo vs Lightheadedness | DoctorAIBolit',
    metaDescription:
      'Educational overview of dizziness and lightheadedness: possible causes, hydration and posture tips, red flags, and how to describe episodes in private AI chat. Not a diagnosis.',
    intro:
      '“Dizzy” can mean spinning, feeling faint, or imbalance. Sorting what you feel—and when it happens—helps clinicians help you. This page stays practical and cautious.',
    whatItCanMean:
      'Dizziness may be related to inner ear issues, blood pressure shifts, dehydration, anxiety, migraine variants, medication effects, low blood sugar, or neurologic conditions worth ruling out when symptoms are new or severe.',
    whenToSeekUrgent: [
      'Sudden severe headache with neck stiffness and fever.',
      'Weakness, numbness, slurred speech, or double vision with dizziness.',
      'Fainting with chest pain or palpitations.',
      'Head injury with worsening balance or vomiting.',
    ],
    emergencyWarnings: [
      'Call emergency services for stroke-like symptoms, repeated collapse, or the worst headache of your life.',
      'Do not climb ladders or drive if you feel suddenly unsteady.',
    ],
    commonCauses: [
      'Benign inner ear disturbances that affect balance in some people.',
      'Standing up quickly with a transient blood pressure dip.',
      'Dehydration, illness, or overheating.',
      'Anxiety and hyperventilation.',
      'New medications or dose changes.',
    ],
    watchFor: [
      'Whether the room spins versus feeling about to pass out.',
      'Duration: seconds vs minutes vs constant.',
      'Ear fullness, ringing, or hearing change.',
      'Relation to head position changes.',
    ],
    safeNextSteps: [
      'Sit or lie down when symptoms start; rise slowly afterward.',
      'Improve fluid intake if dehydration is plausible and not medically restricted.',
      'Avoid driving until you understand your pattern and a clinician clears you.',
      'Note episodes in a simple log for your appointment.',
    ],
    howAiCanHelp: [
      'Clarify wording: vertigo versus presyncope versus imbalance.',
      'Prepare questions about vestibular evaluation or blood pressure checks.',
      'Explore calming explanations while you wait for an appointment—without replacing it.',
    ],
    faqs: [
      f(
        'Is all dizziness from ear problems?',
        'No. Ear issues are one category among many. Clinical evaluation helps sort causes.',
      ),
      f(
        'Can caffeine help dizziness?',
        'Sometimes withdrawal or overuse affects how people feel, but there is no universal fix. Discuss habits with a clinician.',
      ),
      f(
        'Should I go to the ER for first-time mild dizziness?',
        'If symptoms are mild, brief, and you otherwise feel well, many people seek outpatient care—but use emergency services for red flags listed above.',
      ),
      f(
        'Does DoctorAIBolit test my balance?',
        'No. The chat cannot perform physical exams. It offers educational conversation only.',
      ),
      f(
        'Can anxiety mimic dizziness?',
        'Yes, the sensations can overlap, which is why a thoughtful history matters in real-world care.',
      ),
    ],
    relatedSlugs: ['dehydration', 'headache', 'anxiety-symptoms', 'blood-pressure', 'urgent-symptom-checker'],
  },

  dehydration: {
    slug: 'dehydration',
    label: 'Dehydration',
    route: '/symptoms/dehydration',
    h1: 'Dehydration: Signs, Fluids & When to Escalate Care',
    metaTitle: 'Dehydration Guide (Educational) | Fluids & Warning Signs | DoctorAIBolit',
    metaDescription:
      'Educational guide to dehydration: thirst, urine color, kids and older adults, illness-related losses, and when IV fluids or urgent care may be needed. Not a diagnosis.',
    intro:
      'Fluid balance changes with heat, exercise, fever, vomiting, or diarrhea. This page covers gentle self-check ideas and when escalation is wise—without minimizing serious illness.',
    whatItCanMean:
      'Dehydration may be related to inadequate intake, excess losses, or an inability to keep fluids down. Young children, older adults, and people on diuretics can shift balance quickly.',
    whenToSeekUrgent: [
      'No urine for many hours with vomiting, confusion, or extreme lethargy.',
      'Blood in stool or vomit, or severe belly pain.',
      'Fever with stiff neck or inability to bend the neck.',
      'Signs of heat illness with hot, dry skin and confusion.',
    ],
    emergencyWarnings: [
      'Seek emergency care for confusion, fainting with injury, or inability to keep any fluids down in vulnerable groups.',
      'Infants with sunken fontanels, no tears, or poor responsiveness need urgent pediatric evaluation.',
    ],
    commonCauses: [
      'Hot weather workouts without adequate fluids and electrolytes.',
      'Gastroenteritis with vomiting or diarrhea.',
      'Fever and poor intake during illness.',
      'Medications that increase urination.',
      'Reduced thirst perception in some older adults.',
    ],
    watchFor: [
      'Urine that is very dark or infrequent.',
      'Dizziness when standing.',
      'Dry mouth, cracked lips, or unusual fatigue.',
      'Weight change during illness.',
    ],
    safeNextSteps: [
      'Sip oral rehydration solutions or water as tolerated if a clinician has not restricted fluids.',
      'Cool down, rest, and replace electrolytes after heavy sweat with clinician-appropriate options.',
      'Track intake and output during stomach bugs to share with telehealth or urgent care.',
      'Use chat to rehearse questions about IV fluids or hospital criteria.',
    ],
    howAiCanHelp: [
      'Understand educational thresholds people often discuss with nurses or clinicians.',
      'List medications and conditions that affect hydration.',
      'Prepare a concise illness timeline before a call or visit.',
    ],
    faqs: [
      f(
        'How much water should everyone drink?',
        'Needs vary by body size, activity, climate, and health conditions. Clinicians personalize advice; generic rules are imperfect.',
      ),
      f(
        'Is sports drink always better than water?',
        'For long sweaty exercise, electrolytes help some people. For mild thirst, water may suffice. Sugar-heavy drinks are not ideal for every situation.',
      ),
      f(
        'Can I treat dehydration at home when I have diabetes?',
        'People with complex conditions should follow clinician guidance on fluids and glucose monitoring.',
      ),
      f(
        'Does DoctorAIBolit measure my hydration?',
        'No. Only you and your care team can assess that with history and sometimes labs.',
      ),
      f(
        'When is clear urine a problem?',
        'Rarely, very excessive clear urine can relate to other conditions; persistent changes deserve questions at a routine visit.',
      ),
    ],
    relatedSlugs: ['fatigue', 'dizziness', 'headache', 'rash', 'urgent-symptom-checker'],
  },

  headache: {
    slug: 'headache',
    label: 'Headache',
    route: '/symptoms/headache',
    h1: 'Headache: Types, Relief Habits & Red Flags',
    metaTitle: 'Headache Guide (Educational) | Migraine vs Tension | DoctorAIBolit',
    metaDescription:
      'Educational overview of headaches: tension and migraine patterns, lifestyle triggers, red flags, and how to prepare for a clinician visit or private AI chat. Not a diagnosis.',
    intro:
      'Most people get headaches sometimes. This guide focuses on patterns, safe self-care habits, and clear warning signs—so you can seek the right level of care without catastrophizing ordinary pain.',
    whatItCanMean:
      'Headaches may be related to tension in neck and scalp muscles, migraine physiology, sinus inflammation, vision strain, dehydration, sleep disruption, caffeine withdrawal, or—in rare cases—serious causes clinicians evaluate with red-flag screening.',
    whenToSeekUrgent: [
      'Thunderclap worst-ever headache reaching peak intensity in seconds to a minute.',
      'Headache with fever, stiff neck, rash, or confusion.',
      'New headache after head trauma.',
      'Headache with weakness, numbness, or vision loss that is sudden.',
    ],
    emergencyWarnings: [
      'Call emergency services for sudden severe neurological change or the worst headache of your life.',
      'Do not dismiss a new severe headache in pregnancy—seek timely obstetric guidance.',
    ],
    commonCauses: [
      'Tension-type patterns linked to stress and posture.',
      'Migraine with or without aura in susceptible individuals.',
      'Eye strain and screen overuse.',
      'Poor sleep, skipped meals, or dehydration.',
      'Medication overuse headaches when pain pills are used heavily.',
    ],
    watchFor: [
      'Location, pulsating quality, light or sound sensitivity, nausea.',
      'Relation to menstrual cycle or specific foods.',
      'Frequency increase over recent months.',
      'New headache after age 50 without prior history.',
    ],
    safeNextSteps: [
      'Keep a brief headache diary: date, duration, possible triggers, medications taken.',
      'Try consistent sleep, meals, hydration, and posture breaks if a clinician agrees.',
      'Discuss appropriate OTC use limits to avoid rebound headaches.',
      'Use DoctorAIBolit to draft questions about imaging or specialist referral—educationally, not as a decision.',
    ],
    howAiCanHelp: [
      'Clarify migraine versus tension descriptions in everyday words.',
      'Prepare a timeline for neurologist or primary care visits.',
      'Explore calming explanations of terms like aura—still defer decisions to clinicians.',
    ],
    faqs: [
      f(
        'Do I need a brain scan for every headache?',
        'No. Many headaches do not require imaging. Red flags guide clinicians toward testing.',
      ),
      f(
        'Can DoctorAIBolit prescribe migraine medications?',
        'No. It does not prescribe or replace a licensed clinician.',
      ),
      f(
        'Is caffeine good or bad for headaches?',
        'It can trigger headaches in some people and relieve withdrawal in others. Patterns are personal; discuss with a clinician.',
      ),
      f(
        'Are temples-only headaches always harmless?',
        'Location alone does not determine severity. New, changing, or worsening headaches deserve evaluation.',
      ),
      f(
        'Can stress alone cause headaches?',
        'Stress is a common contributor among many factors clinicians consider.',
      ),
    ],
    relatedSlugs: ['dizziness', 'anxiety-symptoms', 'dehydration', 'blood-pressure', 'fatigue'],
  },

  'shortness-of-breath': {
    slug: 'shortness-of-breath',
    label: 'Shortness of Breath',
    route: '/symptoms/shortness-of-breath',
    h1: 'Shortness of Breath: Calm Overview & Safety Tips',
    metaTitle: 'Shortness of Breath Guide (Educational) | Breathing & Care | DoctorAIBolit',
    metaDescription:
      'Educational guide to breathlessness: possible cardiac and lung-related patterns, anxiety overlap, red flags, and how to describe episodes for clinicians or private chat. Not a diagnosis.',
    intro:
      'Feeling short of breath is distressing. This page outlines common, broad categories and emphasizes when emergency care is appropriate—while helping you articulate what you feel at a visit.',
    whatItCanMean:
      'Breathlessness may be related to lung conditions, heart strain, anemia, deconditioning, allergic reactions, infections, blood clots, or anxiety with hyperventilation. Clinicians combine exam, history, and sometimes tests.',
    whenToSeekUrgent: [
      'Sudden breathlessness with chest pain or fainting.',
      'Lips or face turning blue, or inability to speak full sentences.',
      'Rapid onset after travel, surgery, or bedrest—possible clot until evaluated.',
      'Swollen face or throat with hives after exposure.',
    ],
    emergencyWarnings: [
      'Call emergency services for severe or rapidly worsening breathing problems.',
      'Do not wait for chat responses if you cannot breathe adequately.',
    ],
    commonCauses: [
      'Asthma or reactive airway flares.',
      'Respiratory infections including pneumonia in some cases.',
      'Heart conditions that affect fluid or pump function.',
      'Anxiety-related hyperventilation after other causes are considered.',
      'Poor fitness with exertional breathlessness—after clinician guidance.',
    ],
    watchFor: [
      'Wheeze, cough, fever, or chest tightness.',
      'Orthopnea or waking breathless—topics to mention urgently to clinicians.',
      'Leg swelling with travel risk factors.',
      'Oxygen needs if you have a home oximeter prescribed for you.',
    ],
    safeNextSteps: [
      'Sit upright, loosen tight clothing, move to fresh air if allergies are suspected and you are stable.',
      'Use prescribed rescue inhalers exactly as your clinician directed—not new prescriptions from chat.',
      'Seek care promptly when symptoms exceed your prior personal baseline.',
      'Practice describing pace of onset and triggers before telehealth or ER intake.',
    ],
    howAiCanHelp: [
      'Translate symptoms into chronological bullet points.',
      'List medications and inhaler names you use.',
      'Understand educational vocabulary you may hear in triage—without self-triaging emergencies here.',
    ],
    faqs: [
      f(
        'Is shortness of breath always anxiety?',
        'No. Anxiety is one possibility among many that clinicians must consider carefully.',
      ),
      f(
        'Can DoctorAIBolit listen to my lungs?',
        'No. Physical exam and imaging are in-person or ordered tests.',
      ),
      f(
        'Should I drive myself to urgent care if I feel winded?',
        'If symptoms are significant, consider arranging a ride or emergency transport per local guidance.',
      ),
      f(
        'Does mild breathlessness after COVID always mean long-term damage?',
        'Recovery varies. Ongoing symptoms deserve follow-up rather than assumptions.',
      ),
      f(
        'Is peak flow testing something I should start on my own?',
        'Only if your clinician recommended a plan and device. Avoid drawing conclusions from home measurements without professional guidance.',
      ),
    ],
    relatedSlugs: ['chest-pain', 'anxiety-symptoms', 'urgent-symptom-checker', 'fatigue', 'blood-pressure'],
  },

  'anxiety-symptoms': {
    slug: 'anxiety-symptoms',
    label: 'Anxiety Symptoms',
    route: '/symptoms/anxiety-symptoms',
    h1: 'Anxiety Symptoms: Body Sensations & Supportive Next Steps',
    metaTitle: 'Anxiety Symptoms Guide (Educational) | Calm Coping & Care | DoctorAIBolit',
    metaDescription:
      'Educational overview of anxiety-related body sensations: rapid heartbeat, tension, GI discomfort, and when to seek urgent care versus routine mental health support—with private AI chat for organization. Not a diagnosis.',
    intro:
      'Anxiety can be felt in the chest, belly, muscles, and breath. This guide validates those experiences while keeping medical caution: new or severe physical symptoms still deserve clinician review.',
    whatItCanMean:
      'Anxiety may be related to activation of the stress response—faster heart rate, shallow breathing, muscle guarding, tingling hands, or stomach upset. Similar sensations can overlap with medical conditions, which is why disclosure to clinicians matters when symptoms are new.',
    whenToSeekUrgent: [
      'First-time severe chest pain or fainting—treat as potentially medical until evaluated.',
      'Thoughts of harming yourself or others—seek immediate local crisis resources.',
      'Inability to care for basic needs due to panic or confusion.',
    ],
    emergencyWarnings: [
      'If you are in immediate danger, contact local emergency services or a crisis line in your region.',
      'Do not use this page to decide that chest pain is “only anxiety” without appropriate care when symptoms are concerning.',
    ],
    commonCauses: [
      'Acute stressors, poor sleep, and caffeine sensitivity.',
      'Generalized worry patterns with muscle tension.',
      'Panic episodes with surge of physical symptoms.',
      'Trauma-related hypervigilance in some individuals.',
      'Coexisting medical issues that merit parallel care—not either-or thinking.',
    ],
    watchFor: [
      'Triggers: crowds, travel, health worries, conflict.',
      'Sleep timing and screen use before bed.',
      'Whether relaxation skills shorten episodes.',
      'Alcohol as a coping strategy—often worsens next-day anxiety.',
    ],
    safeNextSteps: [
      'Try slow exhale-focused breathing for a few minutes when a clinician says this is safe for you.',
      'Maintain regular sleep, meals, and gentle movement when possible.',
      'Consider counseling or evidence-based therapy formats your clinician recommends.',
      'Use DoctorAIBolit to rehearse grounding phrases—not as crisis intervention.',
    ],
    howAiCanHelp: [
      'Organize symptom diaries for therapy or medical visits.',
      'Explore educational coping ideas appropriate for follow-up—not emergency.',
      'Draft questions about medication versus therapy options for licensed prescribers.',
    ],
    faqs: [
      f(
        'Can anxiety cause real chest pain?',
        'People can feel chest discomfort with anxiety, but overlapping heart conditions must be considered when appropriate.',
      ),
      f(
        'Is DoctorAIBolit therapy?',
        'No. It is educational chat, not a licensed mental health service.',
      ),
      f(
        'Will ignoring anxiety make it go away?',
        'Sometimes symptoms fluctuate, but chronic patterns often benefit from professional support.',
      ),
      f(
        'Can breathing exercises hurt me?',
        'Most people tolerate gentle breathing; hyperventilation drills are not for everyone—ask a clinician if unsure.',
      ),
      f(
        'Should I stop caffeine entirely?',
        'Some people benefit from reduction trials; others tolerate moderate intake. Personalize with guidance.',
      ),
    ],
    relatedSlugs: ['dizziness', 'chest-pain', 'headache', 'fatigue', 'urgent-symptom-checker'],
  },

  'blood-pressure': {
    slug: 'blood-pressure',
    label: 'Blood Pressure',
    route: '/symptoms/blood-pressure',
    h1: 'Blood Pressure: Home Readings & What Numbers Can Suggest',
    metaTitle: 'Blood Pressure Guide (Educational) | Home Monitoring Tips | DoctorAIBolit',
    metaDescription:
      'Educational guide to blood pressure: how home readings differ, cuff tips, possible lifestyle contributors, and how to prepare questions for your clinician—plus private AI chat for clarity. Not a diagnosis.',
    intro:
      'Blood pressure readings move with stress, caffeine, sleep, and illness. This page explains practical measurement habits and why trends matter more than a single number—without assigning labels to your readings here.',
    whatItCanMean:
      'Elevated or changing readings may be related to primary hypertension, secondary causes, white-coat effect, device error, arm position, dehydration, pain, or medication effects. Only licensed clinicians interpret your numbers in context.',
    whenToSeekUrgent: [
      'Readings extremely high with chest pain, severe headache, confusion, or neurologic change.',
      'Pregnancy with headache, vision changes, and high pressures—obstetric emergency until evaluated.',
      'Fainting with injury or repeated near-fainting.',
    ],
    emergencyWarnings: [
      'Call emergency services for hypertensive emergency symptoms as defined by your clinician—not by internet thresholds alone.',
      'Do not start or stop prescription BP medicines based on chat advice.',
    ],
    commonCauses: [
      'Genetic risk plus lifestyle factors like high sodium, inactivity, or weight patterns.',
      'Sleep apnea contributing to nighttime pressure surges.',
      'Kidney or hormonal conditions screened by clinicians.',
      'Temporary stress or pain raising readings.',
      'Incorrect cuff size or talking during measurement.',
    ],
    watchFor: [
      'Morning versus evening patterns if your clinician asked you to log.',
      'Pulse pressure trends if your clinician tracks them.',
      'Medication timing and missed doses.',
      'Salt-heavy meals and alcohol effects.',
    ],
    safeNextSteps: [
      'Use a validated upper-arm cuff; rest five minutes, feet flat, arm at heart level.',
      'Bring device to clinic once for comparison if possible.',
      'Keep a simple log: date, time, both numbers, posture, caffeine.',
      'Use chat to phrase questions about ambulatory monitoring or renal tests.',
    ],
    howAiCanHelp: [
      'Understand what systolic and diastolic mean educationally.',
      'Summarize lifestyle topics to discuss in appointments.',
      'Never interpret readings as “fine” or “dangerous” online—defer to clinicians.',
    ],
    faqs: [
      f(
        'Are wrist cuffs reliable?',
        'Some are acceptable when validated; many clinicians prefer properly fitted arm cuffs.',
      ),
      f(
        'Can DoctorAIBolit tell me my diagnosis from two numbers?',
        'No. Context and repeat measurements matter.',
      ),
      f(
        'Does coffee always raise BP?',
        'Effects vary by person, dose, and timing.',
      ),
      f(
        'Should athletes worry about low readings?',
        'Physiology differs; clinicians interpret symptoms plus readings.',
      ),
      f(
        'Is one high reading an emergency?',
        'Not necessarily, but severe symptoms with very high readings can be—seek appropriate care.',
      ),
    ],
    relatedSlugs: ['dizziness', 'headache', 'chest-pain', 'fatigue', 'urgent-symptom-checker'],
  },

  'urgent-symptom-checker': {
    slug: 'urgent-symptom-checker',
    label: 'Urgent Symptom Checker',
    route: '/symptoms/urgent-symptom-checker',
    h1: 'Urgent Symptoms: When Chat Helps vs When to Call Emergency Services',
    metaTitle: 'Urgent Symptoms (Educational) | Emergency vs Education | DoctorAIBolit',
    metaDescription:
      'Educational guide on urgent symptoms: how to use private AI health chat for preparation versus when to call emergency services—clear boundaries for DoctorAIBolit. Not a triage substitute.',
    intro:
      'DoctorAIBolit is built for private, educational conversations—not for deciding emergencies. This page states those boundaries clearly so you can use the product safely alongside real-world care.',
    whatItCanMean:
      'People often search online when scared. Educational tools may help you organize thoughts after stability returns—or before routine visits—but they cannot observe you, measure vitals, or dispatch help.',
    whenToSeekUrgent: [
      'Any symptom you would previously have called emergency services for in your region.',
      'Sudden neurologic change, severe bleeding, airway compromise, or crushing chest pain.',
      'Suicidal ideation with intent—use crisis services immediately.',
    ],
    emergencyWarnings: [
      'If you believe you have a medical emergency, contact emergency services now. DoctorAIBolit is not an emergency hotline.',
      'DoctorAIBolit does not provide a medical diagnosis and is not a replacement for a licensed clinician.',
    ],
    commonCauses: [
      'People mix up "urgent care clinic," "ER," and telehealth—each plays a different role.',
      'Uncertainty after hours prompts late-night searches; know your local nurse line if available.',
      'Language barriers—consider professional interpreters in-person when safety is on the line.',
    ],
    watchFor: [
      'Whether symptoms are stable and improving versus worsening minute to minute.',
      'Ability to walk, talk, drink fluids, and think clearly.',
      'Caretakers for children and older adults watching for subtle changes.',
    ],
    safeNextSteps: [
      'Save local emergency numbers and crisis lines where you live.',
      'After you are stable, use DoctorAIBolit to prepare follow-up questions.',
      'Review this site’s disclaimer pages if you want plain-language boundaries.',
      'Share educational chat summaries with clinicians at non-urgent visits.',
    ],
    howAiCanHelp: [
      'After recovery from minor issues, explore educational explanations of terms clinicians used.',
      'Rehearse how to describe a past event chronologically for future appointments.',
      'Build a personal list of red-flag symptoms to discuss with a primary clinician.',
    ],
    faqs: [
      f(
        'Is DoctorAIBolit an urgent symptom checker?',
        'It is not a validated emergency triage tool. It provides educational guidance in chat form—not dispatch or diagnosis.',
      ),
      f(
        'What should I do while waiting for a chat reply during an emergency?',
        'Do not wait online—get emergency help through appropriate channels.',
      ),
      f(
        'Can I paste ER paperwork into chat?',
        'You can describe educational questions, but avoid sharing highly sensitive data unnecessarily and follow privacy best practices.',
      ),
      f(
        'Does this site guarantee response time?',
        'No guarantees are made. Plan for real-world care for urgent needs.',
      ),
      f(
        'Can families use one account for multiple people?',
        'Visitor IDs are browser-based; separate conversations reduce confusion, but clinicians still see the real person in-person.',
      ),
    ],
    relatedSlugs: ['chest-pain', 'shortness-of-breath', 'dizziness', 'dehydration', 'rash'],
  },
}

function mergeSymptomData(slug: SymptomSlug): SymptomPageData {
  const seed = PAGES[slug]
  const en = SYMPTOM_ENRICHMENT[slug]
  if (!en) throw new Error(`Missing symptom enrichment for slug: ${slug}`)
  return {
    ...seed,
    introSecondary: en.introSecondary,
    deepDiveParagraphs: [...en.deepDiveParagraphs],
    clinicianQuestions: [...en.clinicianQuestions],
    trackAtHome: [...en.trackAtHome],
    relatedGuideSlugs: [...en.relatedGuideSlugs],
    relatedToolSlugs: [...en.relatedToolSlugs],
    faqs: [...seed.faqs, ...en.additionalFaqs],
  }
}

export function getSymptomBySlug(slug: string): SymptomPageData | undefined {
  if (!SYMPTOM_SLUGS.includes(slug as SymptomSlug)) return undefined
  return mergeSymptomData(slug as SymptomSlug)
}

export function getAllSymptomPages(): SymptomPageData[] {
  return SYMPTOM_SLUGS.map((s) => mergeSymptomData(s))
}

export function getRelatedSymptomPages(slugs: string[]): SymptomPageData[] {
  return slugs.map((s) => getSymptomBySlug(s)).filter((p): p is SymptomPageData => Boolean(p))
}
