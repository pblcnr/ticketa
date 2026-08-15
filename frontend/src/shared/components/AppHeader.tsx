import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/context/AuthContext'
import { PageContainer } from './PageContainer'
import { PerforatedDivider } from './PerforatedDivider'

function formatRoleLabel(role: string): string {
  if (role === 'ORGANIZADOR') {
    return 'Organizador'
  }

  if (role === 'CLIENTE') {
    return 'Cliente'
  }

  if (role === 'PORTARIA') {
    return 'Portaria'
  }

  return role
}

export function AppHeader() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const displayName = user.name?.trim() || user.id

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-ink text-paper">
      <PageContainer className="flex flex-wrap items-center justify-between gap-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/"
            className="font-display text-xl uppercase tracking-wide text-paper transition-opacity hover:opacity-80"
          >
            Ticketa
          </Link>
          <div className="font-body text-sm">
            <span className="font-medium">{displayName}</span>
            <span className="text-paper/70"> · {formatRoleLabel(user.role)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-stub-red px-3 py-1.5 font-body text-xs uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
        >
          Sair
        </button>
      </PageContainer>
      <PerforatedDivider notchColor="bg-kraft" />
    </header>
  )
}
