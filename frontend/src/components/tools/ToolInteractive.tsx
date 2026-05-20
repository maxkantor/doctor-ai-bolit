import { useMemo, useState, type ReactNode } from 'react'
import type { ToolSlug } from '../../data/tools'
import '../symptoms/SymptomsPages.css'

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      className="symptom-content-card"
      style={{ marginTop: '0.75rem', paddingBottom: '1rem' }}
    >
      {children}
    </div>
  )
}

export default function ToolInteractive({ slug }: { slug: ToolSlug }) {
  if (slug === 'hydration-checker') return <HydrationChecker />
  if (slug === 'stress-self-assessment') return <StressAssessment />
  if (slug === 'blood-pressure-guide') return <BloodPressureGuide />
  if (slug === 'headache-pattern-guide') return <HeadachePatternGuide />
  if (slug === 'symptom-urgency-checker') return <SymptomUrgencyChecker />
  if (slug === 'sleep-quality-checker') return <SleepQualityChecker />
  return null
}

function HydrationChecker() {
  const [glasses, setGlasses] = useState(4)
  const [heat, setHeat] = useState(false)
  const [exercise, setExercise] = useState<'light' | 'moderate' | 'heavy'>('moderate')

  const tip = useMemo(() => {
    if (glasses < 3) {
      return 'You noted relatively low fluids today (education only). If you feel dizzy, very dry, or ill, prioritize clinician guidance—especially with vomiting or fever.'
    }
    if (heat && glasses < 6) {
      return 'Heat and sweat increase needs for many people. Pair fluids with breaks, shade, and awareness of other symptoms like confusion or chest pain.'
    }
    if (exercise === 'heavy' && glasses < 6) {
      return 'Heavier training days often need more fluid planning—your clinician can personalize targets if you have kidney or heart conditions.'
    }
    return 'Your inputs look compatible with common “maintenance” patterns for many healthy adults—still not personalized advice. Track how you feel on your feet and after standing.'
  }, [glasses, heat, exercise])

  return (
    <Card>
      <h2 className="sr-only">Hydration reflection inputs</h2>
      <label style={{ display: 'block', marginBottom: '0.75rem' }}>
        <span>Rough non-alcoholic drinks today (8oz / ~240ml units): {glasses}</span>
        <input type="range" min={0} max={12} value={glasses} onChange={(e) => setGlasses(Number(e.target.value))} style={{ width: '100%' }} />
      </label>
      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
        <input type="checkbox" checked={heat} onChange={() => setHeat(!heat)} />
        Significant heat exposure / sweating today
      </label>
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Training load</legend>
        <label style={{ marginRight: '0.75rem' }}>
          <input type="radio" name="ex" checked={exercise === 'light'} onChange={() => setExercise('light')} /> Light
        </label>
        <label style={{ marginRight: '0.75rem' }}>
          <input type="radio" name="ex" checked={exercise === 'moderate'} onChange={() => setExercise('moderate')} /> Moderate
        </label>
        <label>
          <input type="radio" name="ex" checked={exercise === 'heavy'} onChange={() => setExercise('heavy')} /> Heavy
        </label>
      </fieldset>
      <p style={{ marginTop: '0.75rem' }}>{tip}</p>
    </Card>
  )
}

