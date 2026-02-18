import { Link } from 'react-router-dom'
import { scrollToTop } from '../utils/scrollToTop'
import './YouTubePage.css'

export default function YouTubePage() {
  return (
    <div className="youtube-page">
      <div className="youtube-container">
        <h1>YouTube Channel</h1>
        <p className="youtube-intro">
          Watch our videos about health, wellness, and general health guidance.
        </p>
        
        <div className="video-section">
          <h2>Featured Videos</h2>
          <div className="videos-grid">
            {/* Placeholder for embedded videos */}
            <div className="video-placeholder">
              <p>Video content will be embedded here</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h2>Try DoctorAibolit Free</h2>
          <p>Get instant AI health guidance and wellness information. No signup required.</p>
          <Link to="/chat" className="cta-button" onClick={scrollToTop}>
            Start Chatting Now
          </Link>
        </div>
      </div>
    </div>
  )
}

