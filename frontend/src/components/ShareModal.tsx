import { useState } from 'react'
import './ShareModal.css'

interface ShareModalProps {
  sessionId: string
  onClose: () => void
}

export default function ShareModal({ sessionId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const shareText = "Need health guidance? I tried DoctorAibolit — instant AI health information and wellness guidance. No signup needed."
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
          <button onClick={onClose} className="back-btn">← Back</button>
          <h2>Share Your Session</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="share-modal-content">
          <p className="share-text">{shareText}</p>
          <div className="share-buttons">
            <button onClick={() => handleShare('twitter')} className="share-btn twitter">
              Share on X
            </button>
            <button onClick={() => handleShare('facebook')} className="share-btn facebook">
              Share on Facebook
            </button>
            <button onClick={() => handleShare('reddit')} className="share-btn reddit">
              Share on Reddit
            </button>
            <button onClick={handleCopy} className="share-btn copy">
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

