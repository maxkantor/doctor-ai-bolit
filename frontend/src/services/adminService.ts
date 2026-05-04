import api from './api'
import { Visitor, ContactMessage, PricingConfig, PricingPlan, PaymentHistory, AdminUserSummary, AdminUsageTimelineEntry, AdminDashboardSummary } from '../types'

const getAdminHeaders = () => {
  const adminKey = sessionStorage.getItem('doctoraibolit_admin_key')
  return {
    'X-ADMIN-KEY': adminKey || '',
  }
}

export const adminService = {
  async login(adminKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!adminKey || adminKey.trim().length === 0) {
        return { success: false, error: 'Admin key is required' }
      }

      sessionStorage.setItem('doctoraibolit_admin_key', adminKey.trim())
      
      // Test the key by making a request to a lightweight endpoint
      const response = await api.get('/admin/users', { 
        headers: getAdminHeaders(),
        timeout: 10000 // 10 second timeout
      })
      
      // If we get here, the request succeeded
      return { success: true }
    } catch (error: any) {
      sessionStorage.removeItem('doctoraibolit_admin_key')
      
      // Provide detailed error message
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401 || error.response.status === 403) {
          return { success: false, error: 'Invalid admin key. Please check your credentials.' }
        } else if (error.response.status === 404) {
          return { success: false, error: 'API endpoint not found. Please check your API configuration.' }
        } else {
          return { success: false, error: `Server error: ${error.response.status} ${error.response.statusText}` }
        }
      } else if (error.request) {
        // Request was made but no response received
        return { success: false, error: 'Unable to connect to server. Please check your internet connection and API URL.' }
      } else {
        // Something else happened
        return { success: false, error: error.message || 'Login failed. Please try again.' }
      }
    }
  },

  async getUsers(): Promise<Visitor[]> {
    const response = await api.get<Visitor[]>('/admin/users', { 
      headers: getAdminHeaders(),
      timeout: 10000
    })
    return response.data || []
  },

  async getEnrichedUsers(): Promise<AdminUserSummary[]> {
    const response = await api.get<AdminUserSummary[]>('/admin/users/enriched', {
      headers: getAdminHeaders(),
      timeout: 20000,
    })
    return response.data || []
  },

  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const response = await api.get<AdminDashboardSummary>('/admin/dashboard/summary', {
      headers: getAdminHeaders(),
      timeout: 20000,
    })
    return response.data
  },

  async getUser(visitorId: string): Promise<Visitor> {
    const response = await api.get<Visitor>(`/admin/user/${visitorId}`, { headers: getAdminHeaders() })
    return response.data
  },

  async addCredits(visitorId: string, credits: number): Promise<void> {
    await api.post('/admin/credits', { visitorId, credits }, { headers: getAdminHeaders() })
  },

  async resetCredits(visitorId: string): Promise<void> {
    await api.post('/admin/reset-credits', { visitorId }, { headers: getAdminHeaders() })
  },

  async markPremium(visitorId: string, isPremium = true): Promise<void> {
    await api.post('/admin/mark-premium', { visitorId, isPremium }, { headers: getAdminHeaders() })
  },

  async resetVisitor(visitorId: string): Promise<void> {
    await api.post('/admin/reset', { visitorId }, { headers: getAdminHeaders() })
  },

  async resetMessageCount(visitorId: string, resetTo?: number): Promise<void> {
    await api.post('/admin/reset-messages', { visitorId, resetTo }, { headers: getAdminHeaders() })
  },

  async getEmails(): Promise<ContactMessage[]> {
    const response = await api.get<ContactMessage[]>('/admin/emails', { 
      headers: getAdminHeaders(),
      timeout: 10000
    })
    return response.data || []
  },

  async updateEmailStatus(messageId: string, status: string): Promise<void> {
    await api.post('/admin/email/status', { messageId, status }, { headers: getAdminHeaders() })
  },

  async replyToEmail(to: string, subject: string, body: string, messageId?: string): Promise<void> {
    await api.post('/admin/email/reply', { to, subject, body, messageId }, { headers: getAdminHeaders() })
  },

  async getPricingConfig(): Promise<PricingConfig> {
    const response = await api.get<PricingConfig>('/admin/pricing/config', { headers: getAdminHeaders() })
    return response.data
  },

  async savePricingConfig(config: PricingConfig): Promise<void> {
    await api.post('/admin/pricing/config', config, { headers: getAdminHeaders() })
  },

  async getPricingPlans(): Promise<PricingPlan[]> {
    const response = await api.get<PricingPlan[]>('/admin/pricing/plans', { headers: getAdminHeaders() })
    return response.data
  },

  async getPricingPlan(planId: string): Promise<PricingPlan> {
    const response = await api.get<PricingPlan>(`/admin/pricing/plans/${planId}`, { headers: getAdminHeaders() })
    return response.data
  },

  async createPricingPlan(plan: PricingPlan): Promise<PricingPlan> {
    const response = await api.post<PricingPlan>('/admin/pricing/plans', plan, { headers: getAdminHeaders() })
    return response.data
  },

  async updatePricingPlan(planId: string, plan: PricingPlan): Promise<PricingPlan> {
    const response = await api.put<PricingPlan>(`/admin/pricing/plans/${planId}`, plan, { headers: getAdminHeaders() })
    return response.data
  },

  async deletePricingPlan(planId: string): Promise<void> {
    await api.delete(`/admin/pricing/plans/${planId}`, { headers: getAdminHeaders() })
  },

  async seedDefaultPricing(): Promise<void> {
    const response = await api.post('/seed/default-pricing', {}, { headers: getAdminHeaders() })
    if (response.data && !response.data.success) {
      throw new Error(response.data.message || 'Failed to seed default pricing')
    }
  },

  async getPaymentHistory(visitorId?: string): Promise<PaymentHistory[]> {
    const url = visitorId ? `/admin/payments?visitorId=${visitorId}` : '/admin/payments'
    const response = await api.get<PaymentHistory[]>(url, { headers: getAdminHeaders() })
    return response.data || []
  },

  async getUsageTimeline(visitorId: string): Promise<AdminUsageTimelineEntry[]> {
    const response = await api.get<AdminUsageTimelineEntry[]>(`/admin/user/${visitorId}/usage-timeline`, {
      headers: getAdminHeaders(),
      timeout: 20000,
    })
    return response.data || []
  },
}

