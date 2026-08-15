import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { StubTabs } from '../../../shared/components/StubTabs'
import { signupRequest } from '../api/auth.api'
import {
  signupSchema,
  type SignupFormData,
} from '../schemas/signup.schema'
import type { UserRole } from '../types'
import { getSignupErrorMessage } from '../utils/error-message'

const roleOptions = [
  { label: 'Cliente', value: 'CLIENTE' as const },
  { label: 'Organizador', value: 'ORGANIZADOR' as const },
]

export function SignupPage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'CLIENTE',
    },
  })

  const selectedRole = watch('role')

  function handleRoleChange(role: UserRole) {
    setValue('role', role, { shouldValidate: true })
  }

  async function onSubmit(data: SignupFormData) {
    setSubmitError(null)

    const payload = {
      ...data,
      name: data.name?.trim() ? data.name.trim() : undefined,
    }

    try {
      await signupRequest(payload)
      navigate('/login', {
        replace: true,
        state: {
          message: 'Conta criada com sucesso. Faça login para continuar.',
        },
      })
    } catch (error) {
      setSubmitError(getSignupErrorMessage(error))
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-kraft p-6">
      <article className="w-full max-w-lg overflow-hidden bg-paper shadow-sm">
        <div className="px-8 pt-7">
          <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
            Cadastro
          </h1>
          <p className="mt-1 font-body text-sm text-ink/70">
            Escolha seu canhoto e crie sua conta
          </p>
        </div>

        <StubTabs
          options={roleOptions}
          value={selectedRole}
          onChange={handleRoleChange}
          className="mt-5"
        >
          <form
            className="flex flex-1 flex-col px-8 py-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
                >
                  Nome (opcional)
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className="w-full border border-perf-grey bg-kraft/30 px-3 py-2 font-body text-ink outline-none focus:border-stage-violet"
                  {...register('name')}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full border border-perf-grey bg-kraft/30 px-3 py-2 font-body text-ink outline-none focus:border-stage-violet"
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
                  htmlFor="password"
                  className="mb-1 block font-body text-xs uppercase tracking-widest text-stage-violet"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full border border-perf-grey bg-kraft/30 px-3 py-2 font-body text-ink outline-none focus:border-stage-violet"
                  {...register('password')}
                />
                {errors.password ? (
                  <p className="mt-1 font-body text-xs text-stub-red">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              {errors.role ? (
                <p className="font-body text-xs text-stub-red">
                  {errors.role.message}
                </p>
              ) : null}

              {submitError ? (
                <p className="font-body text-sm text-stub-red">{submitError}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full bg-stub-red px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? 'Criando conta…' : 'Criar conta'}
            </button>

            <p className="mt-4 text-center font-body text-sm text-ink/70">
              Já tem conta?{' '}
              <Link
                to="/login"
                className="text-stage-violet underline-offset-2 hover:underline"
              >
                Entrar
              </Link>
            </p>
          </form>
        </StubTabs>
      </article>
    </main>
  )
}
