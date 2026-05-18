import { Routes, Route, useLocation } from 'react-router-dom'
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

const App = () => {
  const { pathname } = useLocation()

  const hideShell =
    /^\/project\/[^/]+$/.test(pathname) ||
    /^\/preview\/[^/]+$/.test(pathname)

  return (
    <>
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
    </>
  )
}

export default App