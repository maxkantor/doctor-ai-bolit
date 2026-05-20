import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { getAllSymptomPages } from '../data/symptomPages'
import '../components/symptoms/SymptomsPages.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
}

/**
 * Below-the-fold symptom hub links; keeps spacing generous so the hero stays visually primary.
 */
export default function PopularSymptomsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const pages = getAllSymptomPages()

  return (
    <section
      ref={ref}
      className="popular-symptom-checks"
      aria-labelledby="popular-symptoms-title"
    >
      <motion.h2
        id="popular-symptoms-title"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={fadeInUp}
      >
        Popular Symptom Checks
      </motion.h2>
      <motion.p
        className="subtitle"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={fadeInUp}
      >
        Explore common symptoms and warning signs before starting a private AI health chat.
      </motion.p>
      <motion.div
        className="popular-symptom-grid"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={{
          hidden: {},
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
          },
        }}
      >
        {pages.map((p) => (
          <motion.div key={p.slug} variants={fadeInUp}>
            <Link to={p.route} className="popular-symptom-card">
              {p.label}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
