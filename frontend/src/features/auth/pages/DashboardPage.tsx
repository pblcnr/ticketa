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
  const { user } = useAuth()

  const displayName = user!.name?.trim() || user!.id

  return (
    <main className="flex min-h-[calc(100vh-3.25rem)] items-center justify-center p-6">
      <article className="w-full max-w-md bg-paper px-8 py-7 shadow-sm">
        <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
          Dashboard
        </h1>
        <p className="mt-4 font-body text-ink">
          Bem-vindo, {displayName} ({formatRoleLabel(user!.role)})
        </p>
      </article>
    </main>
  )
}
