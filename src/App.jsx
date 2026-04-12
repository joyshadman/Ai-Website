import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Comunity from './Pages/Comunity'
import Price from './Pages/Price'
import Project from './Pages/Project'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comunity" element={<Comunity />} />
        <Route path="/price" element={<Price />} />
        <Route path="/project" element={<Project />} />
      </Routes>
    </Router>
  )
}

export default App