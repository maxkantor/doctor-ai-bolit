import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { scrollToTop } from '../utils/scrollToTop'
import { getOrCreateVisitorId } from '../utils/visitorId'
import { chatService } from '../services/chatService'
import { pricingService } from '../services/pricingService'
import { ChatMessage } from '../types'
import PaywallModal from './PaywallModal'
import './ChatEmbed.css'

interface ChatEmbedProps {
  systemPrompt?: string
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const UNLIMITED_MESSAGES_THRESHOLD = 1_000_000

export default function ChatEmbed({ systemPrompt }: ChatEmbedProps) {
  const [visitorId] = useState(() => getOrCreateVisitorId())
  const [sessionId] = useState(() => generateSessionId())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [remainingMessages, setRemainingMessages] = useState(5)
  const [freeMessageLimit, setFreeMessageLimit] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [showPaywallModal, setShowPaywallModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadPricingConfig()
  }, [])

  const loadPricingConfig = async () => {
    try {
      const config = await pricingService.getConfig()
      setFreeMessageLimit(config.freeMessageLimit)
      setRemainingMessages(config.freeMessageLimit)
    } catch (error) {
      console.error('Failed to load pricing config:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    if (remainingMessages <= 0) {
      setShowPaywallModal(true)
      return
    }

    const userMessage: ChatMessage = {
      sessionId,
      timestamp: new Date().toISOString(),
      role: 'user',
      content: inputMessage,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await chatService.sendMessage({
        visitorId,
        sessionId,
        message: inputMessage,
        systemPrompt: systemPrompt,
      })

      if (response.requiresPayment || response.remainingMessages <= 0) {
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

      const res = await chatService.getRemainingMessages(visitorId)
      const remaining = typeof res === 'object' && res && 'remainingMessages' in res ? res.remainingMessages : res
      setRemainingMessages(remaining ?? 0)
      if (remaining === 0) setTimeout(() => setShowPaywallModal(true), 500)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedPrompts = [
    'How can I improve my sleep naturally?',
    'What helps with stress at night?',
    'How do I reduce alcohol consumption?',
    'What can I do for a mild headache?',
    'What helps when I\'m getting a cold?',
    'How do I stay hydrated properly?',
  ]

  const showEmptyState = messages.length === 0
  const hasUnlimitedMessages = remainingMessages >= UNLIMITED_MESSAGES_THRESHOLD

  const handleSuggestedPrompt = async (prompt: string) => {
    if (!prompt.trim() || isLoading || remainingMessages <= 0) return
    const userMsg: ChatMessage = { sessionId, timestamp: new Date().toISOString(), role: 'user', content: prompt }
    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setIsLoading(true)
    try {
      const response = await chatService.sendMessage({ visitorId, sessionId, message: prompt, systemPrompt })
      if (response.requiresPayment || response.remainingMessages <= 0) {
        setShowPaywallModal(true)
        return
      }
      setMessages((prev) => [...prev, { sessionId, timestamp: new Date().toISOString(), role: 'assistant', content: response.message }])
      const updated = await chatService.getRemainingMessages(visitorId)
      setRemainingMessages(typeof updated === 'object' && 'remainingMessages' in updated ? updated.remainingMessages : updated)
      if ((typeof updated === 'object' && updated.remainingMessages === 0) || updated === 0) setTimeout(() => setShowPaywallModal(true), 500)
    } catch {
      const updated = await chatService.getRemainingMessages(visitorId)
      setRemainingMessages(typeof updated === 'object' && 'remainingMessages' in updated ? updated.remainingMessages : updated)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-embed">
      <div className="chat-embed-header">
        <h3>Practical health guidance — free to start, no signup.</h3>
        <div className="chat-embed-credits">
          {hasUnlimitedMessages
            ? 'Premium unlimited'
            : `${remainingMessages} free ${remainingMessages === 1 ? 'message' : 'messages'} left`
          }
        </div>
      </div>

      <div className="chat-embed-messages">
        {showEmptyState && (
          <div className="chat-embed-empty">
            <p className="chat-embed-empty-headline">What can we help with?</p>
            <p className="chat-embed-empty-sub">Choose a topic or type your question below.</p>
            <div className="chat-embed-suggested">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="chat-embed-suggested-btn"
                  onClick={() => handleSuggestedPrompt(p)}
                  disabled={isLoading || remainingMessages === 0}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-embed-message ${message.role === 'user' ? 'user' : 'assistant'}`}
          >
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-embed-message assistant">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-embed-input-container">
        <div className="chat-embed-input-wrapper">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (inputMessage.trim() && !isLoading && remainingMessages > 0) handleSendMessage()
              }
            }}
            placeholder={remainingMessages === 0 ? "You've reached your free limit. Upgrade to continue." : "Ask a health or wellness question…"}
            className="chat-embed-input"
            disabled={isLoading || remainingMessages === 0}
            rows={1}
            aria-label="Message"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || remainingMessages === 0}
            className="chat-embed-send-btn"
            aria-label="Send"
          >
            Send
          </button>
        </div>
        <p className="chat-embed-trust">Educational guidance for non-emergency questions.</p>
        <p className="chat-embed-disclaimer-light">If symptoms are severe or worsening, seek medical care.</p>
        {remainingMessages === 0 && (
          <button
            onClick={() => { scrollToTop(); navigate('/chat') }}
            className="chat-embed-full-chat-btn"
          >
            Continue in Full Chat →
          </button>
        )}
      </div>

      {showPaywallModal && (
        <PaywallModal
          visitorId={visitorId}
          freeMessageLimit={freeMessageLimit}
          onClose={() => setShowPaywallModal(false)}
          onPurchaseComplete={() => {
            setShowPaywallModal(false)
            loadPricingConfig()
          }}
        />
      )}
    </div>
  )
}

