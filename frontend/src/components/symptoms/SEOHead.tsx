import { useEffect } from 'react'
import { SITE_ORIGIN, DEFAULT_OG_IMAGE } from '../../constants/siteOrigin'

export type SEOHeadJsonLd = { id: string; data: Record<string, unknown> }

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  const sel =
    attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key.replace(/"/g, '\\"')}"]`
  let el = document.querySelector(sel) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

type SEOHeadProps = {
  title: string
  description: string
  canonicalPath: string
  ogType?: string
  jsonLd: SEOHeadJsonLd[]
}

export default function SEOHead({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  jsonLd,
}: SEOHeadProps) {
  const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`
  const canonical = `${SITE_ORIGIN}${path}`

  useEffect(() => {
    document.title = title

    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:type', ogType)
    setMeta('property', 'og:image', DEFAULT_OG_IMAGE)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.href = canonical

    jsonLd.forEach(({ id, data }) => {
      let script = document.getElementById(id) as HTMLScriptElement | null
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.id = id
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(data)
    })

    return () => {
      jsonLd.forEach(({ id }) => document.getElementById(id)?.remove())
    }
  }, [title, description, canonical, ogType, jsonLd])

  return null
}
