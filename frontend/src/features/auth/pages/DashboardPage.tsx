import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function formatRoleLabel(role: string): string {
  if (role === 'ORGANIZADOR') {
    return 'Organizador'
  }

  if (role === 'CLIENTE') {
    return 'Cliente'
  }

  return role
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const displayName = user!.name?.trim() || user!.id

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-kraft p-6">
      <article className="w-full max-w-md bg-paper px-8 py-7 shadow-sm">
        <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
          Dashboard
        </h1>
        <p className="mt-4 font-body text-ink">
          Bem-vindo, {displayName} ({formatRoleLabel(user!.role)})
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 bg-stub-red px-4 py-2.5 font-body text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
        >
          Sair
        </button>
      </article>
    </main>
  )
}
