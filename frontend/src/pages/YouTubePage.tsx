import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { scrollToTop } from '../utils/scrollToTop'
import './YouTubePage.css'

export default function YouTubePage() {
  const { t } = useTranslation()
  return (
    <div className="youtube-page">
      <div className="youtube-container">
        <h1>{t('youtube.title')}</h1>
        <p className="youtube-intro">
          {t('youtube.intro')}
        </p>
        
        <div className="video-section">
          <h2>{t('youtube.featured')}</h2>
          <div className="videos-grid">
            {/* Placeholder for embedded videos */}
            <div className="video-placeholder">
              <p>{t('youtube.placeholder')}</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h2>{t('youtube.tryFree')}</h2>
          <p>{t('youtube.cta')}</p>
          <Link to="/chat" className="cta-button" onClick={scrollToTop}>
            {t('youtube.start')}
          </Link>
        </div>
      </div>
    </div>
  )
}

