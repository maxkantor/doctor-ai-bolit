import { ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Footer from './Footer'
import PremiumNavbar from './PremiumNavbar'
import { DEFAULT_DOCUMENT_TITLE, DEFAULT_META_DESCRIPTION } from '../constants/siteOrigin'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const hideNavbar = location.pathname.startsWith('/chat') || location.pathname.startsWith('/admin')

  useEffect(() => {
    if (!location.pathname.startsWith('/symptoms')) {
      document.title = DEFAULT_DOCUMENT_TITLE
      const m = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
      if (m) m.setAttribute('content', DEFAULT_META_DESCRIPTION)
    }
  }, [location.pathname])

  return (
    <div className="layout">
      {!hideNavbar && <PremiumNavbar />}
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  )
}

