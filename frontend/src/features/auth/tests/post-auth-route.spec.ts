import { describe, expect, it } from 'vitest'
import { getPostLoginRoute } from '../utils/post-auth-route'

describe('getPostLoginRoute', () => {
  it('ORGANIZADOR retorna /organizer/events', () => {
    expect(getPostLoginRoute('ORGANIZADOR')).toBe('/organizer/events')
  })

  it('PORTARIA retorna /gate/validate', () => {
    expect(getPostLoginRoute('PORTARIA')).toBe('/gate/validate')
  })

  it('CLIENTE retorna /events', () => {
    expect(getPostLoginRoute('CLIENTE')).toBe('/events')
  })
})
