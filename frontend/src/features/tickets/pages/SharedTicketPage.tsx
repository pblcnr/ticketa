import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSharedTicket } from '../api/tickets.api'
import type { SharedTicket } from '../types'
import { getSharedTicketErrorMessage } from '../utils/error-message'
import { TicketStatusBadge } from '../components/TicketStatusBadge'
import { formatEventDate } from '../../events/utils/format'
import { PageContainer } from '../../../shared/components/PageContainer'
import { PerforatedDivider } from '../../../shared/components/PerforatedDivider'

export function SharedTicketPage() {
  const { qrToken } = useParams<{ qrToken: string }>()
  const [ticket, setTicket] = useState<SharedTicket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!qrToken) {
      return
    }

    let cancelled = false

    async function loadTicket() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await getSharedTicket(qrToken!)
        if (!cancelled) {
          setTicket(data)
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getSharedTicketErrorMessage(error))
          setTicket(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadTicket()

    return () => {
      cancelled = true
    }
  }, [qrToken])

  return (
    <main className="py-6">
      <PageContainer>
        <Link
          to="/events"
          className="font-body text-sm text-stage-violet underline-offset-2 hover:underline"
        >
          ← Ver eventos
        </Link>

        {isLoading ? (
          <p className="mt-6 font-body text-ink/70">Carregando ingresso…</p>
        ) : null}

        {errorMessage ? (
          <article className="mt-6 bg-paper px-8 py-7 shadow-sm">
            <p className="font-body text-stub-red">{errorMessage}</p>
          </article>
        ) : null}

        {ticket ? (
          <article className="mt-6 bg-paper px-8 py-7 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
                Ingresso compartilhado
              </h1>
              <TicketStatusBadge status={ticket.status} />
            </div>

            <PerforatedDivider notchColor="bg-paper" className="my-5" />

            <dl className="space-y-3 font-body text-sm text-ink">
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Evento
                </dt>
                <dd className="mt-1">{ticket.event.title}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Data
                </dt>
                <dd className="mt-1">{formatEventDate(ticket.event.date)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Local
                </dt>
                <dd className="mt-1">{ticket.event.place}</dd>
              </div>
            </dl>

            <p className="mt-5 font-body text-sm text-ink/70">
              {ticket.status === 'VALID'
                ? 'Este ingresso está válido para entrada no evento.'
                : 'Este ingresso já foi utilizado na portaria.'}
            </p>
          </article>
        ) : null}
      </PageContainer>
    </main>
  )
}
