import { useState } from 'react'
import { stripeService } from '../services/stripeService'
import './BuyCreditsModal.css'

interface BuyCreditsModalProps {
  visitorId: string
  onClose: () => void
}

interface CreditPack {
  id: string
  name: string
  credits: number
  price: string
  priceId: string
  costPerCredit: string
  description: string
  popular?: boolean
}

const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 20,
    price: '$1.99',
    priceId: 'price_starter_pack', // TODO: Replace with actual Stripe Price ID
    costPerCredit: '$0.100',
    description: 'Perfect for occasional use',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 50,
    price: '$3.99',
    priceId: 'price_pro_pack', // TODO: Replace with actual Stripe Price ID
    costPerCredit: '$0.080',
    description: 'Best value for regular users',
    popular: true,
  },
  {
    id: 'ultra',
    name: 'Ultra Pack',
    credits: 120,
    price: '$5.99',
    priceId: 'price_ultra_pack', // TODO: Replace with actual Stripe Price ID
    costPerCredit: '$0.050',
    description: 'For power users',
  },
]

export default function BuyCreditsModal({ visitorId, onClose }: BuyCreditsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async (pack: CreditPack) => {
    setIsProcessing(true)
    try {
      const checkoutUrl = await stripeService.createCheckout({
        visitorId,
        priceId: pack.priceId,
        credits: pack.credits,
      })
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Failed to create checkout:', error)
      alert('Failed to start checkout. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="buy-credits-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button onClick={onClose} className="back-btn">← Back</button>
          <h2>Buy Credits</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-content">
          <div className="credits-intro">
            <div className="intro-icon">🪙</div>
            <p className="intro-text">
              Purchase credits to continue chatting after your free credits are used up!
            </p>
          </div>

          <div className="features">
            <div className="feature">
              <span className="feature-icon">🎁</span>
              <span>5 Free Credits</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🪙</span>
              <span>Credits Never Expire</span>
            </div>
            <div className="feature">
              <span className="feature-icon">👑</span>
              <span>Same Quality Analysis</span>
            </div>
          </div>

          <h3 className="packs-title">Choose Your Credit Pack</h3>

          <div className="credit-packs">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`credit-pack ${pack.popular ? 'popular' : ''}`}
              >
                {pack.popular && (
                  <div className="popular-badge">
                    <span className="badge-icon">👑</span>
                    Most Popular
                  </div>
                )}
                <h4>{pack.name}</h4>
                <div className="pack-price">{pack.price}</div>
                <div className="pack-credits">
                  <span className="credits-icon">🪙</span>
                  {pack.credits} Credits
                </div>
                <p className="pack-description">{pack.description}</p>
                <div className="pack-cost-per-credit">{pack.costPerCredit} per credit</div>
                <button
                  onClick={() => handlePurchase(pack)}
                  disabled={isProcessing}
                  className={`pack-button ${pack.popular ? 'popular-button' : ''}`}
                >
                  {isProcessing ? 'Processing...' : `Get ${pack.name}`}
                </button>
              </div>
            ))}
          </div>

          <div className="payment-security">
            <span className="security-icon">🔒</span>
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  )
}


