import { apiRequest } from '../../../shared/api/client'
import type { PaymentOutcome, Reservation } from '../types'

export function createReservation(
  eventId: string,
  quantity: number,
): Promise<Reservation> {
  return apiRequest<Reservation>('/reservations', {
    method: 'POST',
    body: JSON.stringify({ eventId, quantity }),
  })
}

export function payReservation(
  id: string,
  outcome: PaymentOutcome,
): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}/pay`, {
    method: 'POST',
    body: JSON.stringify({ outcome }),
  })
}

export function getReservation(id: string): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}`)
}
