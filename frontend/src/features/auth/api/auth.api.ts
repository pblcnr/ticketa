import { apiRequest } from '../../../shared/api/client'
import type { LoginResponse, SignupResponse } from '../types'
import type { LoginFormData } from '../schemas/login.schema'
import type { SignupFormData } from '../schemas/signup.schema'

export function loginRequest(data: LoginFormData): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function signupRequest(data: SignupFormData): Promise<SignupResponse> {
  return apiRequest<SignupResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
