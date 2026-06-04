import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Homepage2 from './pages/Homepage2'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home2" element={<Homepage2 />} />
    </Routes>
  )
}
