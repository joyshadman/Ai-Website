import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './Pages/Home'
import Comunity from './Pages/Comunity'
import Price from './Pages/Price'
import Project from './Pages/Project'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Toaster } from "sonner"
import AuthPage from './Pages/auth/authpage'

const App = () => {
  return (
    <>
      <Navbar />
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comunity" element={<Comunity />} />
        <Route path="/price" element={<Price />} />
        <Route path="/project" element={<Project />} />
        <Route path="/auth/:pathname" element={<AuthPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App