function StressAssessment() {
  const [q, setQ] = useState([3, 3, 3, 3, 3])
  const labels = ['Sleep quality (past week)', 'Muscle tension / jaw clenching', 'Racing thoughts', 'Focus at work/school', 'Recovery after stress spikes']
  const score = q.reduce((a, b) => a + b, 0)

  const band =
    score <= 12
      ? 'Lower reported load band (educational). Still mention persistent symptoms to a clinician.'
      : score <= 18
        ? 'Middle band (educational). Worth tracking triggers and scheduling routine support if this is weeks-long.'
        : 'Higher band (educational). If symptoms affect safety, sleep, or mood severely, prioritize professional care.'

  return (
    <Card>
      <h2 className="sr-only">Stress reflection</h2>
      {labels.map((lab, i) => (
        <label key={lab} style={{ display: 'block', marginBottom: '0.85rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{lab}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Milder</span>
            <span>Stronger</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={q[i]}
            onChange={(e) => {
              const n = [...q]
              n[i] = Number(e.target.value)
              setQ(n)
            }}
            style={{ width: '100%' }}
          />
        </label>
      ))}
      <p>
        <strong>Educational score (not clinical):</strong> {score}/25 — {band}
      </p>
    </Card>
  )
}

function BloodPressureGuide() {
  const [rested, setRested] = useState(false)
  const [armSupported, setArmSupported] = useState(false)
  const [quiet, setQuiet] = useState(false)
  const [cuffFit, setCuffFit] = useState<'unsure' | 'ok'>('unsure')

  const ready = rested && armSupported && quiet && cuffFit === 'ok'

  return (
    <Card>
      <h2 className="sr-only">Home blood pressure technique checklist</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <CheckRow label="5+ minutes seated quietly before first reading" checked={rested} onToggle={() => setRested(!rested)} />
        <CheckRow label="Arm supported at heart level; feet flat; back supported" checked={armSupported} onToggle={() => setArmSupported(!armSupported)} />
        <CheckRow label="No talking during the measurement" checked={quiet} onToggle={() => setQuiet(!quiet)} />
      </ul>
      <label style={{ display: 'block', marginTop: '0.75rem' }}>
        Cuff fit confidence
        <select value={cuffFit} onChange={(e) => setCuffFit(e.target.value as 'ok' | 'unsure')} style={{ marginLeft: '0.5rem' }}>
          <option value="unsure">Not sure / needs check</option>
          <option value="ok">Clinician said cuff size OK</option>
        </select>
      </label>
      <p style={{ marginTop: '0.75rem' }}>
        {ready
          ? 'Technique checklist looks closer to common home-monitoring teaching (education only). Log date/time and bring device info to visits.'
          : 'Improving technique prevents false highs (education). If you have severe symptoms with high readings, seek urgent care—not online tips.'}
      </p>
    </Card>
  )
}

function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <li style={{ marginBottom: '0.55rem' }}>
      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <span>{label}</span>
      </label>
    </li>
  )
}

function HeadachePatternGuide() {
  const [pattern, setPattern] = useState<'tension' | 'migraine' | 'sinus' | 'unsure'>('unsure')

  const msg =
    pattern === 'tension'
      ? 'Bilateral pressure with neck/temple tightness is a common way people describe tension-type patterns—still not a diagnosis. Track sleep, caffeine, and stress; seek care for sudden severe headache or neurologic symptoms.'
      : pattern === 'migraine'
        ? 'One-sided throbbing with nausea or light sensitivity fits descriptions many clinicians associate with migraine spectrum—but confirmation requires evaluation, especially for new changes.'
        : pattern === 'sinus'
          ? 'Face pressure with congestion can overlap with other headaches; fever, focal neurologic signs, or stiff neck need urgent attention.'
          : 'Choose the closest pattern to rehearse language for your visit. “Unsure” is a valid place to start—clinicians expect that.'

  return (
    <Card>
      <h2 className="sr-only">Headache pattern explorer</h2>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
        Which description is closest today?
        <select value={pattern} onChange={(e) => setPattern(e.target.value as typeof pattern)} style={{ display: 'block', marginTop: '0.35rem' }}>
          <option value="unsure">Not sure / mixed</option>
          <option value="tension">Band-like pressure, neck/scalp tightness</option>
          <option value="migraine">Throb worse with activity; nausea/light sensitivity</option>
          <option value="sinus">Face pressure with congestion symptoms</option>
        </select>
      </label>
      <p>{msg}</p>
    </Card>
  )
}

