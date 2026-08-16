import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicEvent } from '../api/public-events.api'
import type { Event } from '../../events/types'
import {
  formatEventDate,
  formatPriceInCents,
} from '../../events/utils/format'
import { getEventDetailErrorMessage } from '../../events/utils/error-message'
import { PageContainer } from '../../../shared/components/PageContainer'
import { PerforatedDivider } from '../../../shared/components/PerforatedDivider'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EventReservationSection } from '../../reservations/components/EventReservationSection'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false

    async function loadEvent() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await getPublicEvent(id!)
        if (!cancelled) {
          setEvent(data)
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getEventDetailErrorMessage(error))
          setEvent(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadEvent()

    return () => {
      cancelled = true
    }
  }, [id])

  const isSoldOut = event?.stock === 0

  return (
    <main className="py-6">
      <PageContainer>
        <Link
          to="/events"
          className="font-body text-sm text-stage-violet underline-offset-2 hover:underline"
        >
          ← Voltar para eventos
        </Link>

        {isLoading ? (
          <p className="mt-6 font-body text-ink/70">Carregando evento…</p>
        ) : null}

        {errorMessage ? (
          <article className="mt-6 bg-paper px-8 py-7 shadow-sm">
            <p className="font-body text-stub-red">{errorMessage}</p>
          </article>
        ) : null}

        {event ? (
          <article className="mt-6 bg-paper px-8 py-7 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
                {event.title}
              </h1>
              <StatusBadge status={event.status} />
            </div>

            {isSoldOut ? (
              <p className="mt-4 inline-block bg-stub-red/15 px-3 py-1.5 font-body text-sm uppercase tracking-widest text-stub-red">
                Esgotado
              </p>
            ) : (
              <p className="mt-4 font-body text-sm text-gate-green">
                {event.stock === 1
                  ? '1 ingresso disponível'
                  : `${event.stock} ingressos disponíveis`}
              </p>
            )}

            <PerforatedDivider notchColor="bg-paper" className="my-5" />

            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt=""
                className="mb-5 h-56 w-full object-cover"
              />
            ) : null}

            <dl className="space-y-3 font-body text-sm text-ink">
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Descrição
                </dt>
                <dd className="mt-1">{event.description}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Local
                </dt>
                <dd className="mt-1">{event.place}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Data
                </dt>
                <dd className="mt-1">{formatEventDate(event.date)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Capacidade
                </dt>
                <dd className="mt-1">{event.totalCapacity}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Preço
                </dt>
                <dd className="mt-1">{formatPriceInCents(event.priceInCents)}</dd>
              </div>
            </dl>

            <EventReservationSection eventId={event.id} stock={event.stock} />
          </article>
        ) : null}
      </PageContainer>
    </main>
  )
}
