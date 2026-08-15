import { Link } from 'react-router-dom'
import { PageContainer } from './PageContainer'
import { PerforatedDivider } from './PerforatedDivider'

export function PublicHeader() {
  return (
    <header className="bg-ink text-paper">
      <PageContainer className="flex flex-wrap items-center justify-between gap-4 py-3">
        <Link
          to="/events"
          className="font-display text-xl uppercase tracking-wide text-paper transition-opacity hover:opacity-80"
        >
          Ticketa
        </Link>
        <div className="flex flex-wrap items-center gap-3 font-body text-sm">
          <Link
            to="/login"
            className="text-paper/90 underline-offset-2 hover:underline"
          >
            Entrar
          </Link>
          <Link
            to="/signup"
            className="bg-stub-red px-3 py-1.5 text-xs uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
          >
            Cadastre-se
          </Link>
        </div>
      </PageContainer>
      <PerforatedDivider notchColor="bg-kraft" />
    </header>
  )
}
