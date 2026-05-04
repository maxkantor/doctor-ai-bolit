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
  customerName?: string
  customerPhone?: string
  billingAddressLine1?: string
  billingAddressLine2?: string
  billingCity?: string
  billingState?: string
  billingPostalCode?: string
  billingCountry?: string
  paymentMethodType?: string
  paymentMethodBrand?: string
  paymentMethodLast4?: string
}

export interface AdminUserSummary {
  visitorId: string
  createdAt: string
  lastActive: string
  messageCount: number
  creditBalance: number
  isPremium: boolean
  email?: string
  totalSpent: number
  creditsPurchased: number
  conversionStatus: string
  lastSessionMessages: number
}

export interface AdminUsageTimelineEntry {
  timestamp: string
  eventType: string
  messagesUsedCumulative: number
  remainingCredits: number
  deltaCredits: number
  details: string
}

export interface AdminDashboardSummary {
  totalUsers: number
  activeLast24Hours: number
  payingUsers: number
  totalRevenue: number
  conversionRatePercent: number
  averageMessagesBeforePayment: number
  usersUsedAllFreeCredits: number
  funnelVisited: number
  funnelStartedChat: number
  funnelUsedFreeCredits: number
  funnelPaid: number
  contactMessagesCount: number
  recentTransactions: PaymentHistory[]
}

