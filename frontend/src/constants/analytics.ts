/**
 * GA4 must use a measurement ID dedicated to doctoraibolit.com only.
 * If GA4 shows unrelated pages (e.g. Etsy/shop titles), that ID is also installed elsewhere —
 * remove it from other sites or rotate VITE_GA_MEASUREMENT_ID to a new web stream.
 */
export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || 'G-CBL1LQSJSP'

/** Hostnames that may send hits to GA4 (production + www). */
export const ANALYTICS_ALLOWED_HOSTS = new Set([
  'doctoraibolit.com',
  'www.doctoraibolit.com',
])

export function isAnalyticsHost(hostname: string = window.location.hostname): boolean {
  const host = hostname.toLowerCase()
  return ANALYTICS_ALLOWED_HOSTS.has(host)
}
