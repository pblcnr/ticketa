import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listPublicEvents } from '../api/public-events.api'
import type { Event } from '../../events/types'
import {
  formatEventDate,
  formatPriceInCents,
} from '../../events/utils/format'
import { getEventsListErrorMessage } from '../../events/utils/error-message'
import { filterEvents } from '../utils/filter-events'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const query = searchParams.get('q') ?? ''
  const availableOnly = searchParams.get('available') === 'true'

  const filteredEvents = useMemo(
    () => filterEvents(events, { query, availableOnly }),
    [events, query, availableOnly],
  )

  useEffect(() => {
    let cancelled = false

    async function loadEvents() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await listPublicEvents()

        if (!cancelled) {
          setEvents(data)
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

  function handleAvailableOnlyChange(checked: boolean) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)

        if (checked) {
          next.set('available', 'true')
        } else {
          next.delete('available')
        }

        return next
      },
      { replace: true },
    )
  }

  const hasActiveFilters = query.trim().length > 0 || availableOnly
  const showNoFilterResults =
    !isLoading && !errorMessage && events.length > 0 && filteredEvents.length === 0

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

        {!isLoading && !errorMessage ? (
          <div className="mb-6">
            <label className="flex items-center gap-2 font-body text-sm text-ink">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(event) =>
                  handleAvailableOnlyChange(event.target.checked)
                }
                className="h-4 w-4 accent-stage-violet"
              />
              Somente com ingressos disponíveis
            </label>
          </div>
        ) : null}

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

        {showNoFilterResults ? (
          <article className="bg-paper px-6 py-8 shadow-sm">
            <p className="font-body text-ink/70">
              Nenhum evento encontrado para essa busca.
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchParams({}, { replace: true })
                }}
                className="mt-3 font-body text-sm text-stage-violet underline-offset-2 hover:underline"
              >
                Limpar filtros
              </button>
            ) : null}
          </article>
        ) : null}

        {!isLoading && !errorMessage && filteredEvents.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
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
