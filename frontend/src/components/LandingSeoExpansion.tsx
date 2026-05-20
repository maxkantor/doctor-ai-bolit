import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { GUIDE_SLUGS, getGuideBySlug } from '../data/guides'
import { TOOL_SLUGS, getToolBySlug } from '../data/tools'
import { CONDITION_SLUGS } from '../data/conditions'
import { FAQ_TOPIC_SLUGS, getFaqTopicBySlug } from '../data/faqs'
import '../pages/LandingPage.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
}

export default function LandingSeoExpansion() {
  const trending = [
    { q: 'Chest pain after exercise—when is it muscular vs something urgent?', to: '/guides/chest-pain-after-workout' },
    { q: 'Why am I dizzy when I stand up?', to: '/guides/why-am-i-dizzy' },
    { q: 'Anxiety sensations vs heart symptoms', to: '/guides/stress-vs-heart-problem' },
    { q: 'Dehydration clues that are easy to miss', to: '/guides/signs-of-dehydration' },
    { q: 'Shortness of breath: broad categories', to: '/guides/shortness-of-breath-causes' },
    { q: 'Headache warning signs worth knowing', to: '/guides/headache-warning-signs' },
  ]

  const clusters = [
    {
      title: 'Chest pressure cluster',
      links: [
        { label: 'Chest pain symptom guide', to: '/symptoms/chest-pain' },
        { label: 'After-workout guide', to: '/guides/chest-pain-after-workout' },
        { label: 'Stress vs heart guide', to: '/guides/stress-vs-heart-problem' },
        { label: 'Urgency reflection tool', to: '/tools/symptom-urgency-checker' },
      ],
    },
    {
      title: 'Breathing & anxiety cluster',
      links: [
        { label: 'Shortness of breath', to: '/symptoms/shortness-of-breath' },
        { label: 'Anxiety symptoms hub', to: '/symptoms/anxiety-symptoms' },
        { label: 'Anxiety vs panic guide', to: '/guides/anxiety-vs-panic-attack' },
        { label: 'Stress self-assessment', to: '/tools/stress-self-assessment' },
      ],
    },
    {
      title: 'Hydration & headache cluster',
      links: [
        { label: 'Dehydration education', to: '/symptoms/dehydration' },
        { label: 'Hydration reflection tool', to: '/tools/hydration-checker' },
        { label: 'Headache guide', to: '/symptoms/headache' },
        { label: 'Headache pattern explorer', to: '/tools/headache-pattern-guide' },
      ],
    },
  ]

  const faqPick = FAQ_TOPIC_SLUGS.map((s) => getFaqTopicBySlug(s)!).filter(Boolean).slice(0, 4)

  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const categoryLabel = (slug: (typeof CONDITION_SLUGS)[number]) => {
    if (slug === 'pain') return 'Pain'
    if (slug === 'breathing') return 'Breathing'
    if (slug === 'skin') return 'Skin'
    if (slug === 'stress') return 'Stress'
    if (slug === 'fatigue') return 'Fatigue'
    return 'Hydration'
  }

  return (
    <div ref={ref} className="landing-seo-expansion" aria-label="Health education resources">
      <motion.section
        className="landing-seo-section"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={fadeInUp}
      >
        <h2 className="section-title landing-seo-title">Trending health questions</h2>
        <p className="landing-seo-subtitle">Guides you can read before a private chat—calm and mobile-first.</p>
        <div className="landing-seo-pills">
          {trending.map((item) => (
            <Link key={item.to} to={item.to} className="landing-seo-pill">
              {item.q}
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="landing-seo-section"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={fadeInUp}
      >
        <h2 className="section-title landing-seo-title">Common symptom categories</h2>
        <p className="landing-seo-subtitle">Pain, breathing, skin, stress, fatigue, and hydration—education only.</p>
        <div className="landing-seo-grid">
          {CONDITION_SLUGS.map((slug) => (
            <Link key={slug} to={`/conditions/${slug}`} className="landing-seo-card">
              <span className="landing-seo-card-kicker">Explore</span>
              <span className="landing-seo-card-title">{categoryLabel(slug)}</span>
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="landing-seo-section"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={fadeInUp}
      >
        <h2 className="section-title landing-seo-title">Health guides</h2>
        <p className="landing-seo-subtitle">Structured articles with FAQs and conservative emergency language.</p>
        <div className="landing-seo-grid">
          {GUIDE_SLUGS.map((slug) => {
            const g = getGuideBySlug(slug)
            if (!g) return null
            return (
              <Link key={slug} to={g.route} className="landing-seo-card">
                <span className="landing-seo-card-kicker">Guide</span>
                <span className="landing-seo-card-title">{g.h1}</span>
              </Link>
            )
          })}
        </div>
        <div className="landing-seo-row-link">
          <Link to="/guides">View all guides</Link>
        </div>
      </motion.section>

      <motion.section
        className="landing-seo-section"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={fadeInUp}
      >
        <h2 className="section-title landing-seo-title">Free health tools</h2>
        <p className="landing-seo-subtitle">Lightweight interactions—pair with symptom pages and real-world care.</p>
        <div className="landing-seo-grid">
          {TOOL_SLUGS.map((slug) => {
            const t = getToolBySlug(slug)
            if (!t) return null
            return (
              <Link key={slug} to={t.route} className="landing-seo-card">
                <span className="landing-seo-card-kicker">Tool</span>
                <span className="landing-seo-card-title">{t.label}</span>
              </Link>
            )
          })}
        </div>
        <div className="landing-seo-row-link">
          <Link to="/tools">View all tools</Link>
        </div>
      </motion.section>

      <motion.section
        className="landing-seo-section"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={fadeInUp}
      >
        <h2 className="section-title landing-seo-title">Frequently asked questions</h2>
        <p className="landing-seo-subtitle">Transparency on chat limits, privacy, emergencies, and credits.</p>
        <div className="landing-seo-grid">
          {faqPick.map((f) => (
            <Link key={f.slug} to={f.route} className="landing-seo-card">
              <span className="landing-seo-card-kicker">FAQ</span>
              <span className="landing-seo-card-title">{f.h1}</span>
            </Link>
          ))}
        </div>
        <div className="landing-seo-row-link">
          <Link to="/faq">All FAQ topics</Link>
        </div>
      </motion.section>

      <motion.section
        className="landing-seo-section"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={fadeInUp}
      >
        <h2 className="section-title landing-seo-title">Related symptom clusters</h2>
        <p className="landing-seo-subtitle">Crosslinks that mirror how people actually search—without clutter.</p>
        <div className="landing-seo-clusters">
          {clusters.map((c) => (
            <div key={c.title} className="landing-seo-cluster">
              <h3 className="landing-seo-cluster-title">{c.title}</h3>
              <ul className="landing-seo-cluster-list">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
