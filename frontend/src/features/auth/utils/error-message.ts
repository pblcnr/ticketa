import { ApiError } from '../../../shared/api/client'
import type { ApiErrorBody } from '../types'

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

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'E-mail ou senha incorretos.'
    }

    return extractMessage(error.body) ?? 'Não foi possível entrar. Tente novamente.'
  }

  return 'Não foi possível entrar. Tente novamente.'
}

export function getSignupErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'Este e-mail já está cadastrado.'
    }

    return extractMessage(error.body) ?? 'Não foi possível criar a conta. Tente novamente.'
  }

  return 'Não foi possível criar a conta. Tente novamente.'
}
