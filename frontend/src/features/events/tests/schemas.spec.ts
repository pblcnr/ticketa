import { describe, expect, it } from 'vitest'
import { eventFormSchema } from '../schemas/event-form.schema'

const validPayload = {
  title: 'Show de Rock',
  description: 'Uma noite especial',
  place: 'Arena',
  totalCapacity: 500,
  priceInCents: 8000,
  date: '2026-12-01T20:00:00.000Z',
  ticketmasterId: 'tm-123',
}

describe('eventFormSchema', () => {
  it('rejeita totalCapacity não-positivo', () => {
    const result = eventFormSchema.safeParse({
      ...validPayload,
      totalCapacity: 0,
    })

    expect(result.success).toBe(false)
  })

  it('rejeita priceInCents negativo', () => {
    const result = eventFormSchema.safeParse({
      ...validPayload,
      priceInCents: -1,
    })

    expect(result.success).toBe(false)
  })

  it('aceita imageUrl ausente (campo opcional)', () => {
    const result = eventFormSchema.safeParse(validPayload)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.imageUrl).toBeUndefined()
    }
  })

  it('aceita payload válido completo', () => {
    const result = eventFormSchema.safeParse({
      ...validPayload,
      imageUrl: 'https://example.com/poster.jpg',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        ...validPayload,
        imageUrl: 'https://example.com/poster.jpg',
      })
    }
  })
})
