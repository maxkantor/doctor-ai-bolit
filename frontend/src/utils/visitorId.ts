const VISITOR_ID_KEY = 'doctoraibolit_visitor_id'
const VISITOR_ID_COOKIE = 'doctoraibolit_visitor_id'

export function getOrCreateVisitorId(): string {
  // Check localStorage first
  let visitorId = localStorage.getItem(VISITOR_ID_KEY)
  
  if (visitorId) {
    console.log('✅ Found visitor ID in localStorage:', visitorId)
    setCookie(VISITOR_ID_COOKIE, visitorId, 365)
    return visitorId
  }

  // Check cookie
  visitorId = getCookie(VISITOR_ID_COOKIE)
  
  if (visitorId) {
    console.log('✅ Found visitor ID in cookie, restoring to localStorage:', visitorId)
    localStorage.setItem(VISITOR_ID_KEY, visitorId)
    setCookie(VISITOR_ID_COOKIE, visitorId, 365) // Refresh cookie expiration
    return visitorId
  }

  // Generate new UUID
  visitorId = generateUUID()
  console.log('🆕 Generated NEW visitor ID:', visitorId)
  localStorage.setItem(VISITOR_ID_KEY, visitorId)
  setCookie(VISITOR_ID_COOKIE, visitorId, 365)
  
  return visitorId
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function getCookie(name: string): string | null {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

