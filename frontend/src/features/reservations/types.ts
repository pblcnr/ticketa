export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED'

export type TicketStatus = 'VALID' | 'USED'

export type PaymentStatus = 'APPROVED' | 'DECLINED'

export type PaymentOutcome = 'APPROVED' | 'DECLINED'

export type ReservationTicket = {
  id: string
  code: string
  qrToken: string
  status: TicketStatus
  eventId: string
  reservationId: string
  createdAt: string
  usedAt: string | null
}

export type ReservationPayment = {
  id: string
  amountInCents: number
  status: PaymentStatus
  createdAt: string
  reservationId: string
}

export type Reservation = {
  id: string
  quantity: number
  unitPriceInCents: number
  totalPriceInCents: number
  status: ReservationStatus
  createdAt: string
  expiresAt: string | null
  eventId: string
  clientId: string
  tickets: ReservationTicket[]
  payment: ReservationPayment | null
}
