import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export default function GoogleAnalytics() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-CBL1LQSJSP', {
        page_path: pathname,
        page_title: document.title,
      })
    }
  }, [pathname])

  return null
}
