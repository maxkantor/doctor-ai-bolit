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
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [selectedPlanId])

  const loadPlans = async () => {
    try {
      const activePlans = await pricingService.getPlans()
      let filteredPlans = activePlans.filter(p => p.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
      
      // If selectedPlanId is provided, show only that plan
      if (selectedPlanId) {
        filteredPlans = filteredPlans.filter(p => p.planId === selectedPlanId)
      }
      
      setPlans(filteredPlans)
    } catch (error) {
      console.error('Failed to load plans:', error)
    } finally {
      setIsLoading(false)
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
          ) : (
            <>
              <div className="pricing-plans">
                {plans.map((plan) => (
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
                      onClick={() => handlePurchase(plan)}
                      disabled={isProcessing}
                      className={`plan-button ${plan.isMostPopular ? 'popular-button' : ''}`}
                    >
                      {isProcessing ? 'Processing...' : 'Purchase'}
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

