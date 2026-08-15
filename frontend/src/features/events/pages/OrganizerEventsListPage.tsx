import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { listEvents } from '../api/events.api'
import type { Event } from '../types'
import { formatEventDate } from '../utils/format'
import { getEventsListErrorMessage } from '../utils/error-message'
import { StatusBadge } from '../../../shared/components/StatusBadge'

export function OrganizerEventsListPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadEvents() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await listEvents()
        const ownEvents = data.filter((event) => event.organizerId === user!.id)

        if (!cancelled) {
          setEvents(
            ownEvents.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            ),
          )
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getEventsListErrorMessage(error))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadEvents()

    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <main className="min-h-screen bg-kraft p-6">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl uppercase tracking-wide text-ink">
              Meus eventos
            </h1>
            <p className="mt-1 font-body text-sm text-ink/70">
              Gerencie rascunhos e eventos publicados
            </p>
          </div>
          <Link
            to="/organizer/events/new"
            className="bg-stub-red px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
          >
            Criar evento
          </Link>
        </header>

        {isLoading ? (
          <p className="font-body text-ink/70">Carregando eventos…</p>
        ) : null}

        {errorMessage ? (
          <p className="font-body text-sm text-stub-red">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && events.length === 0 ? (
          <article className="bg-paper px-6 py-8 shadow-sm">
            <p className="font-body text-ink/70">
              Nenhum evento encontrado. Importe um item do catálogo para começar.
            </p>
          </article>
        ) : null}

        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                to={`/organizer/events/${event.id}`}
                className="block bg-paper px-6 py-5 shadow-sm transition-opacity hover:opacity-95"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl uppercase text-ink">
                      {event.title}
                    </h2>
                    <p className="mt-1 font-body text-sm text-ink/70">
                      {formatEventDate(event.date)} · {event.place}
                    </p>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
