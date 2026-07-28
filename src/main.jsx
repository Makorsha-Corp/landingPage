import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { NavLayoutProvider } from './context/NavLayoutContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <NavLayoutProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NavLayoutProvider>
    </ThemeProvider>
  </StrictMode>,
)
