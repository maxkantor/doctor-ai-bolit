import api from './api'
import { PricingConfig, PricingPlan } from '../types'

export const pricingService = {
  async getConfig(): Promise<PricingConfig> {
    const response = await api.get('/chat/pricing/config')
    return response.data
  },

  async getPlans(): Promise<PricingPlan[]> {
    const response = await api.get('/chat/pricing/plans')
    return response.data
  },
}

