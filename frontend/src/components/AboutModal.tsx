import { useTranslation } from 'react-i18next'
import './ModalOverlay.css'
import './AboutModal.css'

interface AboutModalProps {
  onClose: () => void
}

export default function AboutModal({ onClose }: AboutModalProps) {
  const { t } = useTranslation()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modal.about.title')}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-content">
          <section>
            <h3>{t('modal.about.missionTitle')}</h3>
            <p>{t('modal.about.missionBody')}</p>
          </section>

          <section>
            <h3>{t('modal.about.howTitle')}</h3>
            <p>{t('modal.about.howBody')}</p>
          </section>

          <section>
            <h3>{t('modal.about.offerTitle')}</h3>
            <ul>
              <li>{t('modal.about.offer1')}</li>
              <li>{t('modal.about.offer2')}</li>
              <li>{t('modal.about.offer3')}</li>
              <li>{t('modal.about.offer4')}</li>
              <li>{t('modal.about.offer5')}</li>
            </ul>
          </section>

          <section>
            <h3>{t('modal.about.noticeTitle')}</h3>
            <p>{t('modal.about.noticeBody')}</p>
          </section>

          <section>
            <h3>{t('modal.about.commitmentTitle')}</h3>
            <p>{t('modal.about.commitmentBody')}</p>
          </section>

          <section>
            <h3>{t('modal.about.contactTitle')}</h3>
            <p>{t('modal.about.contactBody')}</p>
          </section>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-close-button">{t('common.close')}</button>
        </div>
      </div>
    </div>
  )
}

