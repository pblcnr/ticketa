import type { UserRole } from '../types'

export function getPostLoginRoute(role: UserRole): string {
  if (role === 'ORGANIZADOR') {
    return '/organizer/events'
  }

  if (role === 'PORTARIA') {
    return '/gate/validate'
  }

  return '/dashboard'
}
