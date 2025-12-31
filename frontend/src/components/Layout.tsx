import { ReactNode } from 'react'
import Footer from './Footer'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  )
}

