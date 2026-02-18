import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ScrollToTop from './components/ScrollToTop'
import ChatPage from './pages/ChatPage'
import ContactPage from './pages/ContactPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Disclaimer from './pages/Disclaimer'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import YouTubePage from './pages/YouTubePage'
import Platform from './pages/Platform'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><LandingPage /></Layout>} />
        <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
        <Route path="/disclaimer" element={<Layout><Disclaimer /></Layout>} />
        <Route path="/youtube" element={<Layout><YouTubePage /></Layout>} />
        <Route path="/platform" element={<Layout><Platform /></Layout>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminDashboard />} />
        <Route path="/admin/user/:visitorId" element={<AdminDashboard />} />
        <Route path="/admin/stripe" element={<AdminDashboard />} />
        <Route path="/admin/emails" element={<AdminDashboard />} />
        <Route path="/admin/pricing" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App

