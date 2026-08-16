import { apiRequest } from '../../../shared/api/client'
import type { ClientTicket, SharedTicket } from '../types'

export function listMyTickets(): Promise<ClientTicket[]> {
  return apiRequest<ClientTicket[]>('/tickets/me')
}

export function getSharedTicket(qrToken: string): Promise<SharedTicket> {
  return apiRequest<SharedTicket>(`/tickets/share/${encodeURIComponent(qrToken)}`)
}