function SymptomUrgencyChecker() {
  const [step, setStep] = useState(0)
  const [severe, setSevere] = useState<boolean | null>(null)
  const [neuro, setNeuro] = useState<boolean | null>(null)

  if (step === 0) {
    return (
      <Card>
        <h2 className="sr-only">Urgency reflection</h2>
        <p>Are symptoms severe, rapidly worsening, or unlike anything you’ve felt before?</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="symptom-cta" style={{ border: 'none', cursor: 'pointer' }} onClick={() => { setSevere(true); setStep(1) }}>
            Yes / unsure — prioritize urgent care
          </button>
          <button type="button" className="symptom-cta" style={{ border: 'none', cursor: 'pointer', background: '#0f172a' }} onClick={() => { setSevere(false); setStep(2) }}>
            No — mild and stable
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.75rem' }}>This flow is educational only—not triage.</p>
      </Card>
    )
  }

  if (step === 1) {
    return (
      <Card>
        <h2 className="sr-only">Urgent pathway education</h2>
        <p>
          Conservative guidance: contact emergency services or the appropriate urgent pathway for your region. Online tools cannot observe you or measure vitals.
        </p>
        <button type="button" className="symptom-cta" style={{ border: 'none', cursor: 'pointer', background: '#0f172a' }} onClick={() => { setStep(0); setSevere(null); setNeuro(null) }}>
          Reset (educational demo)
        </button>
      </Card>
    )
  }

  // step 2 mild
  if (neuro === null) {
    return (
      <Card>
        <h2 className="sr-only">Neurologic red flags education</h2>
        <p>Any new trouble speaking, weakness on one side, vision loss, or confusion?</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="symptom-cta" style={{ border: 'none', cursor: 'pointer' }} onClick={() => setNeuro(true)}>
            Yes / unsure — urgent evaluation
          </button>
          <button type="button" className="symptom-cta" style={{ border: 'none', cursor: 'pointer', background: '#0f172a' }} onClick={() => setNeuro(false)}>
            No
          </button>
        </div>
      </Card>
    )
  }

  if (neuro) {
    return (
      <Card>
        <p>Seek urgent evaluation for possible neurologic emergency symptoms—this page cannot rule them out.</p>
        <button type="button" className="symptom-cta" style={{ border: 'none', cursor: 'pointer', background: '#0f172a' }} onClick={() => { setStep(0); setSevere(null); setNeuro(null) }}>
          Reset
        </button>
      </Card>
    )
  }

  return (
    <Card>
      <p>
        If symptoms remain mild and stable, consider routine care scheduling and use guides/chat to prepare—but return for urgent evaluation if anything escalates.
      </p>
      <button type="button" className="symptom-cta" style={{ border: 'none', cursor: 'pointer', background: '#0f172a' }} onClick={() => { setStep(0); setSevere(null); setNeuro(null) }}>
        Reset
      </button>
    </Card>
  )
}

function SleepQualityChecker() {
  const [latency, setLatency] = useState(2)
  const [wakeups, setWakeups] = useState(2)
  const [daySleepy, setDaySleepy] = useState(2)
  const [routine, setRoutine] = useState(2)
  const score = latency + wakeups + daySleepy + routine

  const note =
    score <= 8
      ? 'Lower concern band (educational). If you feel rested and safe, keep gentle routines.'
      : score <= 14
        ? 'Middle band—worth discussing if persistent for weeks or affecting driving.'
        : 'Higher band—consider clinician guidance, especially with snoring, choking at night, or unsafe sleepiness.'

  return (
    <Card>
      <h2 className="sr-only">Sleep reflection</h2>
      <Range label="Time to fall asleep (higher = longer)" value={latency} set={setLatency} />
      <Range label="Night awakenings (higher = more)" value={wakeups} set={setWakeups} />
      <Range label="Daytime sleepiness" value={daySleepy} set={setDaySleepy} />
      <Range label="Irregular schedule / social jetlag" value={routine} set={setRoutine} />
      <p>
        <strong>Educational sum:</strong> {score}/20 — {note}
      </p>
    </Card>
  )
}

function Range({ label, value, set }: { label: string; value: number; set: (n: number) => void }) {
  return (
    <label style={{ display: 'block', marginBottom: '0.75rem' }}>
      <div style={{ fontWeight: 600 }}>{label}</div>
      <input type="range" min={1} max={5} value={value} onChange={(e) => set(Number(e.target.value))} style={{ width: '100%' }} />
    </label>
  )
}
