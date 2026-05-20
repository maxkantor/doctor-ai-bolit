import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ScrollToTop from './components/ScrollToTop'
import GoogleAnalytics from './components/GoogleAnalytics'
import ChatPage from './pages/ChatPage'
import ContactPage from './pages/ContactPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Disclaimer from './pages/Disclaimer'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import YouTubePage from './pages/YouTubePage'
import Platform from './pages/Platform'
import SymptomsHubPage from './pages/SymptomsHubPage'
import SymptomSeoPage from './pages/SymptomSeoPage'
import Layout from './components/Layout'

const GuidesHubPage = lazy(() => import('./pages/GuidesHubPage'))
const GuideSeoPage = lazy(() => import('./pages/GuideSeoPage'))
const ToolsHubPage = lazy(() => import('./pages/ToolsHubPage'))
const ToolSeoPage = lazy(() => import('./pages/ToolSeoPage'))
const FaqHubPage = lazy(() => import('./pages/FaqHubPage'))
const FaqTopicSeoPage = lazy(() => import('./pages/FaqTopicSeoPage'))
const ConditionsHubPage = lazy(() => import('./pages/ConditionsHubPage'))
const ConditionSeoPage = lazy(() => import('./pages/ConditionSeoPage'))

function SeoPageFallback() {
  return (
    <div className="symptoms-page" style={{ padding: '2rem 1.25rem', textAlign: 'center' }}>
      <p style={{ color: '#64748b' }}>Loading…</p>
    </div>
  )
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <GoogleAnalytics />
      <Routes>
        <Route path="/" element={<Layout><LandingPage /></Layout>} />
        <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
        <Route path="/disclaimer" element={<Layout><Disclaimer /></Layout>} />
        <Route path="/youtube" element={<Layout><YouTubePage /></Layout>} />
        <Route path="/platform" element={<Layout><Platform /></Layout>} />
        <Route path="/symptoms" element={<Layout><SymptomsHubPage /></Layout>} />
        <Route path="/symptoms/:slug" element={<Layout><SymptomSeoPage /></Layout>} />
        <Route
          path="/guides"
          element={
            <Layout>
              <Suspense fallback={<SeoPageFallback />}>
                <GuidesHubPage />
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/guides/:slug"
          element={
            <Layout>
              <Suspense fallback={<SeoPageFallback />}>
                <GuideSeoPage />
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/tools"
          element={
            <Layout>
              <Suspense fallback={<SeoPageFallback />}>
                <ToolsHubPage />
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/tools/:slug"
          element={
            <Layout>
              <Suspense fallback={<SeoPageFallback />}>
                <ToolSeoPage />
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/faq"
          element={
            <Layout>
              <Suspense fallback={<SeoPageFallback />}>
                <FaqHubPage />
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/faq/:slug"
          element={
            <Layout>
              <Suspense fallback={<SeoPageFallback />}>
                <FaqTopicSeoPage />
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/conditions"
          element={
            <Layout>
              <Suspense fallback={<SeoPageFallback />}>
                <ConditionsHubPage />
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/conditions/:slug"
          element={
            <Layout>
              <Suspense fallback={<SeoPageFallback />}>
                <ConditionSeoPage />
              </Suspense>
            </Layout>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminDashboard />} />
        <Route path="/admin/user/:visitorId" element={<AdminDashboard />} />
        <Route path="/admin/stripe" element={<AdminDashboard />} />
        <Route path="/admin/emails" element={<AdminDashboard />} />
        <Route path="/admin/pricing" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminDashboard />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App
