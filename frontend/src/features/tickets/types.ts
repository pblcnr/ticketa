export type TicketStatus = 'VALID' | 'USED'

export type TicketEventSummary = {
  title: string
  date: string
  place: string
}

export type ClientTicket = {
  id: string
  code: string
  qrToken: string
  status: TicketStatus
  usedAt: string | null
  event: TicketEventSummary
}

export type SharedTicket = {
  status: TicketStatus
  event: TicketEventSummary
}
