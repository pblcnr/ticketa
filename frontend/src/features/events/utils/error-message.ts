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

export function getCatalogSearchErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return (
      extractMessage(error.body) ??
      'Não foi possível buscar no catálogo. Tente novamente.'
    )
  }

  return 'Não foi possível buscar no catálogo. Tente novamente.'
}

export function getEventsListErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return (
      extractMessage(error.body) ??
      'Não foi possível carregar os eventos. Tente novamente.'
    )
  }

  return 'Não foi possível carregar os eventos. Tente novamente.'
}

export function getEventDetailErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return 'Evento não encontrado.'
    }

    return (
      extractMessage(error.body) ??
      'Não foi possível carregar o evento. Tente novamente.'
    )
  }

  return 'Não foi possível carregar o evento. Tente novamente.'
}

export function getCreateEventErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'Este item do catálogo já foi importado.'
    }

    return (
      extractMessage(error.body) ??
      'Não foi possível criar o evento. Tente novamente.'
    )
  }

  return 'Não foi possível criar o evento. Tente novamente.'
}

export function getUpdateEventErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return (
      extractMessage(error.body) ??
      'Não foi possível atualizar o evento. Tente novamente.'
    )
  }

  return 'Não foi possível atualizar o evento. Tente novamente.'
}

export function getPublishEventErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return (
      extractMessage(error.body) ??
      'Não foi possível publicar o evento. Tente novamente.'
    )
  }

  return 'Não foi possível publicar o evento. Tente novamente.'
}

export function getCreateGateUserErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'Este evento já possui uma portaria vinculada.'
    }

    return (
      extractMessage(error.body) ??
      'Não foi possível credenciar a portaria. Tente novamente.'
    )
  }

  return 'Não foi possível credenciar a portaria. Tente novamente.'
}
