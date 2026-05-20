import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ContactModal from './ContactModal'
import PrivacyModal from './PrivacyModal'
import DisclaimerModal from './DisclaimerModal'
import AboutModal from './AboutModal'
import './Footer.css'

export default function Footer() {
  const { t } = useTranslation()
  const [showContact, setShowContact] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <button onClick={() => setShowAbout(true)} className="footer-link-btn">
              {t('footer.about')}
            </button>
            <button onClick={() => setShowContact(true)} className="footer-link-btn">
              {t('footer.contact')}
            </button>
            <button onClick={() => setShowPrivacy(true)} className="footer-link-btn">
              {t('footer.privacy')}
            </button>
            <button onClick={() => setShowDisclaimer(true)} className="footer-link-btn">
              {t('footer.disclaimer')}
            </button>
            <Link to="/platform" className="footer-link-btn footer-link">
              {t('footer.platform')}
            </Link>
          </div>
          <div className="footer-symptom-links" aria-label="Educational content">
            <Link to="/symptoms" className="footer-symptom-link">
              Symptoms
            </Link>
            <span className="footer-symptom-sep" aria-hidden="true">
              ·
            </span>
            <Link to="/guides" className="footer-symptom-link">
              Guides
            </Link>
            <span className="footer-symptom-sep" aria-hidden="true">
              ·
            </span>
            <Link to="/tools" className="footer-symptom-link">
              Tools
            </Link>
            <span className="footer-symptom-sep" aria-hidden="true">
              ·
            </span>
            <Link to="/faq" className="footer-symptom-link">
              FAQ
            </Link>
          </div>
          <div className="footer-symptom-links" aria-label="Popular symptom guides">
            <Link to="/symptoms/chest-pain" className="footer-symptom-link">
              Chest Pain
            </Link>
            <span className="footer-symptom-sep" aria-hidden="true">
              ·
            </span>
            <Link to="/symptoms/headache" className="footer-symptom-link">
              Headache
            </Link>
            <span className="footer-symptom-sep" aria-hidden="true">
              ·
            </span>
            <Link to="/symptoms/rash" className="footer-symptom-link">
              Rash
            </Link>
            <span className="footer-symptom-sep" aria-hidden="true">
              ·
            </span>
            <Link to="/symptoms/anxiety-symptoms" className="footer-symptom-link">
              Anxiety Symptoms
            </Link>
            <span className="footer-symptom-sep" aria-hidden="true">
              ·
            </span>
            <Link to="/symptoms/urgent-symptom-checker" className="footer-symptom-link">
              Urgent Symptom Checker
            </Link>
            <span className="footer-symptom-sep" aria-hidden="true">
              ·
            </span>
            <Link to="/tools/symptom-urgency-checker" className="footer-symptom-link">
              Urgency Tool
            </Link>
          </div>
          <div className="footer-copyright">
            <p className="footer-safety">{t('footer.safety')}</p>
            <p>&copy; {new Date().getFullYear()} DoctorAIBolit. {t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showDisclaimer && <DisclaimerModal onClose={() => setShowDisclaimer(false)} />}
    </>
  )
}

