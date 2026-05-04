import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import { getOrCreateVisitorId } from '../utils/visitorId'
import { chatService } from '../services/chatService'
import { pricingService } from '../services/pricingService'
import './PremiumNavbar.css'

export default function PremiumNavbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [usageText, setUsageText] = useState('5/5')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let isActive = true

    const loadUsage = async () => {
      try {
        const visitorId = getOrCreateVisitorId()
        const [remaining, config] = await Promise.all([
          chatService.getRemainingMessages(visitorId),
          pricingService.getConfig(),
        ])

        if (!isActive) return

        const freeLimit = config?.freeMessageLimit ?? 5
        if (typeof remaining === 'object' && 'creditBalance' in remaining) {
          if ((remaining.creditBalance || 0) > 0) {
            // Purchased-credit total history is not tracked client-side; show unknown denominator.
            setUsageText(`${remaining.remainingMessages}/?`)
          } else {
            setUsageText(`${remaining.freeMessagesRemaining || 0}/${freeLimit}`)
          }
        } else {
          setUsageText(`${remaining}/${freeLimit}`)
        }
      } catch {
        if (isActive) setUsageText('5/5')
      }
    }

    loadUsage()
    const onFocus = () => loadUsage()
    window.addEventListener('focus', onFocus)

    return () => {
      isActive = false
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return (
    <header className={`premium-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="premium-navbar-inner">
        <Link to="/" className="premium-navbar-brand" aria-label="DoctorAIBolit home">
          <span className="brand-dot" aria-hidden="true"></span>
          <span>DoctorAIBolit</span>
        </Link>

        <nav className="premium-navbar-links" aria-label="Primary">
          <a href="/#how-it-works-title">{t('landing.howItWorks')}</a>
          <a href="/#pricing-title">{t('landing.pricingNav')}</a>
        </nav>

        <div className="premium-navbar-actions">
          <span className="premium-navbar-usage" aria-label="Available messages">
            {usageText}
          </span>
          <LanguageSwitcher compact />
          <Link to="/chat" className="premium-navbar-cta">
            {t('landing.navCta')}
          </Link>
          <button
            type="button"
            className="premium-navbar-menu-button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="premium-mobile-menu"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>

      <div id="premium-mobile-menu" className={`premium-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="premium-mobile-menu-inner">
          <LanguageSwitcher />
          <a href="/#how-it-works-title" onClick={() => setMobileMenuOpen(false)}>{t('landing.howItWorks')}</a>
          <a href="/#pricing-title" onClick={() => setMobileMenuOpen(false)}>{t('landing.pricingNav')}</a>
          <Link to="/chat" className="premium-navbar-cta premium-navbar-cta-mobile" onClick={() => setMobileMenuOpen(false)}>
            {t('landing.navCta')}
          </Link>
        </div>
      </div>
    </header>
  )
}
