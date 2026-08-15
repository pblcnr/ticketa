import type { UserRole } from '../types'

export function getPostLoginRoute(role: UserRole): string {
  if (role === 'ORGANIZADOR') {
    return '/organizer/events'
  }

  return '/dashboard'
}
