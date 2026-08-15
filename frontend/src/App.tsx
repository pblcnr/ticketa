import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './features/auth/components/RequireAuth'
import { AuthProvider, useAuth } from './features/auth/context/AuthContext'
import { DashboardPage } from './features/auth/pages/DashboardPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { SignupPage } from './features/auth/pages/SignupPage'
import { getPostLoginRoute } from './features/auth/utils/post-auth-route'
import { OrganizerEventDetailPage } from './features/events/pages/OrganizerEventDetailPage'
import { OrganizerEventFormPage } from './features/events/pages/OrganizerEventFormPage'
import { OrganizerEventSearchPage } from './features/events/pages/OrganizerEventSearchPage'
import { OrganizerEventsListPage } from './features/events/pages/OrganizerEventsListPage'
import { AuthenticatedLayout } from './shared/components/AuthenticatedLayout'

function RootRedirect() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getPostLoginRoute(user!.role)} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<AuthenticatedLayout />}>
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={['ORGANIZADOR']} />}>
          <Route path="/organizer/events" element={<OrganizerEventsListPage />} />
          <Route path="/organizer/events/new" element={<OrganizerEventSearchPage />} />
          <Route
            path="/organizer/events/new/form"
            element={<OrganizerEventFormPage />}
          />
          <Route path="/organizer/events/:id" element={<OrganizerEventDetailPage />} />
          <Route
            path="/organizer/events/:id/edit"
            element={<OrganizerEventFormPage />}
          />
        </Route>
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
