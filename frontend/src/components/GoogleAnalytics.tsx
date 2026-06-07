import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { buildAnalyticsPageView, initGoogleAnalytics, trackPageView } from '../lib/googleAnalytics'

export default function GoogleAnalytics() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    void initGoogleAnalytics()
  }, [])

  useEffect(() => {
    let cancelled = false
    // Defer until after SEOHead / Layout title updates on the same navigation.
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return
        const view = buildAnalyticsPageView(pathname, search)
        if (!view) return
        void initGoogleAnalytics().then((ready) => {
          if (ready && !cancelled) trackPageView(view)
        })
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [pathname, search])

  return null
}
