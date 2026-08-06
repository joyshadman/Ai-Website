import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './Pages/Home'
import Community from './Pages/Community'
import Price from './Pages/Price'
import Project from './Pages/Project'
import Builder from './Pages/Builder'
import EditorPage from './Pages/EditorPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Toaster } from "sonner"
import AuthPage from './Pages/auth/AuthPage'
import Settings from './Pages/Setting'
import { authClient } from './lib/auth-client'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate('/auth/signin', {
        replace: true,
        state: { from: location.pathname },
      })
    }
  }, [isPending, session?.user, navigate, location.pathname])

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  if (!session?.user) return null

  return <>{children}</>
}

const App = () => {
  const { pathname } = useLocation()

  const hideShell =
    /^\/project\/[^/]+$/.test(pathname) ||
    /^\/preview\/[^/]+$/.test(pathname) ||
    /^\/editor\//.test(pathname)

  return (
    <>
      {!hideShell && <Navbar />}
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comunity" element={<Community />} />
        <Route path="/price" element={<Price />} />
        <Route
          path="/project"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preview/:projectId"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
        <Route path="/editor/:projectId" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route
          path="/account/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!hideShell && <Footer />}
    </>
  )
}

export default App
