import { Link } from 'react-router-dom'
import { scrollToTop } from '../../utils/scrollToTop'
import './SymptomsPages.css'

export default function SymptomCTA() {
  return (
    <div className="symptoms-cta-row">
      <Link
        to="/chat"
        className="symptom-cta"
        onClick={scrollToTop}
        aria-label="Check symptoms privately in chat"
      >
        Check Symptoms Privately
      </Link>
    </div>
  )
}
