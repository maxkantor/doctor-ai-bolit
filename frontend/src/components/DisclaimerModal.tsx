import { useTranslation } from 'react-i18next'
import './ModalOverlay.css'
import './DisclaimerModal.css'

interface DisclaimerModalProps {
  onClose: () => void
}

export default function DisclaimerModal({ onClose }: DisclaimerModalProps) {
  const { t, i18n } = useTranslation()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="disclaimer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modal.disclaimer.title')}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-content">
          <p className="last-updated">
            {t('modal.privacy.lastUpdated')}: {new Date().toLocaleDateString(i18n.language)}
          </p>

          <section className="important-notice">
            <div className="notice-box">
              <span className="warning-icon">⚠️</span>
              <div>
                <h3>{t('modal.disclaimer.noticeTitle')}</h3>
                <p><strong>{t('modal.disclaimer.noticeBody')}</strong></p>
              </div>
            </div>
          </section>

          <section>
            <h3>{t('modal.disclaimer.infoTitle')}</h3>
            <p>{t('modal.disclaimer.infoBody')}</p>
          </section>

          <section>
            <h3>{t('modal.disclaimer.emergencyTitle')}</h3>
            <p>{t('modal.disclaimer.emergencyBody')}</p>
            <ul>
              <li>{t('modal.disclaimer.emergency1')}</li>
              <li>{t('modal.disclaimer.emergency2')}</li>
              <li>{t('modal.disclaimer.emergency3')}</li>
            </ul>
          </section>

          <section>
            <h3>{t('modal.disclaimer.limitsTitle')}</h3>
            <p>{t('modal.disclaimer.limitsBody')}</p>
          </section>

          <section>
            <h3>{t('modal.disclaimer.liabilityTitle')}</h3>
            <p>{t('modal.disclaimer.liabilityBody')}</p>
          </section>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-close-button">{t('common.close')}</button>
        </div>
      </div>
    </div>
  )
}

