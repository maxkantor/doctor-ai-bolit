import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { adminService } from '../services/adminService'
import { Visitor, ContactMessage, PricingConfig, PricingPlan, PaymentHistory, AdminUserSummary, AdminUsageTimelineEntry, AdminDashboardSummary } from '../types'
import './AdminDashboard.css'

const ADMIN_SESSION_ID_KEY = 'doctoraibolit_admin_session_id'
const VISITOR_ID_KEY = 'doctoraibolit_visitor_id'

function getOrCreateAdminSessionId() {
  let sessionId = sessionStorage.getItem(ADMIN_SESSION_ID_KEY)
  if (!sessionId) {
    sessionId = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    sessionStorage.setItem(ADMIN_SESSION_ID_KEY, sessionId)
  }
  return sessionId
}

function getStoredVisitorId() {
  return localStorage.getItem(VISITOR_ID_KEY) || ''
}

function shortId(value?: string) {
  if (!value) return 'Not found'
  return value.length > 18 ? `${value.slice(0, 10)}...${value.slice(-6)}` : value
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [enrichedUsers, setEnrichedUsers] = useState<AdminUserSummary[]>([])
  const [emails, setEmails] = useState<ContactMessage[]>([])
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const [creditsToAdd, setCreditsToAdd] = useState(10)
  const [resetMessageCountTo, setResetMessageCountTo] = useState<number | undefined>(undefined)
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null)
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [replyingToEmail, setReplyingToEmail] = useState<ContactMessage | null>(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)
  const [dashboardPayments, setDashboardPayments] = useState<PaymentHistory[]>([])
  const [dashboardSummary, setDashboardSummary] = useState<AdminDashboardSummary | null>(null)
  const [usageTimeline, setUsageTimeline] = useState<AdminUsageTimelineEntry[]>([])
  const [adminContext, setAdminContext] = useState(() => ({
    adminSessionId: getOrCreateAdminSessionId(),
    browserVisitorId: getStoredVisitorId(),
  }))

  const freeLimit = pricingConfig?.freeMessageLimit ?? 5
  const selectedUserSummary = selectedVisitor
    ? enrichedUsers.find((u) => u.visitorId === selectedVisitor.visitorId)
    : undefined

  const activeLast24h = dashboardSummary?.activeLast24Hours ?? enrichedUsers.filter((u) => {
    const lastActiveMs = new Date(u.lastActive).getTime()
    return Number.isFinite(lastActiveMs) && Date.now() - lastActiveMs <= 24 * 60 * 60 * 1000
  }).length
  const payingUsers = dashboardSummary?.payingUsers ?? enrichedUsers.filter((u) => u.totalSpent > 0 || u.isPremium).length
  const totalRevenue = dashboardSummary?.totalRevenue ?? dashboardPayments.reduce((acc, p) => acc + (p.amount || 0), 0)
  const conversionRate = dashboardSummary?.conversionRatePercent ?? (enrichedUsers.length > 0 ? (payingUsers / enrichedUsers.length) * 100 : 0)
  const avgMessagesBeforePayment = dashboardSummary?.averageMessagesBeforePayment ?? (
    payingUsers > 0
      ? enrichedUsers
          .filter((u) => u.totalSpent > 0 || u.isPremium)
          .reduce((acc, u) => acc + (u.messageCount || 0), 0) / payingUsers
      : 0
  )
  const usersUsedAllFree = dashboardSummary?.usersUsedAllFreeCredits ?? enrichedUsers.filter((u) => u.messageCount >= freeLimit).length
  const funnelVisited = dashboardSummary?.funnelVisited ?? enrichedUsers.length
  const funnelStarted = dashboardSummary?.funnelStartedChat ?? enrichedUsers.filter((u) => u.messageCount > 0).length
  const funnelUsedFree = dashboardSummary?.funnelUsedFreeCredits ?? usersUsedAllFree
  const funnelPaid = dashboardSummary?.funnelPaid ?? payingUsers
  const contactMessagesCount = dashboardSummary?.contactMessagesCount ?? emails.length
  const photoCheckUsageCount = dashboardSummary?.photoCheckUsageCount ?? enrichedUsers.reduce((acc, user) => acc + (user.photoCheckCount || 0), 0)
  const sortedTransactions = (dashboardSummary?.recentTransactions?.length ? dashboardSummary.recentTransactions : dashboardPayments)
    .slice()
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 10)
  const selectedFreeMessagesUsed = selectedVisitor ? Math.min(selectedVisitor.messageCount, freeLimit) : 0
  const selectedFreeMessagesRemaining = selectedVisitor ? Math.max(0, freeLimit - selectedFreeMessagesUsed) : 0
  const selectedTotalAvailable = selectedVisitor ? selectedVisitor.creditBalance + selectedFreeMessagesRemaining : 0

  const normalizeEmailStatus = (status?: string) => {
    const normalized = (status || '').toLowerCase().trim()
    if (normalized === 'resolved') return 'Resolved'
    if (normalized === 'replied') return 'Replied'
    return 'New'
  }

  // Auto-correct editing plan values when it changes
  useEffect(() => {
    if (editingPlan && editingPlan.planId) {
      // Force correct values for known plans
      if (editingPlan.price === 1.99 || editingPlan.name.includes("24-Hour") || editingPlan.name.includes("24 Hour")) {
        setEditingPlan({
          ...editingPlan,
          name: "20 Messages",
          credits: 20,
          price: 1.99,
          description: editingPlan.description && !editingPlan.description.includes("24-Hour") && !editingPlan.description.includes("24 Hour") 
            ? editingPlan.description 
            : "Continue your conversation with 20 additional messages whenever you need support."
        })
      } else if (editingPlan.price === 3.99 || editingPlan.name.includes("7-Day") || editingPlan.name.includes("7 Day")) {
        setEditingPlan({
          ...editingPlan,
          name: "50 Messages",
          credits: 50,
          price: 3.99,
          description: editingPlan.description && !editingPlan.description.includes("7-Day") && !editingPlan.description.includes("7 Day")
            ? editingPlan.description
            : "Extended support with 50 additional messages for ongoing conversations."
        })
      }
    }
  }, [editingPlan?.planId, editingPlan?.price])

  useEffect(() => {
    // Check if admin is logged in
    const adminKey = sessionStorage.getItem('doctoraibolit_admin_key')
    if (!adminKey || adminKey.trim().length === 0) {
      console.log('❌ No admin key found, redirecting to login')
      navigate('/admin/login')
      return
    }

    // Validate admin key by making a test request
    const validateAuth = async () => {
      try {
        // Make a lightweight request to validate the key
        await adminService.getUsers()
        // If successful, proceed with loading data
        const path = location.pathname
        if (path.includes('/user/')) {
          setActiveTab('user-detail')
          // Load selected visitor
          const visitorId = path.split('/user/')[1]
          if (visitorId) {
            loadVisitorDetail(visitorId)
          }
        } else if (path.includes('/users')) setActiveTab('users')
        else if (path.includes('/stripe')) setActiveTab('stripe')
        else if (path.includes('/emails')) setActiveTab('emails')
        else if (path.includes('/settings') || path.includes('/pricing')) setActiveTab('pricing')
        else setActiveTab('dashboard')

        loadData()
        if (path.includes('/settings') || path.includes('/pricing')) {
          loadPricingData()
        }
      } catch (error: any) {
        console.error('❌ Authentication validation failed:', error)
        // If authentication fails, redirect to login
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          sessionStorage.removeItem('doctoraibolit_admin_key')
          alert('Your session has expired. Please login again.')
          navigate('/admin/login')
        } else {
          // For other errors (network, etc.), still try to load data but show error
          console.warn('⚠️ Auth validation failed but continuing:', error)
          const path = location.pathname
          if (path.includes('/user/')) {
            setActiveTab('user-detail')
            const visitorId = path.split('/user/')[1]
            if (visitorId) {
              loadVisitorDetail(visitorId)
            }
          } else if (path.includes('/users')) setActiveTab('users')
          else if (path.includes('/stripe')) setActiveTab('stripe')
          else if (path.includes('/emails')) setActiveTab('emails')
          else if (path.includes('/settings') || path.includes('/pricing')) setActiveTab('pricing')
          else setActiveTab('dashboard')

          loadData()
          if (path.includes('/settings') || path.includes('/pricing')) {
            loadPricingData()
          }
        }
      }
    }

    validateAuth()
  }, [location.pathname, navigate])

  const loadData = async () => {
    setIsLoadingData(true)
    setDataError(null)
    try {
      console.log('🔍 Loading admin data...')
      const apiDomain = import.meta.env.VITE_API_DOMAIN || 'api.doctoraibolit.com'
      console.log('📡 API Base URL:', import.meta.env.VITE_API_URL || `https://${apiDomain}/api`)
      console.log('🔑 Admin Key:', sessionStorage.getItem('doctoraibolit_admin_key') ? 'Present' : 'Missing')
      setAdminContext({
        adminSessionId: getOrCreateAdminSessionId(),
        browserVisitorId: getStoredVisitorId(),
      })
      
      const [visitorsResult, enrichedUsersResult, emailsResult, paymentsResult, summaryResult] = await Promise.allSettled([
        adminService.getUsers(),
        adminService.getEnrichedUsers(),
        adminService.getEmails(),
        adminService.getPaymentHistory(),
        adminService.getDashboardSummary(),
      ])

      const visitorsData = visitorsResult.status === 'fulfilled' ? visitorsResult.value : visitors
      const enrichedUsersData = enrichedUsersResult.status === 'fulfilled' ? enrichedUsersResult.value : enrichedUsers
      const emailsData = emailsResult.status === 'fulfilled' ? emailsResult.value : emails
      const paymentsData = paymentsResult.status === 'fulfilled' ? paymentsResult.value : dashboardPayments
      const summaryData = summaryResult.status === 'fulfilled' ? summaryResult.value : dashboardSummary
      const failedLoads = [
        visitorsResult.status === 'rejected' ? 'users' : null,
        enrichedUsersResult.status === 'rejected' ? 'enriched users' : null,
        emailsResult.status === 'rejected' ? 'emails' : null,
        paymentsResult.status === 'rejected' ? 'payments' : null,
        summaryResult.status === 'rejected' ? 'dashboard summary' : null,
      ].filter(Boolean)
      
      console.log('✅ Loaded visitors:', visitorsData?.length || 0, visitorsData)
      console.log('✅ Loaded enriched users:', enrichedUsersData?.length || 0)
      console.log('✅ Loaded emails:', emailsData?.length || 0, emailsData)
      console.log('✅ Loaded payments:', paymentsData?.length || 0)
      console.log('✅ Loaded dashboard summary')
      
      setVisitors(visitorsData || [])
      setEnrichedUsers(enrichedUsersData || [])
      setEmails(emailsData || [])
      setDashboardPayments(paymentsData || [])
      setDashboardSummary(summaryData || null)
      setDataError(failedLoads.length > 0 ? `Some CRM data failed to load: ${failedLoads.join(', ')}. Showing the rest.` : null)
      
      // If we have a selected visitor, update it from the fresh data to prevent stale data
      if (selectedVisitor) {
        const updatedVisitor = visitorsData?.find(v => v.visitorId === selectedVisitor.visitorId)
        if (updatedVisitor) {
          console.log('🔄 Updating selectedVisitor from fresh data:', updatedVisitor)
          setSelectedVisitor(updatedVisitor)
        }
      }
      
      setIsLoadingData(false)
    } catch (error: any) {
      console.error('❌ Failed to load data:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL
      })
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error'
      setDataError(`Failed to load: ${errorMessage} (Status: ${error?.response?.status || 'N/A'})`)
      
      // Only redirect to login if it's an authentication error
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        alert('Authentication failed. Please login again.')
        navigate('/admin/login')
      } else {
        // Set empty arrays so UI doesn't break
        setVisitors([])
        setEmails([])
      }
      setIsLoadingData(false)
    }
  }

  const loadVisitorDetail = async (visitorId: string) => {
    try {
      const visitor = await adminService.getUser(visitorId)
      setSelectedVisitor(visitor)
      // Load payment history for this visitor
      await Promise.all([
        loadPaymentHistory(visitorId),
        loadUsageTimeline(visitorId),
      ])
    } catch (error) {
      console.error('Failed to load visitor:', error)
    }
  }

  const loadUsageTimeline = async (visitorId: string) => {
    try {
      const timeline = await adminService.getUsageTimeline(visitorId)
      setUsageTimeline(timeline)
    } catch (error) {
      console.error('Failed to load usage timeline:', error)
      setUsageTimeline([])
    }
  }

  const loadPaymentHistory = async (visitorId?: string) => {
    setIsLoadingPayments(true)
    try {
      const payments = await adminService.getPaymentHistory(visitorId)
      setPaymentHistory(payments)
    } catch (error) {
      console.error('Failed to load payment history:', error)
      setPaymentHistory([])
    } finally {
      setIsLoadingPayments(false)
    }
  }

  const handleAddCredits = async () => {
    if (!selectedVisitor) return
    try {
      await adminService.addCredits(selectedVisitor.visitorId, creditsToAdd)
      await loadVisitorDetail(selectedVisitor.visitorId)
      await loadData()
      alert(`Added ${creditsToAdd} credits successfully!`)
    } catch (error) {
      console.error('Failed to add credits:', error)
      alert('Failed to add credits. Please try again.')
    }
  }

  const handleQuickCredits = async (credits: number) => {
    if (!selectedVisitor) return
    try {
      await adminService.addCredits(selectedVisitor.visitorId, credits)
      await loadVisitorDetail(selectedVisitor.visitorId)
      await loadData()
      alert(`Added ${credits} credits successfully!`)
    } catch (error) {
      console.error('Failed to add quick credits:', error)
      alert('Failed to add credits. Please try again.')
    }
  }

  const handleResetCredits = async () => {
    if (!selectedVisitor) return
    try {
      await adminService.resetCredits(selectedVisitor.visitorId)
      await loadVisitorDetail(selectedVisitor.visitorId)
      await loadData()
      alert('Credits reset to 0 successfully!')
    } catch (error) {
      console.error('Failed to reset credits:', error)
      alert('Failed to reset credits. Please try again.')
    }
  }

  const handleMarkPremium = async () => {
    if (!selectedVisitor) return
    try {
      await adminService.markPremium(selectedVisitor.visitorId, true)
      await loadVisitorDetail(selectedVisitor.visitorId)
      await loadData()
      alert('User marked as premium successfully!')
    } catch (error) {
      console.error('Failed to mark premium:', error)
      alert('Failed to mark premium. Please try again.')
    }
  }

  const handleResetMessageCount = async () => {
    if (!selectedVisitor) return
    try {
      await adminService.resetMessageCount(selectedVisitor.visitorId, resetMessageCountTo)
      // Wait a bit for the database to commit the change
      await new Promise(resolve => setTimeout(resolve, 500))
      // Reload visitor detail first to get fresh data
      await loadVisitorDetail(selectedVisitor.visitorId)
      // Then reload all data (this might update the visitors list)
      await loadData()
      // Reload visitor detail again after loadData to ensure we have the latest
      await loadVisitorDetail(selectedVisitor.visitorId)
      await loadPaymentHistory(selectedVisitor.visitorId) // Refresh payment history
      const message = resetMessageCountTo !== undefined 
        ? `Reset message count to ${resetMessageCountTo} successfully!`
        : 'Reset message count to free limit successfully!'
      alert(message)
      setResetMessageCountTo(undefined)
    } catch (error) {
      console.error('Failed to reset message count:', error)
      alert('Failed to reset message count. Please try again.')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('doctoraibolit_admin_key')
    navigate('/admin/login')
  }

  const copyToClipboard = async (value?: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      alert('Copied to clipboard.')
    } catch (error) {
      console.error('Failed to copy:', error)
      alert(value)
    }
  }

  const loadPricingData = async () => {
    try {
      const [config, plans] = await Promise.all([
        adminService.getPricingConfig(),
        adminService.getPricingPlans(),
      ])
      setPricingConfig(config)
      setPricingPlans(plans.sort((a, b) => a.displayOrder - b.displayOrder))
    } catch (error) {
      console.error('Failed to load pricing data:', error)
    }
  }

  const handleSaveConfig = async () => {
    if (!pricingConfig) return
    setIsSavingConfig(true)
    try {
      await adminService.savePricingConfig(pricingConfig)
      alert('Configuration saved successfully!')
    } catch (error) {
      console.error('Failed to save config:', error)
      alert('Failed to save configuration. Please try again.')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleSavePlan = async (plan: PricingPlan) => {
    try {
      // Force correct values before saving
      const planToSave = { ...plan }
      if (plan.price === 1.99 || plan.name.includes("24-Hour") || plan.name.includes("24 Hour")) {
        planToSave.name = "20 Messages"
        planToSave.credits = 20
        planToSave.price = 1.99
        if (!planToSave.description || planToSave.description.includes("24-Hour") || planToSave.description.includes("24 Hour")) {
          planToSave.description = "Continue your conversation with 20 additional messages whenever you need support."
        }
      } else if (plan.price === 3.99 || plan.name.includes("7-Day") || plan.name.includes("7 Day")) {
        planToSave.name = "50 Messages"
        planToSave.credits = 50
        planToSave.price = 3.99
        if (!planToSave.description || planToSave.description.includes("7-Day") || planToSave.description.includes("7 Day")) {
          planToSave.description = "Extended support with 50 additional messages for ongoing conversations."
        }
      }
      
      if (planToSave.planId) {
        await adminService.updatePricingPlan(planToSave.planId, planToSave)
      } else {
        await adminService.createPricingPlan(planToSave)
      }
      await loadPricingData()
      setEditingPlan(null)
      alert('Plan saved successfully!')
    } catch (error) {
      console.error('Failed to save plan:', error)
      alert('Failed to save plan. Please try again.')
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    try {
      await adminService.deletePricingPlan(planId)
      await loadPricingData()
      alert('Plan deleted successfully!')
    } catch (error) {
      console.error('Failed to delete plan:', error)
      alert('Failed to delete plan. Please try again.')
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Dashboard</h2>
        <nav className="admin-nav">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => navigate('/admin/dashboard')}
          >
            Dashboard
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => navigate('/admin/users')}
          >
            Users
          </button>
          <button
            className={activeTab === 'stripe' ? 'active' : ''}
            onClick={() => navigate('/admin/stripe')}
          >
            Stripe
          </button>
          <button
            className={activeTab === 'emails' ? 'active' : ''}
            onClick={() => navigate('/admin/emails')}
          >
            Emails
          </button>
          <button
            className={activeTab === 'pricing' ? 'active' : ''}
            onClick={() => navigate('/admin/pricing')}
          >
            Pricing
          </button>
        </nav>
        <div className="admin-context-card">
          <div className="admin-context-title">This Browser</div>
          <button
            type="button"
            className="admin-context-copy"
            onClick={() => copyToClipboard(adminContext.browserVisitorId)}
            title={adminContext.browserVisitorId || 'No visitor ID found in this browser'}
          >
            <span>Visitor</span>
            <strong>{shortId(adminContext.browserVisitorId)}</strong>
          </button>
          <button
            type="button"
            className="admin-context-copy"
            onClick={() => copyToClipboard(adminContext.adminSessionId)}
            title={adminContext.adminSessionId}
          >
            <span>Admin session</span>
            <strong>{shortId(adminContext.adminSessionId)}</strong>
          </button>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="admin-content">
        <div className="crm-identity-banner">
          <div>
            <span>Your browser visitor ID</span>
            <strong title={adminContext.browserVisitorId || 'No visitor ID found in this browser'}>
              {adminContext.browserVisitorId || 'Not found in this browser'}
            </strong>
          </div>
          <div>
            <span>Admin session ID</span>
            <strong title={adminContext.adminSessionId}>{adminContext.adminSessionId}</strong>
          </div>
          <button type="button" onClick={() => copyToClipboard(adminContext.browserVisitorId || adminContext.adminSessionId)}>
            Copy reset ID
          </button>
        </div>
        {activeTab === 'dashboard' && (
          <div className="dashboard-metrics">
            <h1>Dashboard</h1>
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Total Users</h3>
                <p className="metric-value">{dashboardSummary?.totalUsers ?? enrichedUsers.length}</p>
              </div>
              <div className="metric-card">
                <h3>Active (24h)</h3>
                <p className="metric-value">{activeLast24h}</p>
              </div>
              <div className="metric-card">
                <h3>Paying Users</h3>
                <p className="metric-value">{payingUsers}</p>
              </div>
              <div className="metric-card">
                <h3>Total Revenue</h3>
                <p className="metric-value">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="metric-card">
                <h3>Conversion Rate</h3>
                <p className="metric-value">{conversionRate.toFixed(1)}%</p>
              </div>
              <div className="metric-card">
                <h3>Avg Messages Before Payment</h3>
                <p className="metric-value">{avgMessagesBeforePayment.toFixed(1)}</p>
              </div>
              <div className="metric-card">
                <h3>Used All Free Credits</h3>
                <p className="metric-value">{usersUsedAllFree}</p>
              </div>
              <div className="metric-card">
                <h3>Contact Messages</h3>
                <p className="metric-value">{contactMessagesCount}</p>
              </div>
              <div className="metric-card">
                <h3>AI Photo Checks</h3>
                <p className="metric-value">{photoCheckUsageCount}</p>
              </div>
            </div>

            <div className="user-detail-card" style={{ marginTop: '1.5rem' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Conversion Funnel</h2>
              <div className="metrics-grid" style={{ gap: '1rem' }}>
                <div className="metric-card">
                  <h3>Visited</h3>
                  <p className="metric-value">{funnelVisited}</p>
                </div>
                <div className="metric-card">
                  <h3>Started Chat</h3>
                  <p className="metric-value">{funnelStarted}</p>
                </div>
                <div className="metric-card">
                  <h3>Used Free Credits</h3>
                  <p className="metric-value">{funnelUsedFree}</p>
                </div>
                <div className="metric-card">
                  <h3>Paid</h3>
                  <p className="metric-value">{funnelPaid}</p>
                </div>
              </div>
            </div>

            <div className="payment-history-section" style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginTop: '1.5rem' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Latest Transactions</h2>
              {sortedTransactions.length === 0 ? (
                <p style={{ color: '#666' }}>No transactions yet.</p>
              ) : (
                <div className="payment-history-table" style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', minWidth: '860px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTransactions.map((payment) => (
                        <tr key={payment.paymentId}>
                          <td>{new Date(payment.paymentDate).toLocaleString()}</td>
                          <td>{payment.visitorId.substring(0, 8)}...</td>
                          <td>{payment.customerEmail || 'N/A'}</td>
                          <td>{payment.planName}</td>
                          <td>${payment.amount.toFixed(2)}</td>
                          <td>{payment.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-view">
            <h1>Users</h1>
            {isLoadingData && <p style={{ color: '#666', padding: '1rem' }}>Loading users...</p>}
            {dataError && (
              <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong>Error:</strong> {dataError}
                <button onClick={loadData} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Retry
                </button>
              </div>
            )}
            {!isLoadingData && enrichedUsers.length === 0 && !dataError ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#f9fafb', borderRadius: '8px', marginTop: '1rem' }}>
                <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No users found</p>
                <p style={{ fontSize: '0.875rem' }}>
                  Users will appear here once they start using the chat service.
                </p>
              </div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Visitor ID</th>
                      <th>Email</th>
                      <th>Created</th>
                      <th>Total Spent</th>
                      <th>Credits Purchased</th>
                      <th>Photo Checks</th>
                      <th>Conversion Status</th>
                      <th>Last Session Messages</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedUsers.map((user) => {
                        const conversionClass = user.conversionStatus.toLowerCase().includes('converted')
                          ? 'status-converted'
                          : user.conversionStatus.toLowerCase().includes('free')
                            ? 'status-free-only'
                            : user.conversionStatus.toLowerCase().includes('engaged')
                              ? 'status-engaged'
                              : 'status-new'

                        return (
                        <tr key={user.visitorId}>
                          <td>
                            <button
                              type="button"
                              className="id-pill"
                              title={user.visitorId}
                              onClick={() => copyToClipboard(user.visitorId)}
                            >
                              {shortId(user.visitorId)}
                            </button>
                          </td>
                          <td>{user.email || 'N/A'}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>${user.totalSpent.toFixed(2)}</td>
                          <td>{user.creditsPurchased}</td>
                          <td>{user.photoCheckCount || 0}</td>
                          <td>
                            <span className={`status-chip ${conversionClass}`}>{user.conversionStatus}</span>
                          </td>
                          <td>{user.lastSessionMessages}</td>
                          <td>{new Date(user.lastActive).toLocaleString()}</td>
                          <td>
                            <button
                              onClick={() => {
                                const visitor = visitors.find((v) => v.visitorId === user.visitorId)
                                if (visitor) {
                                  setSelectedVisitor(visitor)
                                }
                                navigate(`/admin/user/${user.visitorId}`)
                              }}
                              className="view-btn"
                            >
                            View
                            </button>
                          </td>
                        </tr>
                        )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="emails-view">
            <h1>Contact Messages</h1>
            <div className="emails-list">
              {emails.map((email) => (
                <div key={email.messageId} className="email-item">
                  <div className="email-header">
                    <strong>{email.name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`status-chip email-status-chip status-${normalizeEmailStatus(email.status).toLowerCase()}`}>
                        {normalizeEmailStatus(email.status)}
                      </span>
                      <span className="email-date">
                        {new Date(email.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="email-address">
                    <a href={`mailto:${email.email}`}>{email.email}</a>
                  </div>
                  {email.visitorId ? (
                    <div className="email-visitor-id" style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                      Visitor ID: <code style={{ userSelect: 'all' }}>{email.visitorId}</code>
                    </div>
                  ) : null}
                  {email.emailSent === false ? (
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#b45309', fontWeight: 500 }}>
                      Admin email notification failed — message is saved in CRM.
                    </div>
                  ) : null}
                  <div className="email-message">{email.message}</div>
                  <div className="email-actions" style={{ marginTop: '12px' }}>
                    <button
                      onClick={() => {
                        setReplyingToEmail(email)
                        setReplySubject(`Re: Contact from ${email.name}`)
                        setReplyBody(`\n\n---\nOriginal message from ${email.name}:\n${email.message}`)
                      }}
                      className="reply-btn"
                      style={{
                        padding: '8px 16px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      Reply
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await adminService.updateEmailStatus(email.messageId, 'resolved')
                          await loadData()
                        } catch (error) {
                          console.error('Failed to mark email as resolved:', error)
                          alert('Failed to update email status. Please try again.')
                        }
                      }}
                      className="reply-btn"
                      style={{
                        marginLeft: '8px',
                        padding: '8px 16px',
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply Modal */}
        {replyingToEmail && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setReplyingToEmail(null)}
          >
            <div
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginTop: 0 }}>Reply to {replyingToEmail.name}</h2>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  To:
                </label>
                <input
                  type="email"
                  value={replyingToEmail.email}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    background: '#f5f5f5'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  Subject:
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  Message:
                </label>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setReplyingToEmail(null)
                    setReplySubject('')
                    setReplyBody('')
                  }}
                  disabled={isSendingReply}
                  style={{
                    padding: '10px 20px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!replySubject.trim() || !replyBody.trim()) {
                      alert('Please fill in both subject and message')
                      return
                    }
                    setIsSendingReply(true)
                    try {
                      await adminService.replyToEmail(
                        replyingToEmail.email,
                        replySubject,
                        replyBody,
                        replyingToEmail.messageId
                      )
                      alert('Reply sent successfully!')
                      setReplyingToEmail(null)
                      setReplySubject('')
                      setReplyBody('')
                      // Reload emails to update status
                      await loadData()
                    } catch (error: any) {
                      console.error('Failed to send reply:', error)
                      alert(`Failed to send reply: ${error?.response?.data?.message || error.message || 'Unknown error'}`)
                    } finally {
                      setIsSendingReply(false)
                    }
                  }}
                  disabled={isSendingReply}
                  style={{
                    padding: '10px 20px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {isSendingReply ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="pricing-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1>Pricing Configuration</h1>
              <button
                onClick={async () => {
                  if (confirm('This will create/update default credit packs:\n- 20 Messages for $1.99\n- 50 Messages for $3.99\n\nContinue?')) {
                    try {
                      await adminService.seedDefaultPricing()
                      alert('Default credit packs created successfully!\n- 20 Messages ($1.99)\n- 50 Messages ($3.99)')
                      await loadPricingData()
                    } catch (error: any) {
                      console.error('Failed to seed:', error)
                      alert(`Failed to seed default pricing: ${error?.response?.data?.message || error.message}`)
                    }
                  }
                }}
                className="seed-btn"
                style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
              >
                Seed Default Plans
              </button>
            </div>
            
            {pricingConfig && (
              <div className="pricing-config-section" style={{ background: 'white', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Free Messages</h2>
                <div className="config-form">
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Free Messages for New Users:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={pricingConfig.freeMessageLimit}
                      onChange={(e) => setPricingConfig({
                        ...pricingConfig,
                        freeMessageLimit: parseInt(e.target.value) || 5
                      })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                    />
                    <p style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                      New users receive this many free messages. After that, they can purchase credit packs.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveConfig}
                    disabled={isSavingConfig}
                    className="save-btn"
                    style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    {isSavingConfig ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>
            )}

            <div className="pricing-plans-section" style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Credit Packs</h2>
                <button
                  onClick={() => setEditingPlan({
                    planId: '',
                    name: '',
                    price: 0,
                    credits: 20,
                    description: '',
                    isActive: true,
                    isMostPopular: false,
                    displayOrder: pricingPlans.length,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  })}
                  className="add-plan-btn"
                  style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                >
                  + Add Credit Pack
                </button>
              </div>

              {editingPlan && (
                <div className="plan-editor" style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                  <h3 style={{ marginTop: 0 }}>{editingPlan.planId ? 'Edit Credit Pack' : 'New Credit Pack'}</h3>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                      Pack Name:
                    </label>
                    <input
                      type="text"
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      placeholder="e.g., 20 Messages"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                      Price ($):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingPlan.price}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                      Number of Messages (Credits):
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editingPlan.credits}
                      onChange={(e) => setEditingPlan({ ...editingPlan, credits: parseInt(e.target.value) || 20 })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                      Description:
                    </label>
                    <textarea
                      value={editingPlan.description}
                      onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                      placeholder="Get 20 additional messages to continue your conversation."
                      rows={3}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                      Display Order:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingPlan.displayOrder}
                      onChange={(e) => setEditingPlan({ ...editingPlan, displayOrder: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editingPlan.isActive}
                        onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                      />
                      <span>Active</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editingPlan.isMostPopular}
                        onChange={(e) => setEditingPlan({ ...editingPlan, isMostPopular: e.target.checked })}
                      />
                      <span>Most Popular</span>
                    </label>
                  </div>
                  <div className="form-actions" style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleSavePlan(editingPlan)} 
                      className="save-btn"
                      style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Save Plan
                    </button>
                    <button 
                      onClick={() => setEditingPlan(null)} 
                      className="cancel-btn"
                      style={{ padding: '10px 24px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="plans-list">
                {pricingPlans.map((plan) => {
                  // Force correct display names - replace any 24-Hour/7-Day references
                  let displayName = plan.name
                  let displayCredits = plan.credits || 0
                  
                  // Check for old plan names or match by price
                  if (plan.name.includes("24-Hour") || plan.name.includes("24 Hour") ||
                      (plan.price === 1.99 && plan.credits === 0) ||
                      plan.credits === 20 || plan.price === 1.99) {
                    displayName = "20 Messages"
                    displayCredits = 20
                    } else if (plan.name.includes("7-Day") || plan.name.includes("7 Day") || 
                               (plan.price === 3.99 && plan.credits === 0) || 
                               plan.credits === 50 || plan.price === 3.99) {
                    displayName = "50 Messages"
                    displayCredits = 50
                  } else if (plan.credits > 0) {
                    displayName = `${plan.credits} Messages`
                    displayCredits = plan.credits
                  }
                  
                  return (
                    <div key={plan.planId} className="plan-card" style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="plan-info" style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{displayName}</h3>
                        <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontWeight: '500' }}>${plan.price.toFixed(2)} • {displayCredits} messages</p>
                        <p className="plan-desc" style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4b5563' }}>
                          {displayCredits === 20 ? "Continue your conversation with 20 additional messages whenever you need support." : 
                           displayCredits === 50 ? "Extended support with 50 additional messages for ongoing conversations." : 
                           plan.description || `Get ${displayCredits} additional messages to continue your conversation.`}
                        </p>
                      <div className="plan-badges" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {plan.isMostPopular && <span className="badge" style={{ background: '#3b82f6', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Most Popular</span>}
                        {!plan.isActive && <span className="badge inactive" style={{ background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Inactive</span>}
                      </div>
                    </div>
                    <div className="plan-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => {
                          // Force correct values when editing
                          const editPlan = { ...plan }
                          if (plan.price === 1.99 || plan.name.includes("24-Hour") || plan.name.includes("24 Hour")) {
                            editPlan.name = "20 Messages"
                            editPlan.credits = 20
                            editPlan.price = 1.99
                            editPlan.description = "Continue your conversation with 20 additional messages whenever you need support."
                          } else if (plan.price === 3.99 || plan.name.includes("7-Day") || plan.name.includes("7 Day")) {
                            editPlan.name = "50 Messages"
                            editPlan.credits = 50
                            editPlan.price = 3.99
                            editPlan.description = "Extended support with 50 additional messages for ongoing conversations."
                          }
                          setEditingPlan(editPlan)
                        }} 
                        className="edit-btn"
                        style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePlan(plan.planId)} 
                        className="delete-btn"
                        style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  )
                })}
                {pricingPlans.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p style={{ marginBottom: '16px' }}>No credit packs configured.</p>
                    <p style={{ fontSize: '14px' }}>Click "Seed Default Plans" above to create default packs (20 messages for $1.99, 50 messages for $3.99), or "Add Credit Pack" to create a custom pack.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'user-detail' && selectedVisitor && (
          <div className="user-detail-view">
            <button onClick={() => navigate('/admin/users')} className="back-btn">
              ← Back to Users
            </button>
            <h1>User Details</h1>
            <div className="user-detail-card">
              <div className="admin-reset-target">
                <div>
                  <span>Reset target</span>
                  <strong>{selectedVisitor.visitorId}</strong>
                </div>
                <button type="button" className="copy-id-btn" onClick={() => copyToClipboard(selectedVisitor.visitorId)}>
                  Copy visitor ID
                </button>
              </div>
              <div className="detail-row">
                <strong>Visitor ID:</strong>
                <span>{selectedVisitor.visitorId}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{selectedUserSummary?.email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>Created:</strong>
                <span>{new Date(selectedVisitor.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <strong>Messages Sent:</strong>
                <span>{selectedVisitor.messageCount}</span>
              </div>
              <div className="detail-row">
                <strong>Total Spent:</strong>
                <span>${(selectedUserSummary?.totalSpent || 0).toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <strong>Credits Purchased (Lifetime):</strong>
                <span>{selectedUserSummary?.creditsPurchased || 0}</span>
              </div>
              <div className="detail-row">
                <strong>Last Session Messages:</strong>
                <span>{selectedUserSummary?.lastSessionMessages || 0}</span>
              </div>
              <div className="detail-row">
                <strong>AI Photo Checks:</strong>
                <span>{selectedUserSummary?.photoCheckCount || 0}</span>
              </div>
              <div className="detail-row">
                <strong>Conversion Status:</strong>
                <span className={`status-chip ${selectedUserSummary?.conversionStatus === 'Converted' ? 'status-converted' : selectedUserSummary?.conversionStatus === 'Used Free Only' ? 'status-free-only' : selectedUserSummary?.conversionStatus === 'Engaged' ? 'status-engaged' : 'status-new'}`}>
                  {selectedUserSummary?.conversionStatus || 'New'}
                </span>
              </div>
              <div className="detail-row">
                <strong>Total Available:</strong>
                <span className={`credits-badge ${selectedTotalAvailable > 0 ? 'has-credits' : 'no-credits'}`}>
                  {selectedTotalAvailable}
                </span>
              </div>
              <div className="detail-row">
                <strong>Paid Credit Balance:</strong>
                <span>{selectedVisitor.creditBalance}</span>
              </div>
              <div className="detail-row">
                <strong>Free Messages Remaining:</strong>
                <span>{selectedFreeMessagesRemaining} of {freeLimit}</span>
              </div>
              <div className="detail-row">
                <strong>Premium:</strong>
                <span>{selectedVisitor.isPremium ? 'Yes' : 'No'}</span>
              </div>
              <div className="detail-row">
                <strong>Last Active:</strong>
                <span>{new Date(selectedVisitor.lastActive).toLocaleString()}</span>
              </div>
            </div>

            <div className="credits-management">
              <h2>Credits Management</h2>
              <div className="add-credits-form">
                <label>
                  Add Credits:
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={creditsToAdd}
                    onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
                    className="credits-input"
                  />
                </label>
                <button onClick={handleAddCredits} className="add-credits-btn">
                  Add Credits
                </button>
              </div>
            </div>

            <div className="message-count-management">
              <h2>Free Message Reset</h2>
              <div className="reset-messages-form">
                <label>
                  Free messages remaining after reset:
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={resetMessageCountTo !== undefined ? resetMessageCountTo : ''}
                    onChange={(e) => setResetMessageCountTo(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="credits-input"
                    placeholder={`blank = ${freeLimit}`}
                  />
                  <small style={{ display: 'block', color: '#6b7280', marginTop: '4px' }}>
                    Leave blank to restore the full free allowance and clear paid credits. Enter 0 to mark all free messages used.
                  </small>
                </label>
                <button onClick={handleResetMessageCount} className="reset-messages-btn">
                  Apply Free Reset
                </button>
              </div>
            </div>

            <div className="credits-management" style={{ marginTop: '2rem' }}>
              <h2>Quick Actions</h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => handleQuickCredits(5)} className="add-credits-btn">+5 Credits</button>
                <button onClick={() => handleQuickCredits(20)} className="add-credits-btn">+20 Credits</button>
                <button onClick={handleResetCredits} className="add-credits-btn" style={{ background: '#ef4444' }}>Reset Paid Credits</button>
                <button onClick={handleMarkPremium} className="add-credits-btn" style={{ background: '#0f766e' }}>Mark Premium</button>
              </div>
            </div>

            <div className="user-detail-card" style={{ marginTop: '2rem' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Conversion Signal</h2>
              <div className="detail-row">
                <strong>High Intent (&gt;= 3 messages):</strong>
                <span>{selectedVisitor.messageCount >= 3 ? 'Yes' : 'No'}</span>
              </div>
              <div className="detail-row">
                <strong>Used All Free Credits:</strong>
                <span>{selectedVisitor.messageCount >= freeLimit ? 'Yes' : 'No'}</span>
              </div>
              <div className="detail-row">
                <strong>Returned After First Visit:</strong>
                <span>{selectedUserSummary && selectedUserSummary.lastSessionMessages > 0 && selectedVisitor.messageCount > selectedUserSummary.lastSessionMessages ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="user-detail-card" style={{ marginTop: '2rem' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Usage Timeline</h2>
              {usageTimeline.length === 0 ? (
                <p style={{ color: '#666', margin: 0 }}>No timeline events available yet.</p>
              ) : (
                <div className="payment-history-table" style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Event</th>
                        <th>Messages Used (Cumulative)</th>
                        <th>Remaining Credits</th>
                        <th>Delta</th>
                        <th>Credits Used</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageTimeline.map((entry, idx) => (
                        <tr key={`${entry.timestamp}-${entry.eventType}-${idx}`}>
                          <td>{new Date(entry.timestamp).toLocaleString()}</td>
                          <td>{entry.eventType}</td>
                          <td>{entry.messagesUsedCumulative}</td>
                          <td>{entry.remainingCredits}</td>
                          <td>{entry.deltaCredits > 0 ? `+${entry.deltaCredits}` : entry.deltaCredits}</td>
                          <td>{entry.creditsUsed || Math.abs(entry.deltaCredits)}</td>
                          <td>{entry.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="payment-history-section" style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginTop: '2rem' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Payment History</h2>
              {isLoadingPayments ? (
                <p style={{ color: '#666', padding: '1rem' }}>Loading payment history...</p>
              ) : paymentHistory.length === 0 ? (
                <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
                  <p style={{ margin: 0 }}>No payment history found for this visitor.</p>
                </div>
              ) : (
                <div className="payment-history-table" style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse', background: 'white' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600, minWidth: '140px' }}>Date</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600, minWidth: '180px' }}>Customer</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600, minWidth: '120px' }}>Plan</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600, minWidth: '100px' }}>Amount</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600, minWidth: '80px' }}>Credits</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600, minWidth: '150px' }}>Payment Method</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600, minWidth: '200px' }}>Billing Address</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600, minWidth: '100px' }}>Status</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600, minWidth: '180px' }}>Session ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment) => (
                        <tr key={payment.paymentId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{new Date(payment.paymentDate).toLocaleString()}</td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                            <div style={{ fontWeight: 500 }}>{payment.customerName || 'N/A'}</div>
                            <div style={{ color: '#666', fontSize: '0.8125rem' }}>{payment.customerEmail || 'N/A'}</div>
                            {payment.customerPhone && (
                              <div style={{ color: '#666', fontSize: '0.8125rem' }}>{payment.customerPhone}</div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>{payment.planName}</td>
                          <td style={{ padding: '0.75rem' }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: payment.currency.toUpperCase() }).format(payment.amount)}
                          </td>
                          <td style={{ padding: '0.75rem' }}>{payment.credits}</td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                            {payment.paymentMethodBrand && payment.paymentMethodLast4 ? (
                              <div>
                                <div style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                                  {payment.paymentMethodBrand} •••• {payment.paymentMethodLast4}
                                </div>
                                {payment.paymentMethodType && (
                                  <div style={{ color: '#666', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                                    {payment.paymentMethodType}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: '#999' }}>N/A</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                            {payment.billingAddressLine1 ? (
                              <div>
                                <div>{payment.billingAddressLine1}</div>
                                {payment.billingAddressLine2 && <div>{payment.billingAddressLine2}</div>}
                                <div>
                                  {payment.billingCity}{payment.billingCity && payment.billingState ? ', ' : ''}{payment.billingState} {payment.billingPostalCode}
                                </div>
                                {payment.billingCountry && <div style={{ fontSize: '0.75rem', color: '#999' }}>{payment.billingCountry.toUpperCase()}</div>}
                              </div>
                            ) : (
                              <span style={{ color: '#999' }}>N/A</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem',
                              background: payment.status === 'completed' ? '#d4edda' : '#f8d7da',
                              color: payment.status === 'completed' ? '#155724' : '#721c24'
                            }}>
                              {payment.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#666', fontFamily: 'monospace' }}>
                            {payment.stripeSessionId.substring(0, 20)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stripe' && (
          <div className="stripe-view">
            <h1>Stripe Configuration</h1>
            
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Setup Instructions</h2>
              
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px' }}>1. Create Stripe Products and Prices</h3>
                <ol style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>Go to <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer">Stripe Dashboard → Products</a></li>
                  <li>Click "Add product"</li>
                  <li>For each credit pack (20 Messages, 50 Messages):
                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                      <li><strong>Name:</strong> "20 Messages" or "50 Messages"</li>
                      <li><strong>Description:</strong> Match the description from your pricing plans</li>
                      <li><strong>Pricing:</strong> Set as "One time" payment</li>
                      <li><strong>Price:</strong> $1.99 for 20 Messages, $3.99 for 50 Messages</li>
                      <li>Click "Save product"</li>
                    </ul>
                  </li>
                  <li>After creating each product, copy the <strong>Price ID</strong> (starts with <code>price_</code>)</li>
                  <li>Go to Admin Dashboard → Pricing section</li>
                  <li>Edit each plan and paste the Stripe Price ID in the "Stripe Price ID" field</li>
                  <li>Save the plan</li>
                </ol>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px' }}>2. Configure Webhook</h3>
                <ol style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>Go to <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer">Stripe Dashboard → Webhooks</a></li>
                  <li>Click "Add endpoint"</li>
                  <li><strong>Endpoint URL:</strong> <code>{(import.meta.env.VITE_API_URL || 'https://your-api-url.com').replace('/api', '')}/api/stripe/webhook</code></li>
                  <li><strong>Events to send:</strong> Select <code>checkout.session.completed</code></li>
                  <li>Click "Add endpoint"</li>
                  <li>Copy the <strong>Signing secret</strong> (starts with <code>whsec_</code>)</li>
                  <li>Add it to AWS Secrets Manager as <code>STRIPE_WEBHOOK_SECRET</code></li>
                </ol>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px' }}>3. API Keys</h3>
                <p style={{ lineHeight: '1.8' }}>
                  Ensure your Stripe API keys are configured in AWS Secrets Manager:
                </p>
                <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li><code>STRIPE_SECRET_KEY</code> - Your Stripe secret key (starts with <code>sk_live_</code> or <code>sk_test_</code>)</li>
                  <li><code>STRIPE_WEBHOOK_SECRET</code> - Your webhook signing secret (starts with <code>whsec_</code>)</li>
                </ul>
                <p style={{ marginTop: '12px', padding: '12px', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                  <strong>Note:</strong> Get your API keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">Stripe Dashboard → API keys</a>
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px' }}>4. Current Pricing Plans</h3>
                {pricingPlans.length > 0 ? (
                  <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '6px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ textAlign: 'left', padding: '8px' }}>Plan Name</th>
                          <th style={{ textAlign: 'left', padding: '8px' }}>Price</th>
                          <th style={{ textAlign: 'left', padding: '8px' }}>Credits</th>
                          <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricingPlans.map((plan) => (
                          <tr key={plan.planId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '8px' }}>{plan.name}</td>
                            <td style={{ padding: '8px' }}>${plan.price.toFixed(2)}</td>
                            <td style={{ padding: '8px' }}>{plan.credits}</td>
                            <td style={{ padding: '8px' }}>
                              {plan.isActive ? (
                                <span style={{ color: '#10b981', fontSize: '14px' }}>✓ Active</span>
                              ) : (
                                <span style={{ color: '#6b7280', fontSize: '14px' }}>Inactive</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
                      Plans are automatically used for Stripe checkout. No additional configuration needed!
                    </p>
                  </div>
                ) : (
                  <p style={{ color: '#6b7280' }}>No pricing plans found. Create plans in the Pricing section first.</p>
                )}
              </div>

              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '6px', border: '1px solid #fbbf24' }}>
                <h4 style={{ marginTop: 0, marginBottom: '8px' }}>⚠️ Important Notes</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Use <strong>test mode</strong> in Stripe for development/testing</li>
                  <li>Switch to <strong>live mode</strong> for production</li>
                  <li>Update API keys in Secrets Manager when switching modes</li>
                  <li>Test the webhook using Stripe's webhook testing tool</li>
                  <li>Ensure your Lambda function has internet access to reach Stripe API</li>
                </ul>
              </div>
            </div>

            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Quick Links</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <a 
                  href="https://dashboard.stripe.com/webhooks" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    padding: '10px 20px', 
                    background: '#3b82f6', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '6px',
                    display: 'inline-block'
                  }}
                >
                  Stripe Webhooks
                </a>
                <a 
                  href="https://dashboard.stripe.com/apikeys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    padding: '10px 20px', 
                    background: '#3b82f6', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '6px',
                    display: 'inline-block'
                  }}
                >
                  Stripe API Keys
                </a>
                <a 
                  href="https://dashboard.stripe.com/test/payments" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    padding: '10px 20px', 
                    background: '#10b981', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '6px',
                    display: 'inline-block'
                  }}
                >
                  Test Payments
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

