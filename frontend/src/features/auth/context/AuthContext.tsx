import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getAuthToken,
  getStoredAuthUser,
  setAuthToken,
  setStoredAuthUser,
} from '../../../shared/api/client'
import type { AuthUser, LoginResponse, UserRole } from '../types'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (response: LoginResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readInitialUser(): AuthUser | null {
  const token = getAuthToken()

  if (!token) {
    return null
  }

  const storedUser = getStoredAuthUser()

  if (!storedUser) {
    setAuthToken(null)
    return null
  }

  return {
    id: storedUser.id,
    role: storedUser.role as UserRole,
    name: storedUser.name,
    token,
  }
}

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(readInitialUser)

  const login = useCallback((response: LoginResponse) => {
    const nextUser: AuthUser = {
      id: response.id,
      role: response.role,
      name: response.name,
      token: response.access_token,
    }

    setAuthToken(response.access_token)
    setStoredAuthUser({
      id: response.id,
      role: response.role,
      name: response.name,
    })
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    setStoredAuthUser(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null && Boolean(user.token),
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
