import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { createReservation } from '../api/reservations.api'
import { getCreateReservationErrorMessage } from '../utils/error-message'

type EventReservationSectionProps = {
  eventId: string
  stock: number
}

export function EventReservationSection({
  eventId,
  stock,
}: EventReservationSectionProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()

  const [quantity, setQuantity] = useState(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (stock === 0) {
    return null
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mt-6">
        <Link
          to="/login"
          state={{ from: location }}
          className="inline-block bg-stub-red px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
        >
          Entrar para reservar
        </Link>
      </div>
    )
  }

  if (user.role !== 'CLIENTE') {
    return null
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1))
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(stock, current + 1))
  }

  function handleQuantityChange(value: string) {
    const parsed = Number.parseInt(value, 10)

    if (Number.isNaN(parsed)) {
      return
    }

    setQuantity(Math.min(stock, Math.max(1, parsed)))
  }

  async function handleReserve() {
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const reservation = await createReservation(eventId, quantity)
      navigate(`/reservations/${reservation.id}`)
    } catch (error) {
      setSubmitError(getCreateReservationErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="reservation-quantity"
          className="mb-2 block font-body text-xs uppercase tracking-widest text-stage-violet"
        >
          Quantidade
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={quantity <= 1 || isSubmitting}
            className="border border-perf-grey px-3 py-2 font-body text-lg text-ink transition-opacity hover:opacity-80 disabled:opacity-40"
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <input
            id="reservation-quantity"
            type="number"
            min={1}
            max={stock}
            value={quantity}
            onChange={(event) => handleQuantityChange(event.target.value)}
            disabled={isSubmitting}
            className="w-20 border border-perf-grey bg-kraft/30 px-3 py-2 text-center font-body text-ink outline-none focus:border-stage-violet"
          />
          <button
            type="button"
            onClick={increaseQuantity}
            disabled={quantity >= stock || isSubmitting}
            className="border border-perf-grey px-3 py-2 font-body text-lg text-ink transition-opacity hover:opacity-80 disabled:opacity-40"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
      </div>

      {submitError ? (
        <p className="font-body text-sm text-stub-red">{submitError}</p>
      ) : null}

      <button
        type="button"
        onClick={handleReserve}
        disabled={isSubmitting}
        className="bg-stub-red px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? 'Reservando…' : 'Reservar'}
      </button>
    </div>
  )
}
