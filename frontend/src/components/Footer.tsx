import { useState } from 'react'
import { Link } from 'react-router-dom'
import ContactModal from './ContactModal'
import PrivacyModal from './PrivacyModal'
import DisclaimerModal from './DisclaimerModal'
import AboutModal from './AboutModal'
import './Footer.css'

export default function Footer() {
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
              About
            </button>
            <button onClick={() => setShowContact(true)} className="footer-link-btn">
              Contact
            </button>
            <button onClick={() => setShowPrivacy(true)} className="footer-link-btn">
              Privacy Policy
            </button>
            <button onClick={() => setShowDisclaimer(true)} className="footer-link-btn">
              Disclaimer
            </button>
            <Link to="/platform" className="footer-link-btn footer-link">
              Platform
            </Link>
          </div>
          <div className="footer-copyright">
            <p className="footer-safety">In an emergency, contact local emergency services.</p>
            <p>&copy; {new Date().getFullYear()} DoctorAIBolit. General educational guidance only.</p>
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

