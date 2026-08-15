import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { getEvent, publishEvent } from '../api/events.api'
import type { Event } from '../types'
import { formatEventDate, formatPriceInCents } from '../utils/format'
import {
  getEventDetailErrorMessage,
  getPublishEventErrorMessage,
} from '../utils/error-message'
import { PerforatedDivider } from '../../../shared/components/PerforatedDivider'
import { PageContainer } from '../../../shared/components/PageContainer'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { EventGateSection } from '../components/EventGateSection'

export function OrganizerEventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false

    async function loadEvent() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await getEvent(id!)
        if (cancelled) return

        if (data.organizerId !== user!.id) {
          setErrorMessage('Evento não encontrado.')
          setEvent(null)
          return
        }

        setEvent(data)
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
  }, [id, user])

  async function handlePublish() {
    if (!event) {
      return
    }

    setPublishError(null)
    setIsPublishing(true)

    try {
      const published = await publishEvent(event.id)
      setEvent(published)
    } catch (error) {
      setPublishError(getPublishEventErrorMessage(error))
    } finally {
      setIsPublishing(false)
    }
  }

  const isOwner = event?.organizerId === user!.id
  const canEdit = isOwner && event?.status === 'DRAFT'
  const canPublish = isOwner && event?.status === 'DRAFT'

  return (
    <main className="py-6">
      <PageContainer>
        <Link
          to="/organizer/events"
          className="font-body text-sm text-stage-violet underline-offset-2 hover:underline"
        >
          ← Voltar para meus eventos
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

            <PerforatedDivider notchColor="bg-paper" className="my-5" />

            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt=""
                className="mb-5 h-48 w-full object-cover"
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
                  Capacidade / Estoque
                </dt>
                <dd className="mt-1">
                  {event.totalCapacity} / {event.stock}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Preço
                </dt>
                <dd className="mt-1">{formatPriceInCents(event.priceInCents)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Ticketmaster ID
                </dt>
                <dd className="mt-1 font-ticket-mono text-xs">{event.ticketmasterId}</dd>
              </div>
            </dl>

            {publishError ? (
              <p className="mt-4 font-body text-sm text-stub-red">{publishError}</p>
            ) : null}

            {canEdit || canPublish ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                    className="border border-stage-violet px-4 py-2.5 font-body text-sm uppercase tracking-widest text-stage-violet transition-opacity hover:opacity-80"
                  >
                    Editar
                  </button>
                ) : null}
                {canPublish ? (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="bg-gate-green px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {isPublishing ? 'Publicando…' : 'Publicar'}
                  </button>
                ) : null}
              </div>
            ) : null}

            <EventGateSection
              eventId={event.id}
              gateProfileId={event.gateProfileId}
              onGateLinked={(gateProfileId) =>
                setEvent((current) =>
                  current ? { ...current, gateProfileId } : current,
                )
              }
            />
          </article>
        ) : null}
      </PageContainer>
    </main>
  )
}
