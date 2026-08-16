import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMyTickets } from '../api/tickets.api'
import type { ClientTicket } from '../types'
import { getMyTicketsErrorMessage } from '../utils/error-message'
import { TicketStatusBadge } from '../components/TicketStatusBadge'
import { formatEventDate } from '../../events/utils/format'
import { PageContainer } from '../../../shared/components/PageContainer'
import { PerforatedDivider } from '../../../shared/components/PerforatedDivider'

export function MyTicketsPage() {
  const [tickets, setTickets] = useState<ClientTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTickets() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await listMyTickets()

        if (!cancelled) {
          setTickets(
            data.sort(
              (a, b) =>
                new Date(b.event.date).getTime() - new Date(a.event.date).getTime(),
            ),
          )
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getMyTicketsErrorMessage(error))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadTickets()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleCopyCode(ticket: ClientTicket) {
    try {
      await navigator.clipboard.writeText(ticket.code)
      setCopiedTicketId(ticket.id)
    } catch {
      setCopiedTicketId(null)
    }
  }

  useEffect(() => {
    if (!copiedTicketId) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCopiedTicketId(null)
    }, 2000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [copiedTicketId])

  return (
    <main className="py-6">
      <PageContainer>
        <header className="mb-6">
          <h1 className="font-display text-4xl uppercase tracking-wide text-ink">
            Meus ingressos
          </h1>
          <p className="mt-1 font-body text-sm text-ink/70">
            Apresente o código na portaria para entrar no evento
          </p>
        </header>

        {isLoading ? (
          <p className="font-body text-ink/70">Carregando ingressos…</p>
        ) : null}

        {errorMessage ? (
          <article className="bg-paper px-6 py-8 shadow-sm">
            <p className="font-body text-sm text-stub-red">{errorMessage}</p>
          </article>
        ) : null}

        {!isLoading && !errorMessage && tickets.length === 0 ? (
          <article className="bg-paper px-6 py-8 shadow-sm">
            <p className="font-body text-ink/70">Você ainda não tem ingressos.</p>
            <Link
              to="/events"
              className="mt-3 inline-block font-body text-sm text-stage-violet underline-offset-2 hover:underline"
            >
              Ver eventos disponíveis
            </Link>
          </article>
        ) : null}

        <ul className="space-y-5">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <article className="overflow-hidden bg-paper shadow-sm">
                <div className="px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl uppercase text-ink">
                        {ticket.event.title}
                      </h2>
                      <p className="mt-1 font-body text-sm text-ink/70">
                        {formatEventDate(ticket.event.date)}
                      </p>
                      <p className="mt-1 font-body text-sm text-ink/70">
                        {ticket.event.place}
                      </p>
                    </div>
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                </div>

                <PerforatedDivider notchColor="bg-paper" />

                <div className="px-6 py-5">
                  <p className="font-body text-xs uppercase tracking-widest text-stage-violet">
                    Código do ingresso
                  </p>
                  <p className="mt-2 font-ticket-mono text-2xl tracking-wide text-ink">
                    {ticket.code}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(ticket)}
                      className="border border-stage-violet px-4 py-2 font-body text-sm uppercase tracking-widest text-stage-violet transition-opacity hover:opacity-80"
                    >
                      {copiedTicketId === ticket.id ? 'Copiado!' : 'Copiar código'}
                    </button>
                    <Link
                      to={`/tickets/share/${ticket.qrToken}`}
                      className="bg-stage-violet px-4 py-2 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
                    >
                      Compartilhar
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </PageContainer>
    </main>
  )
}
