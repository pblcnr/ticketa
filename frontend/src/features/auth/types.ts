export type UserRole = 'ORGANIZADOR' | 'CLIENTE' | 'PORTARIA'

export type AuthUser = {
  id: string
  role: UserRole
  name: string | null
  token: string
}

export type LoginResponse = {
  access_token: string
  id: string
  role: UserRole
  name: string | null
}

export type SignupResponse = {
  id: string
  email: string
  role: UserRole
  name: string | null
}

export type ApiErrorBody = {
  message?: string | string[]
  error?: string
  statusCode?: number
}
