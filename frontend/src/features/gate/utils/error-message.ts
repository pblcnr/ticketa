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

export function getValidateTicketErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return (
      extractMessage(error.body) ??
      'Não foi possível validar o ingresso. Verifique a conexão e tente novamente.'
    )
  }

  return 'Não foi possível validar o ingresso. Verifique a conexão e tente novamente.'
}
