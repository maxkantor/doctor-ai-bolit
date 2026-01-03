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
  const [isUsingDefaultPlans, setIsUsingDefaultPlans] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [propSelectedPlanId])

  // Retry loading plans if we got empty results (backend might need time to auto-seed)
  useEffect(() => {
    if (!isLoading && allPlans.length === 0 && !isUsingDefaultPlans) {
      console.log('No plans loaded, retrying in 1 second...')
      const retryTimer = setTimeout(() => {
        loadPlans()
      }, 1000)
      return () => clearTimeout(retryTimer)
    }
  }, [isLoading, allPlans.length, isUsingDefaultPlans])

  const loadPlans = async () => {
    try {
      const activePlans = await pricingService.getPlans()
      let allActivePlans = activePlans.filter(p => p.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
      
      // If no plans loaded from API, use default plans (for display only)
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
        setIsUsingDefaultPlans(true)
      } else {
        setIsUsingDefaultPlans(false)
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
      setIsUsingDefaultPlans(true)
      
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
      // If using default plans, reload plans first to trigger auto-seeding
      if (isUsingDefaultPlans || plan.planId.startsWith('default-')) {
        console.log('Default plan detected, reloading plans to trigger auto-seed...')
        await loadPlans()
        
        // Wait a moment for backend to process
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Reload plans again to get the newly seeded plans
        await loadPlans()
        
        // Find the actual plan from the reloaded list
        const actualPlan = allPlans.find(p => 
          (p.credits === plan.credits && p.price === plan.price) || 
          (plan.credits === 20 && p.credits === 20) ||
          (plan.credits === 50 && p.credits === 50)
        )
        
        if (actualPlan && !actualPlan.planId.startsWith('default-')) {
          // Use the actual plan from database
          plan = actualPlan
        } else {
          // If still no real plan, try with the default planId - backend will handle it
          console.log('Using plan with credits/price matching, backend will handle lookup')
        }
      }

      // Use planId - backend will look up price and create checkout dynamically
      // Backend auto-seeds plans if they don't exist, so we can proceed
      const checkoutUrl = await stripeService.createCheckout({
        visitorId,
        priceId: plan.planId,
        credits: plan.credits,
      })
      window.location.href = checkoutUrl
    } catch (error: any) {
      console.error('Failed to create checkout:', error)
      
      // Extract error message from API response
      let errorMessage = 'Failed to start checkout. Please try again.'
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      // If error mentions plan not found, try reloading plans and retry once
      if (errorMessage.includes('Plan not found') || errorMessage.includes('plan exists')) {
        console.log('Plan not found error, reloading plans and retrying...')
        await loadPlans()
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Find matching plan by credits/price
        const matchingPlan = allPlans.find(p => 
          (p.credits === plan.credits && p.price === plan.price) ||
          (plan.credits === 20 && p.credits === 20) ||
          (plan.credits === 50 && p.credits === 50)
        )
        
        if (matchingPlan && !matchingPlan.planId.startsWith('default-')) {
          try {
            const checkoutUrl = await stripeService.createCheckout({
              visitorId,
              priceId: matchingPlan.planId,
              credits: matchingPlan.credits,
            })
            window.location.href = checkoutUrl
            return // Success, exit early
          } catch (retryError: any) {
            console.error('Retry also failed:', retryError)
            errorMessage = retryError?.response?.data?.message || retryError?.message || errorMessage
          }
        }
      }
      
      alert(errorMessage)
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
