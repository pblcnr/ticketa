import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPublicEvents } from '../api/public-events.api'
import type { Event } from '../../events/types'
import {
  formatEventDate,
  formatPriceInCents,
} from '../../events/utils/format'
import { getEventsListErrorMessage } from '../../events/utils/error-message'
import { PageContainer } from '../../../shared/components/PageContainer'

function formatAvailability(stock: number): string {
  if (stock === 0) {
    return 'Esgotado'
  }

  if (stock === 1) {
    return '1 disponível'
  }

  return `${stock} disponíveis`
}

export function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadEvents() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await listPublicEvents()

        if (!cancelled) {
          setEvents(
            data.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
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
  }, [])

  return (
    <main className="py-6">
      <PageContainer>
        <header className="mb-6">
          <h1 className="font-display text-4xl uppercase tracking-wide text-ink">
            Eventos
          </h1>
          <p className="mt-1 font-body text-sm text-ink/70">
            Confira os eventos disponíveis para reserva
          </p>
        </header>

        {isLoading ? (
          <p className="font-body text-ink/70">Carregando eventos…</p>
        ) : null}

        {errorMessage ? (
          <article className="bg-paper px-6 py-8 shadow-sm">
            <p className="font-body text-sm text-stub-red">{errorMessage}</p>
          </article>
        ) : null}

        {!isLoading && !errorMessage && events.length === 0 ? (
          <article className="bg-paper px-6 py-8 shadow-sm">
            <p className="font-body text-ink/70">
              Nenhum evento publicado no momento.
            </p>
          </article>
        ) : null}

        {!isLoading && !errorMessage && events.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  to={`/events/${event.id}`}
                  className="flex h-full flex-col bg-paper shadow-sm transition-opacity hover:opacity-95"
                >
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-perf-grey/30">
                      <span className="font-display text-lg uppercase tracking-wide text-ink/40">
                        Sem imagem
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col px-5 py-4">
                    <h2 className="font-display text-lg uppercase text-ink">
                      {event.title}
                    </h2>
                    <p className="mt-2 font-body text-sm text-ink/70">
                      {formatEventDate(event.date)}
                    </p>
                    <p className="mt-1 font-body text-sm text-ink/70">
                      {event.place}
                    </p>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4">
                      <p className="font-body text-sm font-medium text-ink">
                        {formatPriceInCents(event.priceInCents)}
                      </p>
                      <p
                        className={[
                          'font-body text-xs uppercase tracking-widest',
                          event.stock === 0 ? 'text-stub-red' : 'text-gate-green',
                        ].join(' ')}
                      >
                        {formatAvailability(event.stock)}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </PageContainer>
    </main>
  )
}
