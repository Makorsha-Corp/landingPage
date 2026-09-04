import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import { LandingPerfProvider } from './context/LandingPerfContext'

export default function App() {
  return (
    <LandingPerfProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home2" element={<Navigate to="/" replace />} />
      </Routes>
    </LandingPerfProvider>
  )
}
