import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicEvent } from '../../catalog-browse/api/public-events.api'
import type { Event } from '../../events/types'
import { formatPriceInCents } from '../../events/utils/format'
import { getReservation, payReservation } from '../api/reservations.api'
import type { PaymentOutcome, Reservation } from '../types'
import {
  getPayReservationErrorMessage,
  getReservationDetailErrorMessage,
} from '../utils/error-message'
import { PageContainer } from '../../../shared/components/PageContainer'
import { PerforatedDivider } from '../../../shared/components/PerforatedDivider'

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [payError, setPayError] = useState<string | null>(null)
  const [isPaying, setIsPaying] = useState(false)

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false

    async function loadCheckout() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const reservationData = await getReservation(id!)

        if (cancelled) {
          return
        }

        setReservation(reservationData)

        try {
          const eventData = await getPublicEvent(reservationData.eventId)
          if (!cancelled) {
            setEvent(eventData)
          }
        } catch {
          if (!cancelled) {
            setEvent(null)
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getReservationDetailErrorMessage(error))
          setReservation(null)
          setEvent(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadCheckout()

    return () => {
      cancelled = true
    }
  }, [id])

  async function handlePay(outcome: PaymentOutcome) {
    if (!reservation) {
      return
    }

    setPayError(null)
    setIsPaying(true)

    try {
      const updated = await payReservation(reservation.id, outcome)
      setReservation(updated)
    } catch (error) {
      setPayError(getPayReservationErrorMessage(error))
    } finally {
      setIsPaying(false)
    }
  }

  const eventTitle = event?.title ?? 'Evento'

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
          <p className="mt-6 font-body text-ink/70">Carregando reserva…</p>
        ) : null}

        {errorMessage ? (
          <article className="mt-6 bg-paper px-8 py-7 shadow-sm">
            <p className="font-body text-stub-red">{errorMessage}</p>
          </article>
        ) : null}

        {reservation ? (
          <article className="mt-6 bg-paper px-8 py-7 shadow-sm">
            <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
              Checkout
            </h1>

            <PerforatedDivider notchColor="bg-paper" className="my-5" />

            <dl className="space-y-3 font-body text-sm text-ink">
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Evento
                </dt>
                <dd className="mt-1">{eventTitle}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Quantidade
                </dt>
                <dd className="mt-1">{reservation.quantity}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-stage-violet">
                  Total
                </dt>
                <dd className="mt-1">
                  {formatPriceInCents(reservation.totalPriceInCents)}
                </dd>
              </div>
            </dl>

            {reservation.status === 'PENDING' ? (
              <div className="mt-6 space-y-4">
                <p className="font-body text-sm text-ink/70">
                  Simule o resultado do pagamento:
                </p>

                {payError ? (
                  <p className="font-body text-sm text-stub-red">{payError}</p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handlePay('APPROVED')}
                    disabled={isPaying}
                    className="bg-gate-green px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {isPaying ? 'Processando…' : 'Simular pagamento aprovado'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePay('DECLINED')}
                    disabled={isPaying}
                    className="bg-stub-red px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {isPaying ? 'Processando…' : 'Simular pagamento recusado'}
                  </button>
                </div>
              </div>
            ) : null}

            {reservation.status === 'CONFIRMED' ? (
              <div className="mt-6 space-y-4">
                <p className="rounded-sm border border-gate-green/30 bg-gate-green/10 px-4 py-3 font-body text-sm text-gate-green">
                  Pagamento aprovado! Seus ingressos foram gerados.
                </p>

                {reservation.tickets.length > 0 ? (
                  <div>
                    <h2 className="font-body text-xs uppercase tracking-widest text-stage-violet">
                      Códigos dos ingressos
                    </h2>
                    <ul className="mt-2 space-y-2">
                      {reservation.tickets.map((ticket) => (
                        <li
                          key={ticket.id}
                          className="font-ticket-mono text-sm text-ink"
                        >
                          {ticket.code}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <Link
                  to="/events"
                  className="inline-block font-body text-sm text-stage-violet underline-offset-2 hover:underline"
                >
                  Voltar para eventos
                </Link>
              </div>
            ) : null}

            {reservation.status === 'CANCELLED' ? (
              <div className="mt-6 space-y-4">
                <p className="rounded-sm border border-stub-red/30 bg-stub-red/10 px-4 py-3 font-body text-sm text-stub-red">
                  Pagamento recusado. A reserva foi cancelada.
                </p>
                <Link
                  to={`/events/${reservation.eventId}`}
                  className="inline-block font-body text-sm text-stage-violet underline-offset-2 hover:underline"
                >
                  Voltar para o evento e tentar novamente
                </Link>
              </div>
            ) : null}
          </article>
        ) : null}
      </PageContainer>
    </main>
  )
}
