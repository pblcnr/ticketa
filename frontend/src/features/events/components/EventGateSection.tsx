import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createGateUser } from '../api/events.api'
import {
  gateFormSchema,
  type GateFormData,
} from '../schemas/gate-form.schema'
import { getCreateGateUserErrorMessage } from '../utils/error-message'
import { PerforatedDivider } from '../../../shared/components/PerforatedDivider'

const inputClassName =
  'w-full border border-perf-grey bg-kraft/30 px-3 py-2 font-body text-ink outline-none focus:border-stage-violet'

type EventGateSectionProps = {
  eventId: string
  gateProfileId: string | null
  onGateLinked: (gateProfileId: string) => void
}

export function EventGateSection({
  eventId,
  gateProfileId,
  onGateLinked,
}: EventGateSectionProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GateFormData>({
    resolver: zodResolver(gateFormSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  })

  async function onSubmit(data: GateFormData) {
    setSubmitError(null)

    try {
      const result = await createGateUser(eventId, {
        email: data.email,
        password: data.password,
        name: data.name?.trim() ? data.name.trim() : undefined,
      })

      onGateLinked(result.profile.id)
      reset()
    } catch (error) {
      setSubmitError(getCreateGateUserErrorMessage(error))
    }
  }

  return (
    <>
      <PerforatedDivider notchColor="bg-paper" className="my-5" />

      <section>
        <h2 className="font-display text-xl uppercase tracking-wide text-ink">
          Portaria
        </h2>

        {gateProfileId ? (
          <p className="mt-3 font-body text-sm text-gate-green">
            Portaria já credenciada.
          </p>
        ) : (
          <form
            className="mt-4 space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <p className="font-body text-sm text-ink/70">
              Crie uma conta de portaria para validar ingressos deste evento.
            </p>

            <div>
              <label
                htmlFor="gate-name"
                className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
              >
                Nome (opcional)
              </label>
              <input
                id="gate-name"
                type="text"
                autoComplete="name"
                className={inputClassName}
                {...register('name')}
              />
            </div>

            <div>
              <label
                htmlFor="gate-email"
                className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
              >
                E-mail
              </label>
              <input
                id="gate-email"
                type="email"
                autoComplete="email"
                className={inputClassName}
                {...register('email')}
              />
              {errors.email ? (
                <p className="mt-1 font-body text-xs text-stub-red">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="gate-password"
                className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
              >
                Senha
              </label>
              <input
                id="gate-password"
                type="password"
                autoComplete="new-password"
                className={inputClassName}
                {...register('password')}
              />
              {errors.password ? (
                <p className="mt-1 font-body text-xs text-stub-red">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {submitError ? (
              <p className="font-body text-sm text-stub-red">{submitError}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-stage-violet px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? 'Credenciando…' : 'Credenciar portaria'}
            </button>
          </form>
        )}
      </section>
    </>
  )
}
