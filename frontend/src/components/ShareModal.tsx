import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ShareModal.css'

interface ShareModalProps {
  sessionId: string
  onClose: () => void
}

export default function ShareModal({ sessionId, onClose }: ShareModalProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const shareText = t('modal.share.shareText')
  const shareUrl = `${window.location.origin}/chat?session=${sessionId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(shareUrl)
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      reddit: `https://reddit.com/submit?title=${encodedText}&url=${encodedUrl}`,
    }

    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <button onClick={onClose} className="back-btn">← {t('common.back')}</button>
          <h2>{t('chat.share')}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="share-modal-content">
          <p className="share-text">{shareText}</p>
          <div className="share-buttons">
            <button onClick={() => handleShare('twitter')} className="share-btn twitter">
              {t('modal.share.x')}
            </button>
            <button onClick={() => handleShare('facebook')} className="share-btn facebook">
              {t('modal.share.facebook')}
            </button>
            <button onClick={() => handleShare('reddit')} className="share-btn reddit">
              {t('modal.share.reddit')}
            </button>
            <button onClick={handleCopy} className="share-btn copy">
              {copied ? t('modal.share.copied') : t('modal.share.copyLink')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

