import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { scrollToTop } from '../utils/scrollToTop'
import { motion, useInView } from 'framer-motion'
import { pricingService } from '../services/pricingService'
import { stripeService } from '../services/stripeService'
import { getOrCreateVisitorId } from '../utils/visitorId'
import { PricingPlan, PricingConfig } from '../types'
import './LandingPage.css'

export default function LandingPage() {
  const { t } = useTranslation()
  // Show default pricing immediately for fast loading
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({ freeMessageLimit: 5 })
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null)
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

  const handleUnlock = async (plan: PricingPlan) => {
    // Prevent double-clicks
    if (processingPlanId) return
    
    setProcessingPlanId(plan.planId)
    try {
      // Get or create visitor ID
      const visitorId = getOrCreateVisitorId()
      
      // Create Stripe checkout session
      const checkoutUrl = await stripeService.createCheckout({
        visitorId,
        priceId: plan.planId,
        credits: plan.credits,
      })
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl
    } catch (error: any) {
      console.error('Failed to create checkout:', error)
      
      // Extract error message from API response
      let errorMessage = t('errors.checkoutFailed')
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
      setProcessingPlanId(null)
    }
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
        <div className="hero-grid">
          <div className="hero-content">
            <motion.p
              className="hero-kicker"
              initial="hidden"
              animate={heroInView ? 'visible' : 'hidden'}
              variants={fadeInUp}
            >
              {t('landing.heroKicker')}
            </motion.p>
            <motion.h1
              className="hero-title"
              initial="hidden"
              animate={heroInView ? 'visible' : 'hidden'}
              variants={fadeInUp}
            >
              {t('landing.newTitle')}
            </motion.h1>
            <motion.p
              className="hero-subtitle"
              initial="hidden"
              animate={heroInView ? 'visible' : 'hidden'}
              variants={fadeInUp}
            >
              {t('landing.newSubtitle')}
            </motion.p>
            <motion.div
              className="hero-cta-row"
              initial="hidden"
              animate={heroInView ? 'visible' : 'hidden'}
              variants={fadeInUp}
            >
              <Link to="/chat" className="cta-button" aria-label="Check your symptoms with AI health guidance" onClick={scrollToTop}>
                <span className="cta-button-icon" aria-hidden="true">✨</span>
                <span>{t('landing.checkSymptoms')}</span>
              </Link>
            </motion.div>

            <motion.div
              className="trust-badges"
              initial="hidden"
              animate={heroInView ? 'visible' : 'hidden'}
              variants={staggerContainer}
            >
              <motion.div className="badge" variants={fadeInUp}>
                <span className="badge-icon" aria-hidden="true">✔</span>
                <span>{t('landing.trustPoint1')}</span>
              </motion.div>
              <motion.div className="badge" variants={fadeInUp}>
                <span className="badge-icon" aria-hidden="true">✔</span>
                <span>{t('landing.trustPoint2')}</span>
              </motion.div>
              <motion.div className="badge" variants={fadeInUp}>
                <span className="badge-icon" aria-hidden="true">✔</span>
                <span>{t('landing.trustPoint3')}</span>
              </motion.div>
            </motion.div>

            <motion.p
              className="trust-disclaimer"
              initial="hidden"
              animate={heroInView ? 'visible' : 'hidden'}
              variants={fadeInUp}
            >
              {t('landing.trustDisclaimer')}
            </motion.p>
          </div>

          <motion.aside
            className="hero-preview"
            initial={{ opacity: 0, y: 28 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: 0.65 }}
            aria-label="Chat preview"
          >
            <div className="preview-topbar">
              <span className="preview-dot"></span>
              <span className="preview-dot"></span>
              <span className="preview-dot"></span>
              <span className="preview-title">{t('landing.previewTitle')}</span>
            </div>
            <div className="preview-messages">
              <div className="preview-message user">{t('landing.chestPainUser')}</div>
              <div className="preview-message ai">{t('landing.chestPainAi')}</div>
              <div className="preview-message ai highlight">{t('landing.previewHighlight')}</div>
            </div>
            <div className="preview-metrics">
              <div>
                <strong>24/7</strong>
                <span>{t('landing.previewAvailable')}</span>
              </div>
              <div>
                <strong>~10s</strong>
                <span>{t('landing.previewResponse')}</span>
              </div>
              <div>
                <strong>5</strong>
                <span>{t('landing.previewFreeMessages')}</span>
              </div>
            </div>
          </motion.aside>
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
          {t('landing.pricingTitle')}
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
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>{t('landing.free')}</h3>
            <p className="price">$0.00</p>
            <ul>
              <li>{t('landing.freeMessages', { count: pricingConfig?.freeMessageLimit || 5 })}</li>
              <li>{t('landing.noLogin')}</li>
              <li>{t('landing.fullAiQuality')}</li>
              <li>{t('landing.purchaseMore')}</li>
            </ul>
          </motion.div>
          {pricingPlans.map((plan, index) => {
            // Force user-friendly names based on credits, regardless of plan.name
            let displayName = ""
            let displayDescription = ""
            
            if (plan.credits === 20 || plan.price === 1.99) {
              displayName = t('landing.messagesLabel', { count: 20 })
              displayDescription = "Ask follow-up health questions and get more detailed guidance whenever you need it."
            } else if (plan.credits === 50 || plan.price === 3.99) {
              displayName = t('landing.messagesLabel', { count: 50 })
              displayDescription = "Ongoing health discussions, symptom clarification, and wellness insights."
            } else {
              displayName = t('landing.messagesLabel', { count: plan.credits || 0 })
              displayDescription = `Continue your conversation with ${plan.credits || 0} additional messages.`
            }
            
            return (
              <motion.div
                key={plan.planId}
                className={`pricing-card ${plan.isMostPopular ? 'featured' : ''}`}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {plan.isMostPopular && (
                  <div className="featured-badge">{t('landing.mostPopular')}</div>
                )}
                {plan.price === 1.99 && (
                  <div className="pricing-badge-tag">{t('landing.pricingBadge')}</div>
                )}
                <h3>{displayName}</h3>
                <p className="price">{formatPrice(plan.price)}</p>
                {plan.price === 1.99 && (
                  <p className="pay-once">{t('landing.payOnce')}</p>
                )}
                <p className="plan-description">{displayDescription}</p>
                <button 
                  onClick={() => handleUnlock(plan)}
                  disabled={processingPlanId !== null}
                  className="plan-button" 
                  aria-label={`Unlock ${plan.credits} messages for ${formatPrice(plan.price)}`}
                >
                  {processingPlanId === plan.planId ? t('common.processing') : t('landing.unlockMessages', { count: plan.credits })}
                </button>
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
              {t('landing.plansConfiguring')}
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
          {t('landing.howItWorks')}
        </motion.h2>
        <motion.div 
          className="steps"
          initial="hidden"
          animate={howItWorksInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div className="step" variants={fadeInUp} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <div className="step-icon">💬</div>
            <div className="step-number">1</div>
            <h3>{t('landing.step1Title')}</h3>
            <p>{t('landing.step1Text')}</p>
          </motion.div>
          <motion.div className="step" variants={fadeInUp} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <div className="step-icon">🧠</div>
            <div className="step-number">2</div>
            <h3>{t('landing.step2Title')}</h3>
            <p>{t('landing.step2Text')}</p>
          </motion.div>
          <motion.div className="step" variants={fadeInUp} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <div className="step-icon">🩺</div>
            <div className="step-number">3</div>
            <h3>{t('landing.step3Title')}</h3>
            <p>{t('landing.step3Text')}</p>
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
          {t('landing.capabilitiesTitle')}
        </motion.h2>
        <motion.ul 
          className="informational-list"
          initial="hidden"
          animate={infoInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.li variants={fadeInUp}>✓ {t('landing.capability1')}</motion.li>
          <motion.li variants={fadeInUp}>✓ {t('landing.capability2')}</motion.li>
          <motion.li variants={fadeInUp}>✗ {t('landing.capability3')}</motion.li>
          <motion.li variants={fadeInUp}>✗ {t('landing.capability4')}</motion.li>
          <motion.li variants={fadeInUp}>✗ {t('landing.capability5')}</motion.li>
        </motion.ul>
      </section>

      {/* Sticky CTA Button for Mobile */}
      <motion.div 
        className="sticky-cta-mobile"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Link to="/chat" className="sticky-cta-button" aria-label="Check your symptoms with AI health guidance" onClick={scrollToTop}>
          {t('landing.checkSymptoms')}
        </Link>
      </motion.div>
    </main>
  )
}
