import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { validateTicket } from '../api/gate.api'
import {
  validateTicketSchema,
  type ValidateTicketFormData,
} from '../schemas/validate-ticket.schema'
import type { GateValidationResultType } from '../types'
import { getValidateTicketErrorMessage } from '../utils/error-message'
import { getValidationResultDisplay } from '../utils/validation-result'
import { PageContainer } from '../../../shared/components/PageContainer'
import { PerforatedDivider } from '../../../shared/components/PerforatedDivider'

const inputClassName =
  'w-full border border-perf-grey bg-kraft/30 px-3 py-2 font-body text-ink outline-none focus:border-stage-violet'

export function GateValidatePage() {
  const codeInputRef = useRef<HTMLInputElement>(null)
  const [validationResult, setValidationResult] =
    useState<GateValidationResultType | null>(null)
  const [networkError, setNetworkError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ValidateTicketFormData>({
    resolver: zodResolver(validateTicketSchema),
    defaultValues: {
      code: '',
    },
  })

  const { ref: codeRegisterRef, ...codeRegisterProps } = register('code')

  useEffect(() => {
    if (validationResult !== null) {
      codeInputRef.current?.focus()
    }
  }, [validationResult])

  async function onSubmit(data: ValidateTicketFormData) {
    setNetworkError(null)
    setValidationResult(null)

    try {
      const response = await validateTicket(data.code.trim())
      setValidationResult(response.result)
      reset({ code: '' })
    } catch (error) {
      setNetworkError(getValidateTicketErrorMessage(error))
    }
  }

  const resultDisplay = validationResult
    ? getValidationResultDisplay(validationResult)
    : null

  return (
    <main className="py-6">
      <PageContainer>
        <article className="bg-paper px-8 py-7 shadow-sm">
          <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
            Validar ingresso
          </h1>
          <p className="mt-1 font-body text-sm text-ink/70">
            Digite o código do ingresso para validar a entrada.
          </p>

          <PerforatedDivider notchColor="bg-paper" className="my-5" />

          {resultDisplay ? (
            <div
              className={`mb-5 px-6 py-8 text-center font-display text-2xl uppercase tracking-wide ${resultDisplay.className}`}
              role="status"
            >
              {resultDisplay.label}
            </div>
          ) : null}

          {networkError ? (
            <p className="mb-4 font-body text-sm text-stub-red">{networkError}</p>
          ) : null}

          <form
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <label
                htmlFor="ticket-code"
                className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
              >
                Código do ingresso
              </label>
              <input
                id="ticket-code"
                type="text"
                autoComplete="off"
                autoFocus
                className={inputClassName}
                {...codeRegisterProps}
                ref={(element) => {
                  codeRegisterRef(element)
                  codeInputRef.current = element
                }}
              />
              {errors.code ? (
                <p className="mt-1 font-body text-xs text-stub-red">
                  {errors.code.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gate-green px-4 py-3 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? 'Validando…' : 'Validar'}
            </button>
          </form>
        </article>
      </PageContainer>
    </main>
  )
}
