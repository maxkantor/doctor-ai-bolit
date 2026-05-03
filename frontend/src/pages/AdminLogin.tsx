import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminService } from '../services/adminService'
import './AdminLogin.css'

export default function AdminLogin() {
  const { t } = useTranslation()
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await adminService.login(adminKey)
      if (result.success) {
        navigate('/admin/dashboard')
      } else {
        setError(result.error || t('adminLogin.invalidKey'))
      }
    } catch (err: any) {
      setError(err.message || t('adminLogin.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="login-container">
        <Link to="/" className="back-btn">← {t('common.backHome')}</Link>
        <h1>{t('adminLogin.title')}</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="adminKey">{t('adminLogin.adminKey')}</label>
            <input
              type="password"
              id="adminKey"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? t('adminLogin.loggingIn') : t('adminLogin.login')}
          </button>
        </form>
      </div>
    </div>
  )
}

