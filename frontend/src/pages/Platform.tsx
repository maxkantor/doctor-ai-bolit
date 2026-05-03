import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import './Platform.css'

const PLATFORM_URL = 'https://mk-ai-global-page.s3.us-east-1.amazonaws.com/platform/index.html'
const LOAD_TIMEOUT_MS = 8000

export default function Platform() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setLoadFailed(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setLoadFailed(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadFailed(true)
        setIsLoading(false)
      }
    }, LOAD_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [isLoading])

  return (
    <div className="platform-page">
      <header className="platform-header">
        <h1 className="platform-title">{t('platform.title')}</h1>
        <p className="platform-subtitle">{t('platform.subtitle')}</p>
      </header>

      <div className="platform-iframe-container">
        {isLoading && !loadFailed && (
          <div className="platform-loading" role="status" aria-live="polite">
            <div className="platform-spinner" aria-hidden="true" />
            <p>{t('platform.loading')}</p>
          </div>
        )}

        {loadFailed ? (
          <div className="platform-fallback" role="alert">
            <p>{t('platform.failed')}</p>
            <a
              href={PLATFORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="platform-fallback-link"
            >
              {t('platform.openNewTab')}
            </a>
          </div>
        ) : (
          <iframe
            src={PLATFORM_URL}
            title="MK AI & Performance Systems"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allow="clipboard-read; clipboard-write"
            onLoad={handleLoad}
            onError={handleError}
            className="platform-iframe"
          />
        )}
      </div>
    </div>
  )
}
