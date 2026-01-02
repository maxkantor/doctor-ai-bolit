import { useState, useEffect } from 'react'
import { PricingPlan } from '../types'
import { pricingService } from '../services/pricingService'
import { stripeService } from '../services/stripeService'
import './PaywallModal.css'

interface PaywallModalProps {
  visitorId: string
  freeMessageLimit: number
  onClose: () => void
  onPurchaseComplete?: () => void
  selectedPlanId?: string // Optional: if provided, show only this plan
}

export default function PaywallModal({
  visitorId,
  freeMessageLimit,
  onClose,
  onPurchaseComplete,
  selectedPlanId,
}: PaywallModalProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [allPlans, setAllPlans] = useState<PricingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlanIdState, setSelectedPlanIdState] = useState<string | null>(null)

  useEffect(() => {
    loadPlans()
    // Reset selectedPlanIdState when plans are reloaded (e.g., if prop selectedPlanId changes)
    setSelectedPlanIdState(null)
  }, [selectedPlanId])

  const loadPlans = async () => {
    try {
      const activePlans = await pricingService.getPlans()
      let filteredPlans = activePlans.filter(p => p.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
      
      // If selectedPlanId is provided, show only that plan
      if (selectedPlanId) {
        filteredPlans = filteredPlans.filter(p => p.planId === selectedPlanId)
      }
      
      // If no plans loaded, provide default plans as fallback
      if (filteredPlans.length === 0) {
        filteredPlans = [
          {
            planId: 'default-20',
            name: '20 Messages',
            price: 1.99,
            credits: 20,
            description: 'Continue your conversation with 20 additional messages.',
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
        ]
      }
      
      setAllPlans(filteredPlans)
      setPlans(filteredPlans)
    } catch (error) {
      console.error('Failed to load plans:', error)
      // Set default plans on error
      const defaultPlans = [
        {
          planId: 'default-20',
          name: '20 Messages',
          price: 1.99,
          credits: 20,
          description: 'Continue your conversation with 20 additional messages.',
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
      ]
      setAllPlans(defaultPlans)
      setPlans(defaultPlans)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanSelect = (plan: PricingPlan) => {
    // Show only the selected plan by filtering plans array
    console.log('Selecting plan:', plan.name, plan.planId, 'Current plans:', plans.length)
    // Update both states in a way that ensures React sees the change
    setSelectedPlanIdState(plan.planId)
    // Force update by creating a new array reference
    const singlePlan = [plan]
    console.log('Setting plans to:', singlePlan.length, 'plan(s)')
    setPlans(singlePlan)
  }

  const handleBack = () => {
    // Show all plans again
    console.log('Going back to all plans')
    setSelectedPlanIdState(null)
    if (selectedPlanId) {
      const filtered = allPlans.filter(p => p.planId === selectedPlanId)
      setPlans(filtered.length > 0 ? filtered : allPlans)
    } else {
      setPlans(allPlans)
    }
  }

  const handlePurchase = async (plan: PricingPlan) => {
    setIsProcessing(true)
    try {
      // Use planId - backend will look up price and create checkout dynamically
      const checkoutUrl = await stripeService.createCheckout({
        visitorId,
        priceId: plan.planId,
        credits: plan.credits,
      })
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Failed to create checkout:', error)
      alert('Failed to start checkout. Please try again.')
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="paywall-modal" onClick={(e) => e.stopPropagation()}>
        <div className="paywall-header">
          <h2>You're not alone — want to keep going?</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="paywall-content">
          {isLoading ? (
            <div className="loading-plans">Loading plans...</div>
          ) : selectedPlanIdState ? (
            <>
              <button onClick={handleBack} className="back-to-plans-btn">
                ← Back to all plans
              </button>
              <p className="paywall-message">
                Confirm your selection to continue your conversation.
              </p>
              <div className="pricing-plans pricing-plans-single">
                {(() => {
                  // Find the selected plan from allPlans or use the single plan in plans array
                  const planToShow = allPlans.find(p => p.planId === selectedPlanIdState) || plans[0]
                  if (!planToShow) return <div>Plan not found</div>
                  
                  return (
                    <div
                      key={planToShow.planId}
                      className={`pricing-plan ${planToShow.isMostPopular ? 'most-popular' : ''}`}
                    >
                      {planToShow.isMostPopular && (
                        <div className="popular-badge">Most Popular</div>
                      )}
                      <h3>{planToShow.name}</h3>
                      <div className="plan-price">{formatPrice(planToShow.price)}</div>
                      <div className="plan-credits">{planToShow.credits} messages</div>
                      <p className="plan-description">{planToShow.description}</p>
                      <button
                        onClick={() => handlePurchase(planToShow)}
                        disabled={isProcessing}
                        className={`plan-button ${planToShow.isMostPopular ? 'popular-button' : ''}`}
                      >
                        {isProcessing ? 'Processing...' : `Purchase ${planToShow.credits} Messages`}
                      </button>
                    </div>
                  )
                })()}
              </div>
              <button onClick={onClose} className="end-session-btn">
                End session
              </button>
            </>
          ) : (
            <>
              <p className="paywall-message">
                Choose a plan to continue your conversation and get more AI health guidance.
              </p>
              <div className="pricing-plans">
                {(allPlans.length > 0 ? allPlans : plans).map((plan) => (
                  <div
                    key={plan.planId}
                    className={`pricing-plan ${plan.isMostPopular ? 'most-popular' : ''}`}
                  >
                    {plan.isMostPopular && (
                      <div className="popular-badge">Most Popular</div>
                    )}
                    <h3>{plan.name}</h3>
                    <div className="plan-price">{formatPrice(plan.price)}</div>
                    <div className="plan-credits">{plan.credits} messages</div>
                    <p className="plan-description">{plan.description}</p>
                    <button
                      onClick={() => {
                        console.log('Button clicked for plan:', plan.name)
                        handlePlanSelect(plan)
                      }}
                      className={`plan-button ${plan.isMostPopular ? 'popular-button' : ''}`}
                    >
                      {`Unlock ${plan.credits} Messages`}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={onClose} className="end-session-btn">
                End session
              </button>
            </>
          )}

          <div className="payment-security">
            <span className="security-icon">🔒</span>
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  )
}

