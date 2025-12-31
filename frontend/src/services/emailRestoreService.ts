import api from './api'

export interface EmailRestoreResult {
  success: boolean
  message?: string
  totalCreditsRestored?: number
  mergedVisitorId?: string
}

export const emailRestoreService = {
  async sendVerificationCode(email: string): Promise<{ success: boolean; message?: string }> {
    const response = await api.post<{ success: boolean; message?: string }>('/email-restore/send-code', { email })
    return response.data
  },

  async verifyAndRestore(email: string, verificationCode: string, visitorId: string): Promise<EmailRestoreResult> {
    const response = await api.post<EmailRestoreResult>('/email-restore/verify-and-restore', {
      email,
      verificationCode,
      visitorId
    })
    return response.data
  }
}

