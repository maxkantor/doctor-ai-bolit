import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
      
      // Always refresh remaining messages after sending to ensure accurate count
      const updatedRemaining = await chatService.getRemainingMessages(visitorId)
      setRemainingMessages(updatedRemaining)
      
      if (updatedRemaining === 0) {
        setTimeout(() => setShowPaywallModal(true), 500)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-embed">
      <div className="chat-embed-header">
        <h3>Start chatting for free. No signup. No pressure.</h3>
        <div className="chat-embed-credits">
          {remainingMessages} free {remainingMessages === 1 ? 'message' : 'messages'} remaining
        </div>
      </div>

      <div className="chat-embed-messages">
        {messages.length === 0 && (
          <div className="chat-embed-empty">
            <p>How are you feeling right now? I'm here to listen and support you.</p>
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
        <div className="chat-embed-disclaimer">
          <small>
            This service provides informational health guidance only and is not a substitute for professional medical care.
            If you are experiencing a medical emergency, contact emergency services immediately.
          </small>
        </div>
        <div className="chat-embed-input-wrapper">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={remainingMessages === 0 ? "You've reached your free limit. Continue to keep chatting..." : "Type your message..."}
            className="chat-embed-input"
            disabled={isLoading || remainingMessages === 0}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || remainingMessages === 0}
            className="chat-embed-send-btn"
          >
            Send
          </button>
        </div>
        {remainingMessages === 0 && (
          <button
            onClick={() => navigate('/chat')}
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

