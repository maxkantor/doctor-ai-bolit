import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ru from './locales/ru.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import es from './locales/es.json'
import zh from './locales/zh.json'
import hi from './locales/hi.json'
import uk from './locales/uk.json'

const supportedLanguages = ['en', 'ru', 'fr', 'de', 'es', 'zh', 'hi', 'uk']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      fr: { translation: fr },
      de: { translation: de },
      es: { translation: es },
      zh: { translation: zh },
      hi: { translation: hi },
      uk: { translation: uk },
    },
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'doctoraibolit_language',
      convertDetectedLanguage: (lng) => {
        if (!lng) return 'en'
        const normalized = lng.toLowerCase().split('-')[0]
        return supportedLanguages.includes(normalized) ? normalized : 'en'
      },
    },
    returnNull: false,
  })

export default i18n
