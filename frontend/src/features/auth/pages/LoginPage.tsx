import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PerforatedDivider } from '../../../shared/components/PerforatedDivider'
import { loginRequest } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'
import { loginSchema, type LoginFormData } from '../schemas/login.schema'
import { getLoginErrorMessage } from '../utils/error-message'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const successMessage = (location.state as { message?: string } | null)?.message

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormData) {
    setSubmitError(null)

    try {
      const response = await loginRequest(data)
      login(response)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setSubmitError(getLoginErrorMessage(error))
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-kraft p-6">
      <article className="w-full max-w-md bg-paper px-8 py-7 shadow-sm">
        <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
          Entrar
        </h1>
        <p className="mt-1 font-body text-sm text-ink/70">
          Acesse sua conta Ticketa
        </p>

        <PerforatedDivider notchColor="bg-paper" className="my-5" />

        {successMessage ? (
          <p className="mb-4 rounded-sm border border-gate-green/30 bg-gate-green/10 px-3 py-2 font-body text-sm text-gate-green">
            {successMessage}
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
              autoComplete="current-password"
              className="w-full border border-perf-grey bg-kraft/30 px-3 py-2 font-body text-ink outline-none focus:border-stage-violet"
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
            className="w-full bg-stub-red px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-5 text-center font-body text-sm text-ink/70">
          Ainda não tem conta?{' '}
          <Link to="/signup" className="text-stage-violet underline-offset-2 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </article>
    </main>
  )
}
