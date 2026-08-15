import { apiRequest } from '../../../shared/api/client'
import type { Event } from '../../events/types'

export function listPublicEvents(): Promise<Event[]> {
  return apiRequest<Event[]>('/events')
}

export function getPublicEvent(id: string): Promise<Event> {
  return apiRequest<Event>(`/events/${id}`)
}
