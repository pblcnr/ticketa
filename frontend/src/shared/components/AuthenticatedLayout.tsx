import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'

export function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-kraft">
      <AppHeader />
      <Outlet />
    </div>
  )
}
