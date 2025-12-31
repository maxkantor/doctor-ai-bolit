import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { adminService } from '../services/adminService'
import './AdminLogin.css'

export default function AdminLogin() {
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
        setError(result.error || 'Invalid admin key')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="login-container">
        <Link to="/" className="back-btn">← Back to Home</Link>
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="adminKey">Admin Key</label>
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
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

