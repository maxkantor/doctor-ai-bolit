import api from './api'

export interface ContactRequest {
  name: string
  email: string
  message: string
}

export const contactService = {
  async submitContact(request: ContactRequest): Promise<void> {
    await api.post('/contact', request)
  },
}

