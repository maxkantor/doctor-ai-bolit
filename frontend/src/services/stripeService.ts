import api from './api'

export interface CheckoutRequest {
  visitorId: string
  priceId: string
  credits?: number
}

export interface CheckoutResponse {
  url: string
}

export const stripeService = {
  async createCheckout(request: CheckoutRequest): Promise<string> {
    const response = await api.post<CheckoutResponse>('/stripe/checkout', request)
    return response.data.url
  },
}

