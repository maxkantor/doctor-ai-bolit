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
  selectedPlanId: propSelectedPlanId,
}: PaywallModalProps) {
  const [allPlans, setAllPlans] = useState<PricingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)

  useEffect(() => {
    loadPlans()
  }, [propSelectedPlanId])

  const loadPlans = async () => {
    try {
      const activePlans = await pricingService.getPlans()
      let allActivePlans = activePlans.filter(p => p.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
      
      // If no plans loaded from API, use default plans
      if (allActivePlans.length === 0) {
        allActivePlans = [
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
        ]
      }
      
      setAllPlans(allActivePlans)
      
      // Determine which plan to show
      if (propSelectedPlanId) {
        // Try to find plan by exact planId match
        let foundPlan = allActivePlans.find(p => p.planId === propSelectedPlanId)
        
        // If not found, try to infer from planId (e.g., if it contains "50" or "20")
        if (!foundPlan) {
          if (propSelectedPlanId.includes('50') || propSelectedPlanId.toLowerCase().includes('fifty')) {
            foundPlan = allActivePlans.find(p => p.credits === 50 || p.price === 3.99)
          } else if (propSelectedPlanId.includes('20') || propSelectedPlanId.toLowerCase().includes('twenty')) {
            foundPlan = allActivePlans.find(p => p.credits === 20 || p.price === 1.99)
          }
        }
        
        // If still not found, try matching by credits or price from the planId context
        if (!foundPlan) {
          // Try to find by matching the planId with any plan that has similar characteristics
          // This is a fallback for edge cases
          foundPlan = allActivePlans.find(p => 
            p.planId === propSelectedPlanId || 
            (propSelectedPlanId && p.planId && p.planId.toLowerCase() === propSelectedPlanId.toLowerCase())
          )
        }
        
        if (foundPlan) {
          setSelectedPlan(foundPlan)
        } else {
          // Fallback: show most popular if selected plan not found
          const mostPopular = allActivePlans.find(p => p.isMostPopular) || allActivePlans[0]
          if (mostPopular) {
            setSelectedPlan(mostPopular)
          }
        }
      } else {
        // Default: show the most popular plan, or first plan if none is marked as most popular
        const mostPopular = allActivePlans.find(p => p.isMostPopular) || allActivePlans[0]
        if (mostPopular) {
          setSelectedPlan(mostPopular)
        }
      }
    } catch (error) {
      console.error('Failed to load plans:', error)
      // Set default plans on error
      const defaultPlans = [
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
      ]
      setAllPlans(defaultPlans)
      
      // If propSelectedPlanId is provided, try to find matching default plan
      if (propSelectedPlanId) {
        if (propSelectedPlanId.includes('50') || propSelectedPlanId === 'default-50') {
          setSelectedPlan(defaultPlans[1]) // 50 Messages
        } else {
          setSelectedPlan(defaultPlans[0]) // 20 Messages (default)
        }
      } else {
        setSelectedPlan(defaultPlans[0]) // Most popular
      }
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
          ) : !selectedPlan ? (
            <div className="loading-plans">No plans available. Please try again later.</div>
          ) : (
            <>
              <div className="pricing-plans pricing-plans-single">
                <div
                  key={selectedPlan.planId}
                  className={`pricing-plan ${selectedPlan.isMostPopular ? 'most-popular' : ''}`}
                >
                  {selectedPlan.isMostPopular && (
                    <div className="popular-badge">Most Popular</div>
                  )}
                  <h3>{selectedPlan.name}</h3>
                  <div className="plan-price">{formatPrice(selectedPlan.price)}</div>
                  <div className="plan-credits">{selectedPlan.credits} messages</div>
                  <p className="plan-description">{selectedPlan.description}</p>
                  <button
                    onClick={() => handlePurchase(selectedPlan)}
                    disabled={isProcessing}
                    className={`plan-button ${selectedPlan.isMostPopular ? 'popular-button' : ''}`}
                  >
                    {isProcessing ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
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
