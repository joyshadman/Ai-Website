import { Routes, Route, useLocation } from 'react-router-dom'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import Home from './Pages/Home'
import Comunity from './Pages/Comunity'
import Price from './Pages/Price'
import Project from './Pages/Project'
import Builder from './Pages/Builder'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Toaster } from "sonner"
import AuthPage from './Pages/auth/authpage'
import Settings from './Pages/Setting'
import { authClient } from './lib/auth-client'

// ─── Types ────────────────────────────────────────────────────────────────────

type User = {
  id: string
  email: string
  name?: string
  image?: string
  [key: string]: unknown
}

type SessionState = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  refetch: () => Promise<void>
  signOut: () => Promise<void>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_STORAGE_KEY = 'auth_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// ─── Helpers ──────────────────────────────────────────────────────────────────

function saveSession(user: User) {
  try {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ user, savedAt: Date.now() })
    )
  } catch {
    // localStorage might be unavailable (e.g. private mode quota exceeded)
  }
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const { user, savedAt } = JSON.parse(raw) as { user: User; savedAt: number }
    // Discard stale cache
    if (Date.now() - savedAt > SESSION_TTL_MS) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }
    return user
  } catch {
    return null
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // ignore
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SessionContext = createContext<SessionState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refetch: async () => {},
  signOut: async () => {},
})

export function useSession() {
  return useContext(SessionContext)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

function SessionProvider({ children }: { children: React.ReactNode }) {
  const cached = loadSession()

  // Seed state from localStorage immediately — no flash of unauthenticated content
  const [user, setUser] = useState<User | null>(cached)
  const [isLoading, setIsLoading] = useState(!cached) // skip loading if we have a cache

  const fetchSession = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data } = await authClient.getSession()
      if (data?.user) {
        setUser(data.user as User)
        saveSession(data.user as User)
      } else {
        setUser(null)
        clearSession()
      }
    } catch {
      // Network error — fall back to cached user if available
      if (!user) setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // On mount: silently validate the cached session against the server
  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut()
    } catch {
      // proceed even if the request fails
    } finally {
      setUser(null)
      clearSession()
    }
  }, [])

  return (
    <SessionContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refetch: fetchSession,
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

const App = () => {
  const { pathname } = useLocation()

  const hideShell =
    /^\/project\/[^/]+$/.test(pathname) ||
    /^\/preview\/[^/]+$/.test(pathname)

  return (
    <SessionProvider>
      {!hideShell && <Navbar />}
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comunity" element={<Comunity />} />
        <Route path="/price" element={<Price />} />
        <Route path="/project" element={<Project />} />
        <Route path="/project/:projectId" element={<Builder />} />
        <Route path="/preview/:projectId" element={<Builder />} />
        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route path="/account/settings" element={<Settings />} />
      </Routes>
      {!hideShell && <Footer />}
    </SessionProvider>
  )
}

export default App