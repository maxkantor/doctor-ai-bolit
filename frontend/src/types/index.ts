export interface Visitor {
  visitorId: string
  createdAt: string
  messageCount: number
  creditBalance: number
  isPremium: boolean
  lastActive: string
  referralSource?: string
}

export interface ChatSession {
  visitorId: string
  sessionId: string
  title: string
  createdAt: string
}

export interface ChatMessage {
  sessionId: string
  timestamp: string
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  visitorId: string
  sessionId: string
  message: string
}

export interface ChatResponse {
  message: string
  remainingMessages: number
  requiresPayment: boolean
}

export interface ContactMessage {
  messageId: string
  name: string
  email: string
  message: string
  status: string
  createdAt: string
}

export interface PricingConfig {
  configId: string
  freeMessageLimit: number
  updatedAt: string
}

export interface PricingPlan {
  planId: string
  name: string
  price: number
  credits: number
  description: string
  isActive: boolean
  isMostPopular: boolean
  displayOrder: number
  stripePriceId?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentHistory {
  paymentId: string
  visitorId: string
  stripeSessionId: string
  stripeCustomerId: string
  amount: number
  currency: string
  credits: number
  planId: string
  planName: string
  status: string
  paymentDate: string
  customerEmail?: string
}

