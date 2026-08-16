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

export function getMyTicketsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return (
      extractMessage(error.body) ??
      'Não foi possível carregar seus ingressos. Tente novamente.'
    )
  }

  return 'Não foi possível carregar seus ingressos. Tente novamente.'
}

export function getSharedTicketErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return 'Ingresso não encontrado.'
    }

    return (
      extractMessage(error.body) ??
      'Não foi possível carregar o ingresso. Tente novamente.'
    )
  }

  return 'Não foi possível carregar o ingresso. Tente novamente.'
}
