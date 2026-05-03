import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

const LANGUAGES = [
  { code: 'en', flag: '🇺🇸', nameKey: 'language.en' },
  { code: 'ru', flag: '🇷🇺', nameKey: 'language.ru' },
  { code: 'fr', flag: '🇫🇷', nameKey: 'language.fr' },
  { code: 'de', flag: '🇩🇪', nameKey: 'language.de' },
  { code: 'es', flag: '🇪🇸', nameKey: 'language.es' },
  { code: 'zh', flag: '🇨🇳', nameKey: 'language.zh' },
  { code: 'hi', flag: '🇮🇳', nameKey: 'language.hi' },
  { code: 'uk', flag: '🇺🇦', nameKey: 'language.uk' },
]

interface LanguageSwitcherProps {
  compact?: boolean
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const normalizedLang = i18n.language?.split('-')[0] || 'en'
  const current = LANGUAGES.find((lang) => lang.code === normalizedLang) || LANGUAGES[0]

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleChange = async (selected: string) => {
    await i18n.changeLanguage(selected)
    localStorage.setItem('doctoraibolit_language', selected)
    setOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className={`language-switcher ${compact ? 'language-switcher--compact' : ''}`}
      aria-label={t('language.selectorLabel')}
    >
      <button
        type="button"
        className="language-switcher-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('language.selectorLabel')}
      >
        <span className="language-flag" aria-hidden="true">{current.flag}</span>
        <span className="language-current-text">
          {!compact && <span className="language-label">{t('language.label')} </span>}
          {t(current.nameKey)}
        </span>
        <span className="language-chevron" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="language-menu" role="listbox" aria-label={t('language.selectorLabel')}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`language-option ${lang.code === normalizedLang ? 'active' : ''}`}
              onClick={() => handleChange(lang.code)}
            >
              <span className="language-option-flag" aria-hidden="true">{lang.flag}</span>
              <span>{t(lang.nameKey)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
