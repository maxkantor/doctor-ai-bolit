import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import './PremiumNavbar.css'

export default function PremiumNavbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
