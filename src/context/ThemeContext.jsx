import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { originFromMouseEvent, runThemeTransition } from '../lib/themeTransition'

const ThemeContext = createContext(undefined)

function applyThemeToDocument(nextTheme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(nextTheme)
  localStorage.setItem('marker-theme', nextTheme)
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('marker-theme')
      return savedTheme || 'light'
    }
    return 'light'
  })
  const [iconAnimating, setIconAnimating] = useState(false)

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  const runWithTransition = useCallback((nextTheme, event) => {
    const apply = () => {
      setThemeState(nextTheme)
      applyThemeToDocument(nextTheme)
    }

    const { animateIcon } = runThemeTransition(apply, {
      origin: originFromMouseEvent(event),
    })

    if (animateIcon) {
      setIconAnimating(true)
      window.setTimeout(() => setIconAnimating(false), 400)
    }
  }, [])

  const toggleTheme = useCallback(
    (event) => {
      const nextTheme = theme === 'light' ? 'dark' : 'light'
      runWithTransition(nextTheme, event)
    },
    [theme, runWithTransition],
  )

  const setTheme = useCallback(
    (newTheme) => {
      if (newTheme === theme) return
      runWithTransition(newTheme)
    },
    [theme, runWithTransition],
  )

  return (
    <ThemeContext.Provider value={{ theme, iconAnimating, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
