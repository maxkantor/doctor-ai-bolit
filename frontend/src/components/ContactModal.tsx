import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { contactService } from '../services/contactService'
import './ModalOverlay.css'
import './ContactModal.css'

interface ContactModalProps {
  onClose: () => void
}

export default function ContactModal({ onClose }: ContactModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await contactService.submitContact({ name, email, message })
      setSubmitted(true)
      setTimeout(() => {
        onClose()
        setSubmitted(false)
        setName('')
        setEmail('')
        setMessage('')
      }, 2000)
    } catch (error) {
      console.error('Failed to submit contact form:', error)
      alert(t('contact.submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('contact.title')}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-content">
          {submitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>{t('contact.thankYou')}</h3>
              <p>{t('contact.success')}</p>
            </div>
          ) : (
            <>
              <p className="contact-intro">
                {t('contact.intro')}
              </p>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="contact-name">{t('contact.name')}</label>
                  <input
                    type="text"
                    id="contact-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">{t('contact.email')}</label>
                  <input
                    type="email"
                    id="contact-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">{t('contact.message')}</label>
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={onClose} className="cancel-btn">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" disabled={isSubmitting} className="submit-btn">
                    {isSubmitting ? t('common.sending') : t('contact.send')}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

