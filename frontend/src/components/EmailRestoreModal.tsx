import { useState } from 'react'
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
  const [step, setStep] = useState<'email' | 'verify'>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await emailRestoreService.sendVerificationCode(email.trim())
      if (result.success) {
        setSuccess('Verification code sent! Check your email.')
        setStep('verify')
      } else {
        setError(result.message || 'Failed to send verification code')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAndRestore = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await emailRestoreService.verifyAndRestore(email.trim(), verificationCode.trim(), visitorId)
      if (result.success) {
        setSuccess(`Success! Restored ${result.totalCreditsRestored || 0} credits.`)
        setTimeout(() => {
          onCreditsRestored()
          handleClose()
        }, 2000)
      } else {
        setError(result.message || 'Verification failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Verification failed')
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
        <h2>Restore Credits from Another Device</h2>
        <p className="modal-description">
          Enter the email address you used when making a purchase to restore your credits on this device.
        </p>

        {step === 'email' && (
          <div className="email-restore-form">
            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
              />
            </label>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <div className="modal-actions">
              <button onClick={handleClose} className="cancel-btn">Cancel</button>
              <button onClick={handleSendCode} disabled={isLoading || !email.trim()} className="primary-btn">
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="email-restore-form">
            <p className="info-text">We sent a 6-digit code to <strong>{email}</strong></p>
            <label>
              Verification Code
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
              <button onClick={() => setStep('email')} className="cancel-btn">Back</button>
              <button onClick={handleVerifyAndRestore} disabled={isLoading || verificationCode.length !== 6} className="primary-btn">
                {isLoading ? 'Verifying...' : 'Verify & Restore Credits'}
              </button>
            </div>
            <button onClick={handleSendCode} className="resend-link" disabled={isLoading}>
              Resend code
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

