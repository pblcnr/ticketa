import type { Event } from '../../events/types'

export type EventFilterCriteria = {
  query: string
  availableOnly: boolean
}

export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function sortEventsByDate(events: Event[]): Event[] {
  return [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
}

export function filterEvents(
  events: Event[],
  criteria: EventFilterCriteria,
): Event[] {
  const sortedEvents = sortEventsByDate(events)
  const normalizedQuery = normalizeForSearch(criteria.query.trim())

  return sortedEvents.filter((event) => {
    if (criteria.availableOnly && event.stock === 0) {
      return false
    }

    if (!normalizedQuery) {
      return true
    }

    const title = normalizeForSearch(event.title)
    const place = normalizeForSearch(event.place)

    return title.includes(normalizedQuery) || place.includes(normalizedQuery)
  })
}
