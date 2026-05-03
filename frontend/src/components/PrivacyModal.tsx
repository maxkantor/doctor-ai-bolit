import { useTranslation } from 'react-i18next'
import './ModalOverlay.css'
import './PrivacyModal.css'

interface PrivacyModalProps {
  onClose: () => void
}

export default function PrivacyModal({ onClose }: PrivacyModalProps) {
  const { t, i18n } = useTranslation()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="privacy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modal.privacy.title')}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-content">
          <p className="last-updated">
            {t('modal.privacy.lastUpdated')}: {new Date().toLocaleDateString(i18n.language)}
          </p>

          <section>
            <h3>{t('modal.privacy.summaryTitle')}</h3>
            <p>{t('modal.privacy.summaryBody')}</p>
          </section>

          <section>
            <h3>{t('modal.privacy.collectTitle')}</h3>
            <ul>
              <li>{t('modal.privacy.collect1')}</li>
              <li>{t('modal.privacy.collect2')}</li>
              <li>{t('modal.privacy.collect3')}</li>
              <li>{t('modal.privacy.collect4')}</li>
            </ul>
          </section>

          <section>
            <h3>{t('modal.privacy.useTitle')}</h3>
            <ul>
              <li>{t('modal.privacy.use1')}</li>
              <li>{t('modal.privacy.use2')}</li>
              <li>{t('modal.privacy.use3')}</li>
              <li>{t('modal.privacy.use4')}</li>
            </ul>
          </section>

          <section>
            <h3>{t('modal.privacy.rightsTitle')}</h3>
            <ul>
              <li>{t('modal.privacy.rights1')}</li>
              <li>{t('modal.privacy.rights2')}</li>
              <li>{t('modal.privacy.rights3')}</li>
            </ul>
          </section>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-close-button">{t('common.close')}</button>
        </div>
      </div>
    </div>
  )
}

