import api from './api'
import { ChatRequest, ChatResponse, ChatSession, ChatMessage } from '../types'

export const chatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/chat', request)
    return response.data
  },

  async getSessions(visitorId: string): Promise<ChatSession[]> {
    const response = await api.get<ChatSession[]>(`/chat/sessions?visitorId=${visitorId}`)
    return response.data
  },

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`)
    return response.data
  },

  async getRemainingMessages(visitorId: string): Promise<number | { remainingMessages: number; creditBalance: number; freeMessagesRemaining: number; messageCount: number; purchasedCreditsTotal?: number; totalCreditsAdded?: number }> {
    console.log('🔍 Fetching remaining messages for visitorId:', visitorId)
    const response = await api.get<{ remainingMessages: number; creditBalance?: number; freeMessagesRemaining?: number; messageCount?: number; purchasedCreditsTotal?: number; totalCreditsAdded?: number }>(`/chat/remaining-messages?visitorId=${visitorId}`)
    console.log('📊 Remaining messages response:', response.data)
    // Return full object if available, otherwise just the number for backward compatibility
    if (response.data.creditBalance !== undefined) {
      return {
        remainingMessages: response.data.remainingMessages,
        creditBalance: response.data.creditBalance || 0,
        freeMessagesRemaining: response.data.freeMessagesRemaining || 0,
        messageCount: response.data.messageCount || 0,
        purchasedCreditsTotal: response.data.purchasedCreditsTotal || 0,
        totalCreditsAdded: response.data.totalCreditsAdded || 0
      }
    }
    return response.data.remainingMessages
  },
}

