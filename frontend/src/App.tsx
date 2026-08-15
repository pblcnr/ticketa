import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { RequireAuth } from './features/auth/components/RequireAuth'
import { AuthProvider, useAuth } from './features/auth/context/AuthContext'
import { DashboardPage } from './features/auth/pages/DashboardPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { SignupPage } from './features/auth/pages/SignupPage'
import { OrganizerEventDetailPage } from './features/events/pages/OrganizerEventDetailPage'
import { OrganizerEventFormPage } from './features/events/pages/OrganizerEventFormPage'
import { OrganizerEventSearchPage } from './features/events/pages/OrganizerEventSearchPage'
import { OrganizerEventsListPage } from './features/events/pages/OrganizerEventsListPage'
import { getPostLoginRoute } from './features/auth/utils/post-auth-route'

function RootRedirect() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getPostLoginRoute(user!.role)} replace />
}

function OrganizerRoute({ children }: { children: ReactNode }) {
  return <RequireAuth allowedRoles={['ORGANIZADOR']}>{children}</RequireAuth>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/organizer/events"
        element={
          <OrganizerRoute>
            <OrganizerEventsListPage />
          </OrganizerRoute>
        }
      />
      <Route
        path="/organizer/events/new"
        element={
          <OrganizerRoute>
            <OrganizerEventSearchPage />
          </OrganizerRoute>
        }
      />
      <Route
        path="/organizer/events/new/form"
        element={
          <OrganizerRoute>
            <OrganizerEventFormPage />
          </OrganizerRoute>
        }
      />
      <Route
        path="/organizer/events/:id"
        element={
          <OrganizerRoute>
            <OrganizerEventDetailPage />
          </OrganizerRoute>
        }
      />
      <Route
        path="/organizer/events/:id/edit"
        element={
          <OrganizerRoute>
            <OrganizerEventFormPage />
          </OrganizerRoute>
        }
      />
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
