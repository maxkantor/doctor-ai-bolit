import api from './api'
import { ChatRequest, ChatResponse, ChatSession, ChatMessage, PhotoCheckRequest } from '../types'

export const chatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/chat', request)
    return response.data
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

