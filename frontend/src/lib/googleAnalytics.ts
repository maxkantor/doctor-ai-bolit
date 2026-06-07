import { ANALYTICS_ALLOWED_HOSTS, GA_MEASUREMENT_ID, isAnalyticsHost } from '../constants/analytics'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
    __doctoraibolitGaInitialized?: boolean
  }
}

let initPromise: Promise<boolean> | null = null

function ensureDataLayer(): void {
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args)
    }
  }
}

/** Load gtag.js and configure GA4 only on allowed production hostnames. */
export function initGoogleAnalytics(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (!isAnalyticsHost()) return Promise.resolve(false)
  if (window.__doctoraibolitGaInitialized) return Promise.resolve(true)
  if (initPromise) return initPromise

  initPromise = new Promise((resolve) => {
    ensureDataLayer()
    window.gtag!('js', new Date())
    window.gtag!('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
      send_page_view: false,
      page_location: window.location.href,
      page_hostname: window.location.hostname,
    })

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.onload = () => {
      window.__doctoraibolitGaInitialized = true
      resolve(true)
    }
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })

  return initPromise
}

export type AnalyticsPageView = {
  page_path: string
  page_title: string
  page_location: string
}

export function buildAnalyticsPageView(pathname: string, search: string): AnalyticsPageView | null {
  if (!isAnalyticsHost()) return null

  const page_path = `${pathname}${search}` || '/'
  return {
    page_path,
    page_title: document.title,
    page_location: `${window.location.origin}${page_path}`,
  }
}

export function trackPageView(view: AnalyticsPageView): void {
  if (!isAnalyticsHost() || typeof window.gtag !== 'function') return

  window.gtag('event', 'page_view', {
    send_to: GA_MEASUREMENT_ID,
    page_path: view.page_path,
    page_title: view.page_title,
    page_location: view.page_location,
    page_hostname: new URL(view.page_location).hostname,
  })
}

export function getAnalyticsDebugInfo(): { enabled: boolean; hosts: string[]; measurementId: string } {
  return {
    enabled: isAnalyticsHost(),
    hosts: [...ANALYTICS_ALLOWED_HOSTS],
    measurementId: GA_MEASUREMENT_ID,
  }
}
