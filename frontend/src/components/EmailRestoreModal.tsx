import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { emailRestoreService } from '../services/emailRestoreService'
import './EmailRestoreModal.css'
import './ModalOverlay.css'

interface EmailRestoreModalProps {
  isOpen: boolean
  onClose: () => void
  visitorId: string
  onCreditsRestored: () => void
}

export default function EmailRestoreModal({ isOpen, onClose, visitorId, onCreditsRestored }: EmailRestoreModalProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'email' | 'verify'>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError(t('modal.restore.enterEmail'))
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await emailRestoreService.sendVerificationCode(email.trim())
      if (result.success) {
        setSuccess(t('modal.restore.codeSent'))
        setStep('verify')
      } else {
        setError(result.message || t('modal.restore.sendFailed'))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('modal.restore.sendFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAndRestore = async () => {
    if (!verificationCode.trim()) {
      setError(t('modal.restore.enterCode'))
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await emailRestoreService.verifyAndRestore(email.trim(), verificationCode.trim(), visitorId)
      if (result.success) {
        setSuccess(t('modal.restore.success', { count: result.totalCreditsRestored || 0 }))
        setTimeout(() => {
          onCreditsRestored()
          handleClose()
        }, 2000)
      } else {
        setError(result.message || t('modal.restore.verifyFailed'))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('modal.restore.verifyFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('email')
    setEmail('')
    setVerificationCode('')
    setError(null)
    setSuccess(null)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="email-restore-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>
        <h2>{t('chat.restoreCreditsTitle')}</h2>
        <p className="modal-description">
          {t('modal.restore.description')}
        </p>

        {step === 'email' && (
          <div className="email-restore-form">
            <label>
              {t('contact.email')}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('modal.restore.emailPlaceholder')}
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
              />
            </label>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <div className="modal-actions">
              <button onClick={handleClose} className="cancel-btn">{t('common.cancel')}</button>
              <button onClick={handleSendCode} disabled={isLoading || !email.trim()} className="primary-btn">
                {isLoading ? t('common.sending') : t('modal.restore.sendCode')}
              </button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="email-restore-form">
            <p className="info-text">{t('modal.restore.sentTo', { email })}</p>
            <label>
              {t('modal.restore.verificationCode')}
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyAndRestore()}
              />
            </label>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <div className="modal-actions">
              <button onClick={() => setStep('email')} className="cancel-btn">{t('common.back')}</button>
              <button onClick={handleVerifyAndRestore} disabled={isLoading || verificationCode.length !== 6} className="primary-btn">
                {isLoading ? t('modal.restore.verifying') : t('modal.restore.verifyAndRestore')}
              </button>
            </div>
            <button onClick={handleSendCode} className="resend-link" disabled={isLoading}>
              {t('modal.restore.resendCode')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

