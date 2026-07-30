import api, { getApiBaseUrl } from './api'
import { ChatRequest, ChatResponse, ChatSession, ChatMessage, PhotoCheckRequest } from '../types'

export type StreamMessageResult = {
  remainingMessages?: number
  requiresPayment?: boolean
}

function getVisitorIdHeader(): Record<string, string> {
  const visitorId = localStorage.getItem('doctoraibolit_visitor_id')
  return visitorId ? { 'X-Visitor-Id': visitorId } : {}
}

function parseStreamMetadata(payload: string): StreamMessageResult | null {
  const match = payload.match(/\{"type":"metadata"[^}]+\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0]) as { type?: string; remainingCredits?: number }
    if (parsed.type === 'metadata' && typeof parsed.remainingCredits === 'number') {
      return { remainingMessages: parsed.remainingCredits }
    }
  } catch {
    return null
  }
  return null
}

function parseStreamError(payload: string): StreamMessageResult | null {
  const match = payload.match(/\{"type":"error"[^}]+\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0]) as { type?: string; requiresPayment?: boolean }
    if (parsed.type === 'error' && parsed.requiresPayment) {
      return { requiresPayment: true }
    }
  } catch {
    return null
  }
  return null
}

export const chatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/chat', request)
    return response.data
  },

  /**
   * Stream assistant tokens via SSE. Keeps the HTTP connection active while the model responds,
   * which avoids API Gateway 504 timeouts on longer answers.
   */
  async streamMessage(
    request: ChatRequest,
    onChunk: (text: string) => void,
    signal?: AbortSignal,
  ): Promise<StreamMessageResult> {
    const response = await fetch(`${getApiBaseUrl()}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...getVisitorIdHeader(),
      },
      body: JSON.stringify(request),
      signal,
    })

    if (!response.ok) {
      const err = new Error(`Chat stream failed (${response.status})`) as Error & { status?: number }
      err.status = response.status
      throw err
    }

    if (!response.body) {
      throw new Error('Chat stream returned no body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let result: StreamMessageResult = {}

    const handleEvent = (event: string) => {
      if (!event.startsWith('data:')) return
      const raw = event.slice(event.indexOf(':') + 1).replace(/^ /, '')
      // The backend JSON-encodes each chunk so markdown newlines survive the SSE frame.
      // Decode it back to the original text. Fall back to the raw payload for older backends.
      let payload = raw
      try {
        const decoded = JSON.parse(raw)
        if (typeof decoded === 'string') payload = decoded
      } catch {
        // Not JSON-encoded (older backend) — use the raw payload as-is.
      }
      const errorMeta = parseStreamError(payload)
      if (errorMeta) {
        result = { ...result, ...errorMeta }
        return
      }
      const metadata = parseStreamMetadata(payload)
      if (metadata) {
        result = { ...result, ...metadata }
        return
      }
      if (payload) onChunk(payload)
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let boundary = buffer.indexOf('\n\n')
      while (boundary !== -1) {
        const event = buffer.slice(0, boundary).trimEnd()
        buffer = buffer.slice(boundary + 2)
        if (event) handleEvent(event)
        boundary = buffer.indexOf('\n\n')
      }
    }

    const trailing = buffer.trimEnd()
    if (trailing) handleEvent(trailing)

    return result
  },

  async sendPhotoCheck(request: PhotoCheckRequest): Promise<ChatResponse> {
    const formData = new FormData()
    formData.append('visitorId', request.visitorId)
    formData.append('sessionId', request.sessionId)
    formData.append('message', request.message)
    formData.append('image', request.image)

    const response = await api.post<ChatResponse>('/chat/photo-check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async recordPhotoCheckClientEvent(payload: {
    visitorId: string
    reason: string
    fileSizeBytes?: number
    detail?: string
  }): Promise<void> {
    try {
      await api.post('/chat/photo-check-client-event', payload)
    } catch {
      // Fire-and-forget; do not block the user if logging fails
    }
  },

  async getSessions(visitorId: string): Promise<ChatSession[]> {
    const response = await api.get<ChatSession[]>(`/chat/sessions?visitorId=${visitorId}`)
    return response.data
  },

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`)
    return response.data
  },

  async getRemainingMessages(visitorId: string): Promise<number | { remainingMessages: number; creditBalance: number; freeMessagesRemaining: number; messageCount: number; purchasedCreditsTotal?: number; totalCreditsAdded?: number; inferredPurchasedCreditsTotal?: number }> {
    console.log('🔍 Fetching remaining messages for visitorId:', visitorId)
    const response = await api.get<{ remainingMessages: number; creditBalance?: number; freeMessagesRemaining?: number; messageCount?: number; purchasedCreditsTotal?: number; totalCreditsAdded?: number; inferredPurchasedCreditsTotal?: number }>(`/chat/remaining-messages?visitorId=${visitorId}`)
    console.log('📊 Remaining messages response:', response.data)
    // Return full object if available, otherwise just the number for backward compatibility
    if (response.data.creditBalance !== undefined) {
      return {
        remainingMessages: response.data.remainingMessages,
        creditBalance: response.data.creditBalance || 0,
        freeMessagesRemaining: response.data.freeMessagesRemaining || 0,
        messageCount: response.data.messageCount || 0,
        purchasedCreditsTotal: response.data.purchasedCreditsTotal || 0,
        totalCreditsAdded: response.data.totalCreditsAdded || 0,
        inferredPurchasedCreditsTotal: response.data.inferredPurchasedCreditsTotal || 0
      }
    }
    return response.data.remainingMessages
  },
}
