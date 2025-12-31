import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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


  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">AI Health Guidance When You Need It Most</h1>
          <p className="hero-subtitle">Get instant, private answers about symptoms, wellness, and next steps — no signup required.</p>
          <p className="hero-free-text">Start chatting for free. No signup. No pressure.</p>
          <Link to="/chat" className="cta-button">
            Start Chatting
          </Link>
          <div className="trust-badges">
            <div className="badge">
              <span className="badge-icon">🔒</span>
              <span>Private</span>
            </div>
            <div className="badge">
              <span className="badge-icon">👤</span>
              <span>No login</span>
            </div>
            <div className="badge">
              <span className="badge-icon">💬</span>
              <span>Informational guidance only<br />Not a diagnosis or treatment</span>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Describe your symptoms or health question</h3>
            <p>No signup needed. Just start talking about what's on your mind.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Get clear, AI-powered health information and guidance</h3>
            <p>Receive empathetic, AI-powered responses tailored to your situation.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Understand next steps and when to seek professional care</h3>
            <p>Use coping strategies and feel more calm and in control.</p>
          </div>
        </div>
      </section>

      <section className="informational-section">
        <h2 className="section-title">What Doctor AI Bolit Can & Can't Do</h2>
        <ul className="informational-list">
          <li>Explain symptoms and health concepts</li>
          <li>Provide general wellness guidance</li>
          <li>Does NOT diagnose conditions</li>
          <li>Does NOT prescribe medication</li>
          <li>Does NOT replace a licensed doctor</li>
        </ul>
      </section>

      <section className="pricing-preview">
        <h2 className="section-title">Free Health Guidance — Pay Only If You Want More Messages</h2>
        <div className="pricing-cards">
          <div className="pricing-card free-card">
            <h3>Free</h3>
            <p className="price">$0.00</p>
            <ul>
              <li>{pricingConfig?.freeMessageLimit || 5} free messages</li>
              <li>No login required</li>
              <li>Full AI quality</li>
              <li>Purchase more when needed</li>
            </ul>
          </div>
          {pricingPlans.map((plan) => {
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
              <div
                key={plan.planId}
                className={`pricing-card ${plan.isMostPopular ? 'featured' : ''}`}
              >
                {plan.isMostPopular && (
                  <div className="featured-badge">Most Popular</div>
                )}
                <h3>{displayName}</h3>
                <p className="price">{formatPrice(plan.price)}</p>
                <p className="plan-description">{displayDescription}</p>
                <Link to={`/chat?purchase=${plan.planId}`} className="plan-button">
                  Unlock {plan.credits} Messages
                </Link>
              </div>
            )
          })}
        </div>
        {pricingPlans.length === 0 && (
          <p className="pricing-note">
            Pricing plans are being configured. Free tier is always available.
          </p>
        )}
      </section>
    </div>
  )
}
