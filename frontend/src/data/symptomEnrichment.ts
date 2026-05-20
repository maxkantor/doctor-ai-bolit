type SymptomFaqLite = { question: string; answer: string }

const f = (question: string, answer: string): SymptomFaqLite => ({ question, answer })

export type SymptomEnrichmentEntry = {
  introSecondary: string
  deepDiveParagraphs: string[]
  clinicianQuestions: string[]
  trackAtHome: string[]
  relatedGuideSlugs: string[]
  relatedToolSlugs: string[]
  additionalFaqs: SymptomFaqLite[]
}

function block(_intro: string, p1: string, p2: string, p3: string): string[] {
  return [p1, p2, p3]
}

export const SYMPTOM_ENRICHMENT = {
  'chest-pain': {
    introSecondary:
      'Because “chest pain” is an umbrella term, the most helpful thing you can do is describe the story the way a firefighter describes a scene—clear, chronological, and without self-editing toward a conclusion. Note whether discomfort is pressure, sharp, burning, aching, or hard to name; whether it travels; whether it lasts seconds versus minutes versus hours; and whether it returns in the same situations. If you exercise, compare this episode to prior workouts: is the sensation new, more intense, or happening with less effort? Those details matter for urgent care decisions but cannot, by themselves, replace an exam.',
    deepDiveParagraphs: block(
      'Chest wall and rib-related pain',
      'Musculoskeletal pain after pushing intensity—new weights, coughing spells, twisting sleep positions—often shows reproducible tenderness when you press gently on the painful area or when you twist your torso. Costochondritis-style irritation can feel frightening because it is near the heart, yet clinicians still evaluate broader context when symptoms are new, severe, or paired with other red-flag features.',
      'Reflux and esophageal sensitivity can produce burning or pressure behind the breastbone, sometimes after late meals, alcohol, or lying down. The overlap with cardiac symptoms is why repeated severe episodes deserve clinician attention rather than permanent self-labeling as “just reflux,” especially if the pattern changes or risk factors exist.',
      'Breathing-related chest discomfort can occur with infections, inflammation, asthma flares, or other lung issues. Pleuritic-type descriptions (worse with deep breathing) can point clinicians toward certain categories, but online reading cannot confirm a diagnosis. If breathlessness is severe or new, treat that as a higher-urgency symptom set.',
    ),
    clinicianQuestions: [
      'When did this start, and was the onset sudden or gradual?',
      'Is the feeling tied to exertion, meals, position changes, breathing, or stress?',
      'Do you have radiating pain to the jaw, arm, neck, or back?',
      'Any associated shortness of breath, sweating, nausea, fainting, or palpitations?',
      'Do you have cardiac risk factors such as hypertension, diabetes, smoking history, or strong family history?',
      'Have you recently traveled, been immobile, had surgery, or been pregnant/postpartum?',
      'What medications, supplements, stimulants, or recreational substances are involved?',
      'Have you had similar episodes before, and did any prior evaluation explain them?',
    ],
    trackAtHome: [
      'A simple timeline: start time, duration, peak intensity, and resolution (if any).',
      'Triggers you suspect: exertion level, meals, heat, stress, illness phase.',
      'Associated symptoms: breathlessness, dizziness, palpitations, cough, fever.',
      'Vital signs if you have a home BP cuff and know how to measure calmly.',
      'What eased symptoms (rest, position change, antacid trial only if already clinician-guided).',
    ],
    relatedGuideSlugs: ['chest-pain-after-workout', 'stress-vs-heart-problem', 'when-to-go-to-er'],
    relatedToolSlugs: ['symptom-urgency-checker', 'stress-self-assessment', 'hydration-checker'],
    additionalFaqs: [
      f(
        'If my EKG in the past was normal, am I safe forever?',
        'No. Tests reflect a moment in time; new symptoms can warrant new evaluation.',
      ),
      f(
        'Can heart symptoms feel like indigestion?',
        'Sometimes. That overlap is why concerning patterns should be evaluated rather than explained away online.',
      ),
      f(
        'Should I take aspirin on my own for chest pressure?',
        'Only if directed by emergency services or a clinician familiar with your history—aspirin is not universally appropriate.',
      ),
    ],
  },
  fatigue: {
    introSecondary:
      'Fatigue is not laziness. It can accompany sleep debt, mood changes, infections, anemia, thyroid disorders, medication side effects, autoimmune illness, cardiovascular problems, chronic pain, and more—but thoughtful history usually comes before expensive testing. The goal of education here is to help you distinguish “I need better sleep hygiene for two weeks” from “this is progressively limiting my work and needs evaluation,” without pretending a webpage can triage that boundary perfectly for you.',
    deepDiveParagraphs: block(
      'Sleep quantity vs sleep quality',
      'Some people spend enough hours in bed yet wake unrested due to insomnia architecture, snoring, shift work, substances, or stress. Others simply don’t allow enough sleep opportunity. A two-week journal of bedtime, wake time, caffeine, exercise, alcohol, and major stressors often makes primary care visits more productive than a vague “I’m tired.”',
      'Post-viral fatigue and deconditioning',
      'Recovery timelines vary widely after illness. Mild fatigue during return-to-activity can be common, but red flags like worsening breathlessness, chest pain, fainting, confusion, or persistent high fevers should not be normalized by an educational article.',
      'Mood, stress, and fatigue loops',
      'Depression and anxiety can disrupt sleep and daytime drive, while fatigue itself can worsen mood. Clinicians may explore both sides without minimizing either “physical” or “mental” contributors—because the nervous system connects them.',
    ),
    clinicianQuestions: [
      'When did fatigue begin—suddenly or gradually?',
      'Is there prominent sleepiness vs muscle weakness vs brain fog?',
      'Any weight change, night sweats, fevers, or swollen lymph nodes?',
      'Are periods unusually heavy, or could pregnancy be relevant?',
      'Any new medications, dose changes, or substance use changes?',
      'Do you snore, choke at night, or fall asleep unintentionally in the daytime?',
      'Any shortness of breath on exertion, chest pain, palpitations, or leg swelling?',
      'How is fatigue affecting work, driving safety, and relationships?',
    ],
    trackAtHome: [
      'Sleep/wake schedule consistency across 10–14 days.',
      'Daytime caffeine timing and any afternoon crashes.',
      'Exercise tolerance compared with your baseline.',
      'Hydration and meal regularity if you suspect low intake.',
      'Fevers you can measure and any infection symptoms.',
    ],
    relatedGuideSlugs: ['why-am-i-always-tired', 'signs-of-dehydration', 'anxiety-vs-panic-attack'],
    relatedToolSlugs: ['sleep-quality-checker', 'hydration-checker', 'stress-self-assessment'],
    additionalFaqs: [
      f(
        'Will blood tests always find the cause?',
        'Not always. Tests follow the interview and exam; otherwise results can be misleading or unnecessarily broad.',
      ),
      f(
        'Can iron deficiency happen without obvious bleeding?',
        'Yes, but evaluation depends on risk factors and clinician judgment—don’t self-treat high-dose iron.',
      ),
      f(
        'Is “adrenal fatigue” a formal diagnosis?',
        'That phrase is popular online but not a standard endocrine diagnosis; clinicians look for specific disorders instead.',
      ),
    ],
  },
  rash: {
    introSecondary:
      'Rashes are visual diagnoses more often than text diagnoses. Education helps you note border patterns, symmetry, itch intensity, mucous membrane involvement, and systemic symptoms like fever—because those details guide urgency. If a rash appears with trouble breathing, facial/throat swelling, rapidly spreading bruise-like spots, or if you feel very ill, prioritize emergency evaluation rather than browsing.',
    deepDiveParagraphs: block(
      'Pattern recognition is a clinician skill',
      'Words like “scaly,” “raised,” “blanching,” “vesicular,” or “hive-like” help, but photos in secure clinical systems plus exam often outperform lay descriptions alone.',
      'Medication and product triggers',
      'New prescriptions, supplements, skincare changes, and detergents can matter. Bring a list of start dates, even if you think a product is benign.',
      'Infection considerations',
      'Some rashes accompany strep, viral illnesses, or tick exposure histories. Travel, pet exposures, and occupational contacts can matter.',
    ),
    clinicianQuestions: [
      'When did the rash start, and has it spread or changed character?',
      'Is it itchy, painful, or mostly asymptomatic?',
      'Any fever, joint pain, mouth sores, eye redness, or genital involvement?',
      'Anyone else at home affected, or known exposures?',
      'New foods, products, plants, trips, pets, or insect bites?',
      'New medicines in the last 8 weeks?',
    ],
    trackAtHome: [
      'Daily photos in consistent lighting (for your clinician), if safe and private.',
      'List of products touching skin during the window before onset.',
      'Itch severity 0–10 and what helps temporarily.',
      'Fever curve if applicable.',
    ],
    relatedGuideSlugs: ['when-to-go-to-er', 'signs-of-dehydration'],
    relatedToolSlugs: ['symptom-urgency-checker', 'hydration-checker'],
    additionalFaqs: [
      f(
        'Should I use steroid cream on any rash?',
        'Not always; some rashes worsen with steroids. Ask a clinician unless you’re following known personal guidance.',
      ),
      f(
        'Can stress cause hives?',
        'Sometimes triggers are identifiable; other times not—still worth discussing if recurrent.',
      ),
      f(
        'Is all cellulitis an emergency?',
        'Rapidly spreading warmth with fever can be—seek timely evaluation rather than guessing.',
      ),
    ],
  },
  dizziness: {
    introSecondary:
      'Splitting “dizzy” into faint sensations, spinning vertigo, or unsteady walking helps clinicians—but education is not a substitution for evaluating new severe neurologic symptoms, chest pain, or palpitations. If you nearly lose consciousness while driving, do not drive until a clinician clears you.',
    deepDiveParagraphs: block(
      'Orthostatic changes',
      'Standing up quickly can produce brief dimming vision with lightheadedness when volume is low, illness exists, or medications affect blood pressure. Extremely abrupt, sustained symptoms deserve clinician review.',
      'Inner ear histories',
      'Sudden spinning with nausea may relate to inner-ear issues in some cases, but other serious conditions can coexist—especially if neurologic signs appear.',
      'Medication and cardiac overlap',
      'Heart rhythm issues can present as dizziness or near-fainting; associated chest symptoms elevate urgency.',
    ),
    clinicianQuestions: [
      'Does it feel like spinning, faintness, or imbalance?',
      'How long do episodes last—seconds, minutes, hours?',
      'Any hearing loss, ear fullness, or ringing?',
      'Any headache, neck pain, vision changes, weakness, numbness, or slurred speech?',
      'New medications or dose changes?',
      'Recent illness, virus, or head injury?',
    ],
    trackAtHome: [
      'Episode timing relative to meals, standing, and sleep.',
      'Hydration that day and heat exposure.',
      'Associated palpitations or chest discomfort.',
      'Whether movement of the head triggers spinning (a clue for clinicians, not a self-diagnosis).',
    ],
    relatedGuideSlugs: ['why-am-i-dizzy', 'signs-of-dehydration', 'headache-warning-signs'],
    relatedToolSlugs: ['hydration-checker', 'symptom-urgency-checker', 'headache-pattern-guide'],
    additionalFaqs: [
      f(
        'Is positional dizziness always benign?',
        'Not necessarily. New neurologic symptoms should be evaluated.',
      ),
      f(
        'Can anxiety cause dizziness?',
        'Yes, but clinicians often consider other causes when symptoms are new or severe.',
      ),
      f(
        'Should I self-treat with meclizine?',
        'Ask a clinician or pharmacist—side effects and interactions vary.',
      ),
    ],
  },
  dehydration: {
    introSecondary:
      'Hydration is not only about water—it includes electrolytes, illness-related losses, and individual medical conditions. Older adults and young children can become volume depleted with quieter symptoms. Education helps you recognize when conservative oral rehydration is discussed versus when clinician-guided care is needed for persistent vomiting, minimal urine, confusion, or severe abdominal pain.',
    deepDiveParagraphs: block(
      'Heat and exertion contexts',
      'Training in heat increases sweat losses. Thirst lags behind for some people; pacing, shade, and breaks matter. Still, exertional chest symptoms or confusion are not “just dehydration” until evaluated appropriately.',
      'GI illnesses',
      'Stomach viruses can shift fluid and electrolytes quickly. The ability to keep down small sips is a practical marker families track—yet inability to retain fluids pushes timelines toward urgent care in many cases.',
      'Chronic conditions',
      'Kidney disease, heart failure, and diuretic use complicate fluid advice—individualized clinician guidance matters.',
    ),
    clinicianQuestions: [
      'How many wet diapers or urinations in the last day (pediatrics/adults as relevant)?',
      'Any vomiting, diarrhea, blood in stool, or inability to drink?',
      'Heat exposure, travel, or intense exercise?',
      'Current medications, especially diuretics or BP meds?',
      'Associated dizziness, chest pain, confusion, or severe abdominal pain?',
    ],
    trackAtHome: [
      'Fluid intake types and rough volumes if you’re tracking intentionally.',
      'Urine color as one clue among many (not definitive).',
      'Orthostatic symptoms: dizzy within minutes of standing.',
      'Weight change during illness if you have a scale and baseline.',
    ],
    relatedGuideSlugs: ['signs-of-dehydration', 'why-am-i-dizzy', 'shortness-of-breath-causes'],
    relatedToolSlugs: ['hydration-checker', 'symptom-urgency-checker'],
    additionalFaqs: [
      f(
        'Are sports drinks always better than water?',
        'Not for everyone; some people need medical guidance on sugar and electrolytes.',
      ),
      f(
        'Can dehydration raise heart rate?',
        'Sometimes clinicians see compensatory changes—but don’t self-diagnose dangerous causes away.',
      ),
      f(
        'When is IV fluids needed?',
        'Depends on severity and diagnosis; urgent clinics/hospitals decide.',
      ),
    ],
  },
  headache: {
    introSecondary:
      'Headaches can be tension-type, migraine spectrum, sinus-pressure overlaps, medication-overuse patterns, vision-related strain contributors, and—less commonly—dangerous secondary causes. Education should make “red flags” memorable without training you to panic at every pain. Sudden thunderclap headache, new neurologic deficits, fever with stiff neck, or pregnancy-related severe headache warrant urgent pathways.',
    deepDiveParagraphs: block(
      'Migraine patterns',
      'Many people learn their personal premonitory symptoms, triggers, and escalation timeline. New baseline changes or “first worst headache” deserve professional attention even if prior migraines existed.',
      'Medication overuse',
      'Frequent OTC analgesics can contribute to chronic headache in some people—clinicians can help create safer plans.',
      'Vision and ergonomics',
      'Eye strain is real but not the explanation for every severe headache—still worth vision checks when relevant.',
    ),
    clinicianQuestions: [
      'Onset speed: gradual build vs sudden thunderclap?',
      'Location, quality, severity 0–10, duration, and recurrence pattern.',
      'Photophobia, phonophobia, nausea, aura symptoms?',
      'Recent head injury, new medications, pregnancy/postpartum status?',
      'Fever, neck stiffness, rash, or immune compromise?',
      'Worst headache of life?',
    ],
    trackAtHome: [
      'Simple diary: sleep, caffeine, menstruation, stress, travel, weather.',
      'Medication days per week for pain relief.',
      'Associated vision changes or speech issues (seek urgent care if new).',
    ],
    relatedGuideSlugs: ['headache-warning-signs', 'why-am-i-dizzy', 'signs-of-dehydration'],
    relatedToolSlugs: ['headache-pattern-guide', 'hydration-checker', 'blood-pressure-guide'],
    additionalFaqs: [
      f(
        'When is imaging needed?',
        'Clinicians decide based on red flags—not generic online rules.',
      ),
      f(
        'Can high blood pressure cause headache?',
        'Sometimes, but not always; severe headache with very high BP is urgent.',
      ),
      f(
        'Is caffeine good or bad for headaches?',
        'Context-dependent; withdrawal can also trigger headaches.',
      ),
    ],
  },
  'shortness-of-breath': {
    introSecondary:
      'Breathlessness can be subtle—needing extra pillows at night—or unmistakable—unable to speak full sentences. Because pulmonary embolism, asthma exacerbation, heart failure patterns, pneumonias, anemia, and anxiety-related hyperventilation can overlap, education emphasizes conservative urgency for new severe symptoms and careful preparation for routine visits when symptoms are mild and stable.',
    deepDiveParagraphs: block(
      'Exertional patterns',
      'Out-of-shape exertion differs from abrupt loss of tolerance compared with last month. That comparison matters to clinicians.',
      'Nocturnal symptoms',
      'Orthopnea or waking breathless can prompt specific clinician questions—mention them clearly.',
      'Allergic and environmental triggers',
      'Smoke, dust, seasonal triggers, and recent exposures belong in your story.',
    ),
    clinicianQuestions: [
      'Sudden vs gradual onset? Any travel, surgery, immobilization, or pregnancy?',
      'Chest pain, palpitations, fainting, leg swelling, or coughing blood?',
      'Wheeze, fever, cough, recent infection?',
      'History of asthma/COPD/sleep apnea?',
      'Can you speak full sentences at rest?',
    ],
    trackAtHome: [
      'Peak flow diary only if clinician instructed you to monitor.',
      'Temperature and oxygen saturation if you have a reliable pulse oximeter—interpret with professional guidance.',
      'Sleep position changes that help or worsen breathlessness.',
    ],
    relatedGuideSlugs: ['shortness-of-breath-causes', 'when-to-go-to-er', 'anxiety-vs-panic-attack'],
    relatedToolSlugs: ['symptom-urgency-checker', 'stress-self-assessment'],
    additionalFaqs: [
      f(
        'If I have asthma, can I assume all SOB is asthma?',
        'Not if the pattern changes; overlap exists with other emergencies.',
      ),
      f(
        'Should friends/family wait if someone looks “okay”?',
        'Rapidly worsening breathing deserves urgent evaluation.',
      ),
      f(
        'Can anemia cause shortness of breath?',
        'Possible—clinicians explore with appropriate testing.',
      ),
    ],
  },
  'anxiety-symptoms': {
    introSecondary:
      'Anxiety can present with chest tightness, tingling, GI upset, dizziness, and hyperventilation. The goal is not to label valid suffering as imaginary—it is to use accurate language, reduce stigma, and maintain safety: new severe chest symptoms still deserve medical evaluation even if you have anxiety history.',
    deepDiveParagraphs: block(
      'Autonomic arousal',
      'Fast heart rate, tremor, and sweating can occur in panic surges and in medical conditions—context and evaluation matter.',
      'Behavioral patterns',
      'Avoidance can shrink life spaces; clinicians and therapists can help with graded approaches when appropriate.',
      'Sleep interplay',
      'Poor sleep amplifies daytime worry loops; see fatigue and sleep resources cross-linked from this page.',
    ),
    clinicianQuestions: [
      'How long have symptoms persisted, and how do they affect function?',
      'Substance use: caffeine, nicotine, alcohol, cannabis, stimulants?',
      'Prior anxiety/panic diagnoses and prior treatments?',
      'Suicidal thoughts—if present, crisis care is the priority pathway.',
      'Associated chest pain exertional features or fainting?',
    ],
    trackAtHome: [
      'Sleep and caffeine timing for two weeks.',
      'Episode frequency, duration, known triggers.',
      'What skills help even a little (breathing, cold water splash, grounding) without delaying needed care.',
    ],
    relatedGuideSlugs: ['anxiety-vs-panic-attack', 'stress-vs-heart-problem', 'why-am-i-always-tired'],
    relatedToolSlugs: ['stress-self-assessment', 'symptom-urgency-checker', 'sleep-quality-checker'],
    additionalFaqs: [
      f(
        'Is therapy or medication “better”?',
        'Often individualized; many people use both.',
      ),
      f(
        'Can breathing exercises worsen panic for some people?',
        'Technique matters; clinicians can tailor approaches.',
      ),
      f(
        'Does having anxiety mean I’m exaggerating?',
        'No. It means your nervous system needs skilled support.',
      ),
    ],
  },
  'blood-pressure': {
    introSecondary:
      'Blood pressure readings reflect cardiovascular load at a moment, influenced by cuff fit, arm position, caffeine, pain, stress, and even talking during measurement. Education helps you build reliable home logs so clinicians can interpret trends instead of reacting to a single number taken incorrectly.',
    deepDiveParagraphs: block(
      'Technique details',
      'Feet flat, back supported, arm at heart level, correct cuff bladder covering most of the upper arm, resting quietly five minutes—small breaks in technique create misleading highs.',
      'White coat effect',
      'Some people read higher in clinics; home logs help—but severe symptoms trump “it’s probably anxiety.”',
      'Secondary contributors',
      'Sleep apnea, kidney issues, endocrine conditions, medications, and pain can participate—clinicians explore when appropriate.',
    ),
    clinicianQuestions: [
      'Do you have home readings with dates/times and technique notes?',
      'Any headache, vision changes, chest pain, or neurologic symptoms with elevated readings?',
      'Pregnancy or postpartum status?',
      'Snoring and daytime sleepiness?',
      'Kidney disease, diabetes, or prior cardiac history?',
    ],
    trackAtHome: [
      'Twice-daily readings for a week if your clinician wants a baseline (follow their schedule).',
      'Note sleep quality, caffeine, and pain that day.',
      'Bring cuff size and device model to visits.',
    ],
    relatedGuideSlugs: ['understanding-blood-pressure', 'headache-warning-signs', 'stress-vs-heart-problem'],
    relatedToolSlugs: ['blood-pressure-guide', 'stress-self-assessment', 'sleep-quality-checker'],
    additionalFaqs: [
      f(
        'Should I stop salt entirely?',
        'Diets vary; clinicians personalize guidance—especially with kidney or heart conditions.',
      ),
      f(
        'Can anxiety raise BP in the office only?',
        'Possible—home logs help clarify, but don’t dismiss dangerous symptoms.',
      ),
      f(
        'Are wrist cuffs fine?',
        'Some are less reliable; ask what device class fits your situation.',
      ),
    ],
  },
  'urgent-symptom-checker': {
    introSecondary:
      'This page exists to keep expectations clear: DoctorAIBolit is for private educational chat and reading—not dispatch, not vitals monitoring, not guaranteed response times. That transparency is a safety feature. After emergencies resolve, chat can still help you understand terminology, organize timelines, and prepare better questions for follow-up visits.',
    deepDiveParagraphs: block(
      'Why online tools cannot “clear” emergencies',
      'Triage algorithms used in healthcare settings are validated and supervised; consumer websites cannot replicate clinician observation, labs, imaging, or regional emergency systems access.',
      'Preparation still matters',
      'Many patients forget half their symptoms in a 12-minute visit; rehearsal can improve communication without replacing care.',
      'Children and vulnerable adults',
      'Care thresholds differ—when unsure, err toward hands-on evaluation.',
    ),
    clinicianQuestions: [
      'What symptom worries you most right now, in one sentence?',
      'When did it begin, and is it improving or worsening?',
      'Have you had fainting, confusion, trouble breathing, or severe pain?',
      'Are you alone or do you have support to get to care safely?',
    ],
    trackAtHome: [
      'Local emergency numbers saved on your phone.',
      'List of current medications and allergies for any urgent visit.',
      'If stable: timeline notes of the episode for later appointments.',
    ],
    relatedGuideSlugs: ['when-to-go-to-er', 'headache-warning-signs', 'chest-pain-after-workout'],
    relatedToolSlugs: ['symptom-urgency-checker', 'hydration-checker'],
    additionalFaqs: [
      f(
        'Can I use chat internationally?',
        'Emergency systems and standards differ; local resources apply.',
      ),
      f(
        'If I disagree with the assistant’s wording, what should I do?',
        'Trust real-world licensed care for decisions affecting safety.',
      ),
      f(
        'Can I export chat for clinicians?',
        'Follow product capabilities; treat exports as personal health information.',
      ),
    ],
  },
} as const satisfies Record<string, SymptomEnrichmentEntry>
