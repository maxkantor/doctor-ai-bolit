import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { scrollToTop } from '../utils/scrollToTop'
import { getOrCreateVisitorId } from '../utils/visitorId'
import { chatService } from '../services/chatService'
import { pricingService } from '../services/pricingService'
import { ChatMessage, ChatSession } from '../types'
import ShareModal from '../components/ShareModal'
import PaywallModal from '../components/PaywallModal'
import EmailRestoreModal from '../components/EmailRestoreModal'
import LanguageSwitcher from '../components/LanguageSwitcher'
import './ChatPage.css'

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default function ChatPage() {
  const { t, i18n } = useTranslation()
  const [visitorId] = useState(() => {
    const id = getOrCreateVisitorId()
    console.log('🆔 Visitor ID loaded:', id)
    console.log('💾 Stored in localStorage:', localStorage.getItem('doctoraibolit_visitor_id'))
    return id
  })
  const [sessionId, setSessionId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionFromUrl = urlParams.get('session')
    if (sessionFromUrl) {
      return sessionFromUrl
    }
    // Generate new session and update URL
    const newSessionId = generateSessionId()
    // Update URL without navigation to preserve state
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('session', newSessionId)
    window.history.replaceState({}, '', newUrl.toString())
    return newSessionId
  })
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [remainingMessages, setRemainingMessages] = useState(5)
  const [freeMessageLimit, setFreeMessageLimit] = useState(5)
  const [creditBalance, setCreditBalance] = useState(0)
  const [freeMessagesRemaining, setFreeMessagesRemaining] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showPaywallModal, setShowPaywallModal] = useState(false)
  const [showEmailRestoreModal, setShowEmailRestoreModal] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined)
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<{ credits: number; visible: boolean } | null>(null)
  const previousCreditBalanceRef = useRef<number>(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isSendingRef = useRef(false) // Use ref to track if request is in flight (prevents race conditions)
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = () => setSidebarOpen(false)
  const greetingText = t('chat.greeting')

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) setSidebarOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      await loadPricingConfig()
      await loadRemainingMessages()
      await loadSessions()
      await loadMessages()
    }
    loadData()
    
    // Check if user came from Stripe checkout (has session_id parameter)
    const urlParams = new URLSearchParams(window.location.search)
    const stripeSessionId = urlParams.get('session_id')
    if (stripeSessionId) {
      console.log('✅ User returned from Stripe checkout, session_id:', stripeSessionId)
      // Remove the session_id parameter from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('session_id')
      window.history.replaceState({}, '', newUrl.toString())
      
      // Store initial credit balance before polling
      const initialBalance = creditBalance || 0
      previousCreditBalanceRef.current = initialBalance
      
      // Poll for credit updates - webhook processing can take time
      console.log('🔄 Starting credit refresh polling after Stripe checkout...')
      let attempts = 0
      const maxAttempts = 10 // Poll for up to 30 seconds
      const pollInterval = setInterval(async () => {
        attempts++
        console.log(`🔄 Polling attempt ${attempts}/${maxAttempts} for credit update...`)
        const previousBalance = previousCreditBalanceRef.current
        
        // Load messages and check response
        try {
          const response = await chatService.getRemainingMessages(visitorId)
          const currentBalance = typeof response === 'object' && 'creditBalance' in response 
            ? (response.creditBalance || 0) 
            : creditBalance
          
          // Update state
          setRemainingMessages(response.remainingMessages || response)
          if (typeof response === 'object' && 'creditBalance' in response) {
            setCreditBalance(response.creditBalance || 0)
            setFreeMessagesRemaining(response.freeMessagesRemaining || 0)
          }
          
          // Check if credits increased
          if (currentBalance > previousBalance) {
            const creditsAdded = currentBalance - previousBalance
            console.log(`✅ Credits increased! Added ${creditsAdded} credits.`)
            setPaymentSuccessMessage({ credits: creditsAdded, visible: true })
            clearInterval(pollInterval)
            // Auto-hide after 10 seconds
            setTimeout(() => {
              setPaymentSuccessMessage(prev => prev ? { ...prev, visible: false } : null)
            }, 10000)
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            console.log('⏱️ Polling complete. If credits still not updated, check webhook configuration.')
          }
          previousCreditBalanceRef.current = currentBalance
        } catch (error) {
          console.error('Error polling for credits:', error)
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
          }
        }
      }, 3000) // Poll every 3 seconds
      
      // Also do immediate refresh (async function inside useEffect)
      const refreshCredits = async () => {
        await loadRemainingMessages()
      }
      refreshCredits()
      
      // Cleanup interval on unmount
      return () => {
        clearInterval(pollInterval)
      }
    }
    
    // Check if user came from landing page with purchase parameter
    const purchasePlanId = urlParams.get('purchase')
    if (purchasePlanId) {
      // Remove the purchase parameter from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('purchase')
      window.history.replaceState({}, '', newUrl.toString())
      // Set selected plan ID and show paywall modal after a short delay
      setSelectedPlanId(purchasePlanId)
      setTimeout(() => {
        setShowPaywallModal(true)
      }, 500)
    }
  }, [sessionId, visitorId])


  const loadRemainingMessages = async () => {
    try {
      console.log('💳 Loading remaining messages for visitor:', visitorId)
      const response = await chatService.getRemainingMessages(visitorId)
      setRemainingMessages(response.remainingMessages || response)
      if (typeof response === 'object' && 'creditBalance' in response) {
        setCreditBalance(response.creditBalance || 0)
        setFreeMessagesRemaining(response.freeMessagesRemaining || 0)
      }
      console.log('✅ Loaded remaining messages:', response, 'for visitor:', visitorId)
    } catch (error) {
      console.error('❌ Failed to load remaining messages:', error)
    }
  }

  const loadPricingConfig = async () => {
    try {
      const config = await pricingService.getConfig()
      setFreeMessageLimit(config.freeMessageLimit)
      // Don't override remainingMessages here - let loadRemainingMessages handle it
    } catch (error) {
      console.error('Failed to load pricing config:', error)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadSessions = async () => {
    try {
      console.log('📚 Loading chat sessions for visitor:', visitorId)
      const data = await chatService.getSessions(visitorId)
      setSessions(data)
      console.log('✅ Loaded', data.length, 'chat sessions for visitor:', visitorId)
    } catch (error) {
      console.error('❌ Failed to load sessions:', error)
    }
  }

  const loadMessages = async () => {
    try {
      const data = await chatService.getMessages(sessionId)
      // If no messages exist, show greeting
      if (data.length === 0) {
        const greetingMessage: ChatMessage = {
          sessionId,
          timestamp: new Date().toISOString(),
          role: 'assistant',
          content: greetingText,
        }
        setMessages([greetingMessage])
      } else {
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      // Show greeting even on error if no messages
      const greetingMessage: ChatMessage = {
        sessionId,
        timestamp: new Date().toISOString(),
        role: 'assistant',
        content: greetingText,
      }
      setMessages([greetingMessage])
    }
  }

  const suggestedPrompts = [
    t('prompts.sleep'),
    t('prompts.stress'),
    t('prompts.alcohol'),
    t('prompts.headache'),
    t('prompts.recovery'),
    t('prompts.bloating'),
    t('prompts.hydration'),
    t('prompts.cold'),
    t('prompts.digestion'),
    t('prompts.routine'),
  ]

  const showEmptyState = messages.length === 1 && messages[0]?.role === 'assistant'

  const handleNewSession = async () => {
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)
    // Update URL
    navigate(`/chat?session=${newSessionId}`, { replace: true })
    // Reload sessions to ensure list is up to date
    await loadSessions()
    // Show greeting for new session
    const greetingMessage: ChatMessage = {
      sessionId: newSessionId,
      timestamp: new Date().toISOString(),
      role: 'assistant',
      content: greetingText,
    }
    setMessages([greetingMessage])
    closeSidebar()
  }

  const handleSuggestedPrompt = async (prompt: string) => {
    if (!prompt.trim() || isLoading || isSendingRef.current || remainingMessages <= 0) return
    isSendingRef.current = true
    setIsLoading(true)
    const userMessage: ChatMessage = {
      sessionId,
      timestamp: new Date().toISOString(),
      role: 'user',
      content: prompt,
    }
    setMessages((prev) => [...prev, userMessage])
    try {
      const response = await chatService.sendMessage({ visitorId, sessionId, message: prompt })
      if (response.requiresPayment || response.remainingMessages <= 0) {
        setShowPaywallModal(true)
        return
      }
      const assistantMessage: ChatMessage = {
        sessionId,
        timestamp: new Date().toISOString(),
        role: 'assistant',
        content: response.message,
      }
      setMessages((prev) => [...prev, assistantMessage])
      await loadRemainingMessages()
      await loadSessions()
      if (response.remainingMessages === 0) setTimeout(() => setShowPaywallModal(true), 500)
    } catch {
      await loadRemainingMessages()
    } finally {
      isSendingRef.current = false
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    // Prevent double-clicks and concurrent requests - check ref FIRST (synchronous check)
    if (!inputMessage.trim() || isLoading || isSendingRef.current) {
      console.log('⚠️ Message send blocked - isLoading:', isLoading, 'isSendingRef:', isSendingRef.current, 'inputMessage:', inputMessage.trim())
      return
    }

    // Set both state and ref IMMEDIATELY to prevent race conditions
    isSendingRef.current = true
    setIsLoading(true)

    // Check if user is trying to send message beyond free limit
    if (remainingMessages <= 0) {
      isSendingRef.current = false
      setIsLoading(false)
      setShowPaywallModal(true)
      return
    }

    const messageToSend = inputMessage.trim()
    console.log('📤 Sending message:', messageToSend, 'for visitor:', visitorId)

    const userMessage: ChatMessage = {
      sessionId,
      timestamp: new Date().toISOString(),
      role: 'user',
      content: messageToSend,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')

    try {
      console.log('🔄 Calling chatService.sendMessage with:', { visitorId, sessionId, message: messageToSend })
      const response = await chatService.sendMessage({
        visitorId,
        sessionId,
        message: messageToSend,
      })
      console.log('✅ Received response from chatService:', response)

      console.log('📨 Chat response received:', JSON.stringify(response, null, 2))

      if (response.requiresPayment || response.remainingMessages <= 0) {
        isSendingRef.current = false
        setShowPaywallModal(true)
        setIsLoading(false)
        return
      }

      const assistantMessage: ChatMessage = {
        sessionId,
        timestamp: new Date().toISOString(),
        role: 'assistant',
        content: response.message,
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      // Reload sessions after sending message (in case a new session was created)
      await loadSessions()
      
      // ALWAYS fetch remaining messages after sending to ensure accurate count
      // Don't rely on response value as it may not be serialized correctly
      try {
        console.log('🔄 Fetching updated remaining messages...')
        const response = await chatService.getRemainingMessages(visitorId)
        const updatedRemaining = typeof response === 'number' ? response : response.remainingMessages
        if (typeof response === 'object' && 'creditBalance' in response) {
          setCreditBalance(response.creditBalance || 0)
          setFreeMessagesRemaining(response.freeMessagesRemaining || 0)
        }
        console.log('📥 Received remaining messages:', response)
        console.log('📝 Current state before update:', remainingMessages)
        setRemainingMessages(updatedRemaining)
        console.log('✅ State updated to:', updatedRemaining)
        
        // Show paywall if we've reached the limit
        if (updatedRemaining === 0) {
          setTimeout(() => setShowPaywallModal(true), 500)
        }
      } catch (error) {
        console.error('❌ Failed to fetch remaining messages:', error)
        console.error('Error details:', error)
        // Fallback: try to use response value if API call fails
        if (response.remainingMessages !== undefined && response.remainingMessages >= 0) {
          console.log('⚠️ Using response value as fallback:', response.remainingMessages)
          setRemainingMessages(response.remainingMessages)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Reload remaining messages on error
      await loadRemainingMessages()
    } finally {
      // Always reset both state and ref
      isSendingRef.current = false
      setIsLoading(false)
    }
  }


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="chat-page">
      {sidebarOpen && (
        <button
          type="button"
          className="chat-sidebar-backdrop"
          aria-label={t('chat.closeSessionsPanel')}
          onClick={closeSidebar}
        />
      )}
      <div className="chat-container">
        <aside className={`chat-sidebar ${sidebarOpen ? 'chat-sidebar--open' : ''}`}>
          <div className="chat-sidebar-top">
            <span className="chat-premium-badge" title="Premium experience">
              $10M premium
            </span>
            <button
              type="button"
              className="chat-sidebar-close"
              aria-label={t('chat.closeSessions')}
              onClick={closeSidebar}
            >
              ×
            </button>
          </div>
          <button onClick={handleNewSession} className="new-session-btn">
            {t('chat.newSession')}
          </button>
          <div className="sessions-list">
            <h3>{t('chat.previousSessions')}</h3>
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className={`session-item ${session.sessionId === sessionId ? 'active' : ''}`}
                onClick={() => {
                  setSessionId(session.sessionId)
                  navigate(`/chat?session=${session.sessionId}`, { replace: true })
                  closeSidebar()
                }}
              >
                <div className="session-title">{session.title || t('chat.untitledSession')}</div>
                <div className="session-date">
                  {new Date(session.createdAt).toLocaleDateString(i18n.language, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="chat-main">
          {paymentSuccessMessage?.visible && (
            <div className="payment-success-banner">
              <div className="payment-success-content">
                <span className="payment-success-icon">✅</span>
                <span className="payment-success-text">
                  {t('chat.paymentSuccess', { count: paymentSuccessMessage.credits })}
                </span>
              </div>
              <button 
                className="payment-success-close"
                onClick={() => setPaymentSuccessMessage(prev => prev ? { ...prev, visible: false } : null)}
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>
          )}
          <div className="chat-header">
            <div className="chat-header-left">
              <button
                type="button"
                className="chat-sidebar-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label={t('chat.openSessions')}
              >
                ☰
              </button>
              <Link to="/" className="back-button">← {t('common.back')}</Link>
              <span className="chat-premium-badge chat-premium-badge--header" title="Premium experience">
                $10M premium
              </span>
              <h2>{t('chat.title')}</h2>
            </div>
            <div className="chat-actions">
              <div className="chat-language-slot">
                <LanguageSwitcher compact />
              </div>
              <div className="credits-info">
                <span className="credits-icon">💬</span>
                <span className="remaining-messages">
                  {creditBalance > 0 
                    ? t('chat.messagesRemaining', { count: remainingMessages })
                    : t('chat.freeMessagesRemaining', { count: remainingMessages })
                  }
                </span>
              </div>
              <button 
                onClick={() => setShowEmailRestoreModal(true)} 
                className="restore-credits-btn"
                title={t('chat.restoreCreditsTitle')}
              >
                {t('chat.restoreCredits')}
              </button>
              <button onClick={() => setShowShareModal(true)} className="share-btn">
                {t('chat.share')}
              </button>
            </div>
          </div>

          <div className="messages-container">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            {showEmptyState && (
              <div className="empty-state">
                <h3 className="empty-state-headline">{t('chat.emptyTitle')}</h3>
                <p className="empty-state-subline">{t('chat.emptySubtitle')}</p>
                <div className="suggested-prompts">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      className="suggested-prompt-btn"
                      onClick={() => handleSuggestedPrompt(prompt)}
                      disabled={isLoading || remainingMessages === 0}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isLoading && (
              <div className="message assistant-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (!isLoading && !isSendingRef.current && inputMessage.trim()) handleSendMessage()
                  }
                }}
                className="chat-input"
                disabled={isLoading || remainingMessages === 0}
                placeholder={remainingMessages === 0 ? t('chat.placeholderLimit') : t('chat.placeholder')}
                rows={1}
                aria-label={t('contact.message')}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || remainingMessages === 0}
                className="send-btn"
                aria-label={t('common.send')}
              >
                {t('common.send')}
              </button>
            </div>
            <p className="chat-trust-line">{t('chat.trust')}</p>
            <p className="chat-disclaimer-light">{t('chat.disclaimer')}</p>
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          sessionId={sessionId}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showPaywallModal && (
        <PaywallModal
          visitorId={visitorId}
          freeMessageLimit={freeMessageLimit}
          onClose={() => {
            setShowPaywallModal(false)
            setSelectedPlanId(undefined)
          }}
          selectedPlanId={selectedPlanId}
          onPurchaseComplete={async () => {
            setShowPaywallModal(false)
            setSelectedPlanId(undefined)
            // Reload remaining messages after purchase
            await loadRemainingMessages()
          }}
        />
      )}
      {showEmailRestoreModal && (
        <EmailRestoreModal
          isOpen={showEmailRestoreModal}
          onClose={() => setShowEmailRestoreModal(false)}
          visitorId={visitorId}
          onCreditsRestored={async () => {
            await loadRemainingMessages()
            await loadSessions()
          }}
        />
      )}
    </div>
  )
}

