import { Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/context/AuthContext'
import { AppHeader } from './AppHeader'
import { PublicHeader } from './PublicHeader'

export function AuthenticatedLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-kraft">
      {user ? <AppHeader /> : <PublicHeader />}
      <Outlet />
    </div>
  )
}
