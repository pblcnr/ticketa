import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { createEvent, getEvent, updateEvent } from '../api/events.api'
import {
  eventFormSchema,
  type EventFormData,
} from '../schemas/event-form.schema'
import type { CatalogSelectionState, Event } from '../types'
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../utils/format'
import {
  getCreateEventErrorMessage,
  getEventDetailErrorMessage,
  getUpdateEventErrorMessage,
} from '../utils/error-message'
import { PerforatedDivider } from '../../../shared/components/PerforatedDivider'

const inputClassName =
  'w-full border border-perf-grey bg-kraft/30 px-3 py-2 font-body text-ink outline-none focus:border-stage-violet'

export function OrganizerEventFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)

  const catalogItem = (location.state as CatalogSelectionState | null)?.catalogItem

  const [loadedEvent, setLoadedEvent] = useState<Event | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoadingEvent, setIsLoadingEvent] = useState(isEditMode)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
  })

  useEffect(() => {
    if (!isEditMode || !id) {
      return
    }

    let cancelled = false

    async function loadEvent() {
      setIsLoadingEvent(true)
      setLoadError(null)

      try {
        const event = await getEvent(id!)
        if (cancelled) return

        if (event.status !== 'DRAFT') {
          setLoadError('Apenas eventos em rascunho podem ser editados.')
          return
        }

        setLoadedEvent(event)
        reset({
          title: event.title,
          description: event.description,
          place: event.place,
          totalCapacity: event.totalCapacity,
          priceInCents: event.priceInCents,
          date: toDatetimeLocalValue(event.date),
          imageUrl: event.imageUrl ?? '',
        })
      } catch (error) {
        if (!cancelled) {
          setLoadError(getEventDetailErrorMessage(error))
        }
      } finally {
        if (!cancelled) {
          setIsLoadingEvent(false)
        }
      }
    }

    loadEvent()

    return () => {
      cancelled = true
    }
  }, [id, isEditMode, reset])

  useEffect(() => {
    if (isEditMode || !catalogItem) {
      return
    }

    reset({
      title: catalogItem.name,
      description: '',
      place: catalogItem.venueName ?? '',
      totalCapacity: 100,
      priceInCents: 0,
      date: toDatetimeLocalValue(catalogItem.date),
      imageUrl: catalogItem.imageUrl ?? '',
      ticketmasterId: catalogItem.externalId,
    })
  }, [catalogItem, isEditMode, reset])

  if (!isEditMode && !catalogItem) {
    return <Navigate to="/organizer/events/new" replace />
  }

  async function onSubmit(data: EventFormData) {
    setSubmitError(null)

    const payload = {
      title: data.title,
      description: data.description,
      place: data.place,
      totalCapacity: data.totalCapacity,
      priceInCents: data.priceInCents,
      date: fromDatetimeLocalValue(data.date),
      imageUrl: data.imageUrl?.trim() ? data.imageUrl.trim() : undefined,
    }

    try {
      if (isEditMode && id) {
        const updated = await updateEvent(id, payload)
        navigate(`/organizer/events/${updated.id}`, { replace: true })
        return
      }

      if (!data.ticketmasterId) {
        setSubmitError('Item do catálogo não identificado. Volte e selecione novamente.')
        return
      }

      const created = await createEvent({
        ...payload,
        ticketmasterId: data.ticketmasterId,
      })
      navigate(`/organizer/events/${created.id}`, { replace: true })
    } catch (error) {
      setSubmitError(
        isEditMode
          ? getUpdateEventErrorMessage(error)
          : getCreateEventErrorMessage(error),
      )
    }
  }

  const backLink = isEditMode
    ? `/organizer/events/${id}`
    : '/organizer/events/new'

  return (
    <main className="min-h-screen bg-kraft p-6">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          to={backLink}
          className="font-body text-sm text-stage-violet underline-offset-2 hover:underline"
        >
          ← Voltar
        </Link>

        <article className="mt-4 bg-paper px-8 py-7 shadow-sm">
          <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
            {isEditMode ? 'Editar evento' : 'Novo evento'}
          </h1>
          <p className="mt-1 font-body text-sm text-ink/70">
            {isEditMode
              ? 'Atualize os dados do rascunho'
              : 'Confirme os dados importados do catálogo'}
          </p>

          <PerforatedDivider notchColor="bg-paper" className="my-5" />

          {isLoadingEvent ? (
            <p className="font-body text-ink/70">Carregando evento…</p>
          ) : null}

          {loadError ? (
            <p className="font-body text-sm text-stub-red">{loadError}</p>
          ) : null}

          {!isLoadingEvent && !loadError ? (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <input type="hidden" {...register('ticketmasterId')} />

              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
                >
                  Título
                </label>
                <input id="title" className={inputClassName} {...register('title')} />
                {errors.title ? (
                  <p className="mt-1 font-body text-xs text-stub-red">
                    {errors.title.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
                >
                  Descrição
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className={inputClassName}
                  {...register('description')}
                />
                {errors.description ? (
                  <p className="mt-1 font-body text-xs text-stub-red">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="place"
                  className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
                >
                  Local
                </label>
                <input id="place" className={inputClassName} {...register('place')} />
                {errors.place ? (
                  <p className="mt-1 font-body text-xs text-stub-red">
                    {errors.place.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="totalCapacity"
                    className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
                  >
                    Capacidade total
                  </label>
                  <input
                    id="totalCapacity"
                    type="number"
                    min={1}
                    className={inputClassName}
                    {...register('totalCapacity', { valueAsNumber: true })}
                  />
                  {errors.totalCapacity ? (
                    <p className="mt-1 font-body text-xs text-stub-red">
                      {errors.totalCapacity.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="priceInCents"
                    className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
                  >
                    Preço (centavos)
                  </label>
                  <input
                    id="priceInCents"
                    type="number"
                    min={0}
                    className={inputClassName}
                    {...register('priceInCents', { valueAsNumber: true })}
                  />
                  {errors.priceInCents ? (
                    <p className="mt-1 font-body text-xs text-stub-red">
                      {errors.priceInCents.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
                >
                  Data e hora
                </label>
                <input
                  id="date"
                  type="datetime-local"
                  className={inputClassName}
                  {...register('date')}
                />
                {errors.date ? (
                  <p className="mt-1 font-body text-xs text-stub-red">
                    {errors.date.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="imageUrl"
                  className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
                >
                  URL da imagem (opcional)
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  className={inputClassName}
                  {...register('imageUrl')}
                />
              </div>

              {submitError ? (
                <p className="font-body text-sm text-stub-red">{submitError}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stub-red px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Salvando…'
                  : isEditMode
                    ? 'Salvar alterações'
                    : 'Criar evento'}
              </button>
            </form>
          ) : null}

          {isEditMode && loadedEvent ? (
            <p className="mt-4 font-ticket-mono text-xs text-ink/50">
              Ticketmaster ID: {loadedEvent.ticketmasterId}
            </p>
          ) : null}
        </article>
      </div>
    </main>
  )
}
