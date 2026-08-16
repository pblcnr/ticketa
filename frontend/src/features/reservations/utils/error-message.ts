import { ApiError } from '../../../shared/api/client'
import type { ApiErrorBody } from '../../events/types'

function extractMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object' || !('message' in body)) {
    return undefined
  }

  const { message } = body as ApiErrorBody

  if (Array.isArray(message)) {
    return message.join(', ')
  }

  return message
}

export function getCreateReservationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'Estoque insuficiente para esta quantidade.'
    }

    if (error.status === 404) {
      return 'Evento não encontrado ou não disponível.'
    }

    return (
      extractMessage(error.body) ??
      'Não foi possível criar a reserva. Tente novamente.'
    )
  }

  return 'Não foi possível criar a reserva. Tente novamente.'
}

export function getPayReservationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return (
      extractMessage(error.body) ??
      'Não foi possível processar o pagamento. Tente novamente.'
    )
  }

  return 'Não foi possível processar o pagamento. Tente novamente.'
}

export function getReservationDetailErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return 'Reserva não encontrada.'
    }

    return (
      extractMessage(error.body) ??
      'Não foi possível carregar a reserva. Tente novamente.'
    )
  }

  return 'Não foi possível carregar a reserva. Tente novamente.'
}
