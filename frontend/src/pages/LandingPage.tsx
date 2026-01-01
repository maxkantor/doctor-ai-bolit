import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { pricingService } from '../services/pricingService'
import { PricingPlan, PricingConfig } from '../types'
import './LandingPage.css'

export default function LandingPage() {
  // Show default pricing immediately for fast loading
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({ freeMessageLimit: 5 })
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([
    {
      planId: 'default-20',
      name: '20 Messages',
      price: 1.99,
      credits: 20,
      description: 'Continue your conversation with 20 additional messages whenever you need support.',
      isActive: true,
      isMostPopular: true,
      displayOrder: 1,
    },
    {
      planId: 'default-50',
      name: '50 Messages',
      price: 3.99,
      credits: 50,
      description: 'Extended support with 50 additional messages for ongoing conversations.',
      isActive: true,
      isMostPopular: false,
      displayOrder: 2,
    },
  ])

  useEffect(() => {
    // Load pricing in background, update when ready
    loadPricing()
  }, [])

  const loadPricing = async () => {
    try {
      const [config, plans] = await Promise.all([
        pricingService.getConfig(),
        pricingService.getPlans(),
      ])
      setPricingConfig(config)
      const activePlans = plans.filter(p => p.isActive)
      if (activePlans.length > 0) {
        setPricingPlans(activePlans)
      }
    } catch (error) {
      console.error('Failed to load pricing:', error)
      // Keep default plans on error
    }
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  // Refs for scroll animations
  const heroRef = useRef(null)
  const howItWorksRef = useRef(null)
  const infoRef = useRef(null)
  const pricingRef = useRef(null)

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" })
  const infoInView = useInView(infoRef, { once: true, margin: "-100px" })
  const pricingInView = useInView(pricingRef, { once: true, margin: "-100px" })

  return (
    <main className="landing-page" role="main">
      <header className="hero" ref={heroRef}>
        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            AI Health Guidance & Private Symptom Support
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            Get instant, private answers about symptoms, wellness, and next steps with our AI health information chatbot — no signup required.
          </motion.p>
          <motion.p 
            className="hero-free-text"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            Start chatting for free. No signup. No pressure.
          </motion.p>
          <motion.div
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <Link to="/chat" className="cta-button" aria-label="Start chatting with AI health guidance">
              Start Chatting
            </Link>
          </motion.div>
          <motion.div 
            className="trust-badges"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div className="badge" variants={fadeInUp} aria-label="Private and secure">
              <span className="badge-icon" aria-hidden="true">🔒</span>
              <span>Private</span>
            </motion.div>
            <motion.div className="badge" variants={fadeInUp} aria-label="No login required">
              <span className="badge-icon" aria-hidden="true">👤</span>
              <span>No login</span>
            </motion.div>
            <motion.div className="badge" variants={fadeInUp} aria-label="Informational guidance only, not medical diagnosis">
              <span className="badge-icon" aria-hidden="true">💬</span>
              <span>Informational guidance only<br />Not a diagnosis or treatment</span>
            </motion.div>
          </motion.div>
        </div>
      </header>

      <section className="pricing-preview" ref={pricingRef} aria-labelledby="pricing-title">
        <motion.h2 
          id="pricing-title"
          className="section-title"
          initial="hidden"
          animate={pricingInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          Free Health Guidance — Pay Only If You Want More Messages
        </motion.h2>
        <motion.div 
          className="pricing-cards"
          initial="hidden"
          animate={pricingInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div 
            className="pricing-card free-card"
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>Free</h3>
            <p className="price">$0.00</p>
            <ul>
              <li>{pricingConfig?.freeMessageLimit || 5} free messages</li>
              <li>No login required</li>
              <li>Full AI quality</li>
              <li>Purchase more when needed</li>
            </ul>
          </motion.div>
          {pricingPlans.map((plan, index) => {
            // Force user-friendly names based on credits, regardless of plan.name
            let displayName = ""
            let displayDescription = ""
            
            if (plan.credits === 20 || plan.price === 1.99) {
              displayName = "20 Messages"
              displayDescription = "Ask follow-up health questions and get more detailed guidance whenever you need it."
            } else if (plan.credits === 50 || plan.price === 3.99) {
              displayName = "50 Messages"
              displayDescription = "Ongoing health discussions, symptom clarification, and wellness insights."
            } else {
              displayName = `${plan.credits || 0} Messages`
              displayDescription = `Continue your conversation with ${plan.credits || 0} additional messages.`
            }
            
            return (
              <motion.div
                key={plan.planId}
                className={`pricing-card ${plan.isMostPopular ? 'featured' : ''}`}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {plan.isMostPopular && (
                  <div className="featured-badge">Most Popular</div>
                )}
                <h3>{displayName}</h3>
                <p className="price">{formatPrice(plan.price)}</p>
                <p className="plan-description">{displayDescription}</p>
                <Link to={`/chat?purchase=${plan.planId}`} className="plan-button" aria-label={`Unlock ${plan.credits} messages for ${formatPrice(plan.price)}`}>
                  Unlock {plan.credits} Messages
                </Link>
              </motion.div>
            )
          })}
          {pricingPlans.length === 0 && (
            <motion.p 
              className="pricing-note"
              initial="hidden"
              animate={pricingInView ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              Pricing plans are being configured. Free tier is always available.
            </motion.p>
          )}
        </motion.div>
      </section>

      <section className="how-it-works" ref={howItWorksRef} aria-labelledby="how-it-works-title">
        <motion.h2 
          id="how-it-works-title"
          className="section-title"
          initial="hidden"
          animate={howItWorksInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          How It Works
        </motion.h2>
        <motion.div 
          className="steps"
          initial="hidden"
          animate={howItWorksInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div className="step" variants={fadeInUp} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <div className="step-icon">💬</div>
            <div className="step-number">1</div>
            <h3>Describe your symptoms or health question</h3>
            <p>No signup needed. Our AI symptom checker helps you understand your health questions privately and anonymously.</p>
          </motion.div>
          <motion.div className="step" variants={fadeInUp} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <div className="step-icon">🧠</div>
            <div className="step-number">2</div>
            <h3>Get clear, AI-powered health information and guidance</h3>
            <p>Receive empathetic, AI-powered health guidance and wellness advice tailored to your situation.</p>
          </motion.div>
          <motion.div className="step" variants={fadeInUp} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <div className="step-icon">🩺</div>
            <div className="step-number">3</div>
            <h3>Understand next steps and when to seek professional care</h3>
            <p>Get guidance on next steps and learn when to seek professional medical care. Use coping strategies and feel more calm and in control.</p>
          </motion.div>
        </motion.div>
      </section>

      <section className="informational-section" ref={infoRef} aria-labelledby="capabilities-title">
        <motion.h2 
          id="capabilities-title"
          className="section-title"
          initial="hidden"
          animate={infoInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          What Doctor AI Bolit Can & Can't Do
        </motion.h2>
        <motion.ul 
          className="informational-list"
          initial="hidden"
          animate={infoInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.li variants={fadeInUp}>✓ Explain symptoms and health concepts</motion.li>
          <motion.li variants={fadeInUp}>✓ Provide general wellness guidance</motion.li>
          <motion.li variants={fadeInUp}>✗ Does NOT diagnose conditions</motion.li>
          <motion.li variants={fadeInUp}>✗ Does NOT prescribe medication</motion.li>
          <motion.li variants={fadeInUp}>✗ Does NOT replace a licensed doctor</motion.li>
        </motion.ul>
      </section>

      {/* Sticky CTA Button for Mobile */}
      <motion.div 
        className="sticky-cta-mobile"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Link to="/chat" className="sticky-cta-button" aria-label="Start chatting with AI health guidance">
          Start Chatting
        </Link>
      </motion.div>
    </main>
  )
}
