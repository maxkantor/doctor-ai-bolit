import axios from 'axios'

// Ensure API URL includes /api suffix
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'https://api.doctoraibolit.com/api'
  // If URL doesn't end with /api, append it
  if (!envUrl.endsWith('/api')) {
    return envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`
  }
  return envUrl
}

const API_BASE_URL = getApiBaseUrl()

// Log API configuration for debugging
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL,
    envVar: import.meta.env.VITE_API_URL,
  })
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Add visitor ID to all requests
api.interceptors.request.use((config) => {
  const visitorId = localStorage.getItem('doctoraibolit_visitor_id')
  if (visitorId) {
    config.headers['X-Visitor-Id'] = visitorId
  }
  
  // Log request in development
  if (import.meta.env.DEV) {
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: Object.keys(config.headers || {}),
    })
  }
  
  return config
})

// Handle response errors globally
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }
    return response
  },
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A',
        data: error.response?.data,
      })
    }
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Only clear admin session if this is an admin request
      if (error.config?.headers?.['X-ADMIN-KEY']) {
        console.warn('⚠️ Admin authentication failed, clearing session')
        sessionStorage.removeItem('doctoraibolit_admin_key')
      }
    }
    
    return Promise.reject(error)
  }
)

export default api

