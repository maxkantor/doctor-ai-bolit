import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { contactService } from '../services/contactService'
import './ContactPage.css'

export default function ContactPage() {
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
      setName('')
      setEmail('')
      setMessage('')
    } catch (error) {
      console.error('Failed to submit contact form:', error)
      alert(t('contact.submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="contact-page">
        <div className="contact-container">
          <div className="success-message">
            <h2>{t('contact.thankYou')}</h2>
            <p>{t('contact.success')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="contact-page">
      <div className="contact-container">
        <Link to="/" className="back-btn">← {t('common.backHome')}</Link>
        <h1>{t('contact.title')}</h1>
        <p className="contact-intro">
          {t('contact.intro')}
        </p>
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">{t('contact.name')}</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('contact.email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">{t('contact.message')}</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? t('common.sending') : t('contact.send')}
          </button>
        </form>
      </div>
    </div>
  )
}

