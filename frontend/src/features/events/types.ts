export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'

export type CatalogItem = {
  externalId: string
  name: string
  date: string
  imageUrl?: string
  venueName?: string
}

export type Event = {
  id: string
  title: string
  description: string
  place: string
  totalCapacity: number
  stock: number
  priceInCents: number
  date: string
  imageUrl: string | null
  status: EventStatus
  ticketmasterId: string
  organizerId: string
  gateProfileId: string | null
  createdAt: string
  updatedAt: string
}

export type CreateGateUserPayload = {
  email: string
  password: string
  name?: string
}

export type CreateGateUserResult = {
  profile: {
    id: string
    role: string
    name: string | null
  }
  eventId: string
}

export type CreateEventPayload = {
  title: string
  description: string
  place: string
  totalCapacity: number
  priceInCents: number
  date: string
  ticketmasterId: string
  imageUrl?: string
}

export type UpdateEventPayload = {
  title?: string
  description?: string
  place?: string
  totalCapacity?: number
  priceInCents?: number
  date?: string
  imageUrl?: string
}

export type CatalogSelectionState = {
  catalogItem: CatalogItem
}

export type ApiErrorBody = {
  message?: string | string[]
  error?: string
  statusCode?: number
}
