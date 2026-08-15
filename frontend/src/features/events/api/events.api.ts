import { apiRequest } from '../../../shared/api/client'
import type {
  CatalogItem,
  CreateEventPayload,
  Event,
  UpdateEventPayload,
} from '../types'

export function searchCatalog(
  keyword?: string,
  page = 0,
): Promise<CatalogItem[]> {
  const params = new URLSearchParams()

  if (keyword?.trim()) {
    params.set('keyword', keyword.trim())
  }

  params.set('page', String(page))

  const query = params.toString()

  return apiRequest<CatalogItem[]>(`/catalog/search?${query}`)
}

export function getCatalogItem(externalId: string): Promise<CatalogItem> {
  return apiRequest<CatalogItem>(`/catalog/${externalId}`)
}

export function createEvent(data: CreateEventPayload): Promise<Event> {
  return apiRequest<Event>('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function listEvents(): Promise<Event[]> {
  return apiRequest<Event[]>('/events')
}

export function getEvent(id: string): Promise<Event> {
  return apiRequest<Event>(`/events/${id}`)
}

export function updateEvent(
  id: string,
  data: UpdateEventPayload,
): Promise<Event> {
  return apiRequest<Event>(`/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function publishEvent(id: string): Promise<Event> {
  return apiRequest<Event>(`/events/${id}/publish`, {
    method: 'POST',
  })
}
