import { describe, expect, it } from 'vitest'
import type { Event } from '../../events/types'
import { filterEvents } from '../utils/filter-events'

function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'event-1',
    title: 'Rock in Rio',
    description: 'Festival de rock',
    place: 'Parque Olímpico',
    totalCapacity: 1000,
    stock: 50,
    priceInCents: 15000,
    date: '2026-09-01T20:00:00.000Z',
    imageUrl: null,
    status: 'PUBLISHED',
    ticketmasterId: 'tm-001',
    organizerId: 'org-1',
    gateProfileId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('filterEvents', () => {
  const events: Event[] = [
    createEvent({
      id: 'event-1',
      title: 'Rock in Rio',
      place: 'Parque Olímpico',
      stock: 50,
      date: '2026-09-01T20:00:00.000Z',
    }),
    createEvent({
      id: 'event-2',
      title: 'Jazz Night',
      place: 'Teatro Municipal',
      stock: 0,
      date: '2026-10-15T19:00:00.000Z',
    }),
    createEvent({
      id: 'event-3',
      title: 'Samba ao Vivo',
      place: 'Lapa',
      stock: 20,
      date: '2026-11-20T21:00:00.000Z',
    }),
  ]

  it('filtra corretamente por palavra-chave no título', () => {
    const result = filterEvents(events, { query: 'jazz', availableOnly: false })

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('event-2')
  })

  it('filtra corretamente por palavra-chave no local', () => {
    const result = filterEvents(events, { query: 'lapa', availableOnly: false })

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('event-3')
  })

  it('busca é case-insensitive', () => {
    const result = filterEvents(events, { query: 'ROCK', availableOnly: false })

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('event-1')
  })

  it('com o filtro "somente disponíveis" ativo, remove eventos com stock 0', () => {
    const result = filterEvents(events, { query: '', availableOnly: true })

    expect(result).toHaveLength(2)
    expect(result.map((event) => event.id)).toEqual(['event-1', 'event-3'])
  })

  it('lista vazia de entrada retorna lista vazia (sem erro)', () => {
    const result = filterEvents([], { query: 'rock', availableOnly: false })

    expect(result).toEqual([])
  })

  it('sem nenhum filtro aplicado, retorna a lista completa sem alteração', () => {
    const result = filterEvents(events, { query: '', availableOnly: false })

    expect(result).toHaveLength(3)
    expect(result.map((event) => event.id)).toEqual(['event-1', 'event-2', 'event-3'])
  })
})
