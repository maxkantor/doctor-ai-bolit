import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Footer from './Footer'
import PremiumNavbar from './PremiumNavbar'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const hideNavbar = location.pathname.startsWith('/chat') || location.pathname.startsWith('/admin')

  return (
    <div className="layout">
      {!hideNavbar && <PremiumNavbar />}
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  )
}

