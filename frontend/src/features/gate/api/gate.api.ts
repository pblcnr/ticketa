import { apiRequest } from '../../../shared/api/client'
import type { GateValidationResult } from '../types'

export function validateTicket(code: string): Promise<GateValidationResult> {
  return apiRequest<GateValidationResult>('/gate/validate', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}
