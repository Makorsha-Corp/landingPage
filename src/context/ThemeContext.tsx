import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { originFromMouseEvent, runThemeTransition, type TransitionOrigin } from '../lib/themeTransition'

export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  iconAnimating: boolean
  toggleTheme: (event?: MouseEvent | React.MouseEvent) => void
  setTheme: (newTheme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function applyThemeToDocument(nextTheme: Theme): void {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(nextTheme)
  localStorage.setItem('marker-theme', nextTheme)
}

export interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('marker-theme')
      return (savedTheme as Theme) || 'light'
    }
    return 'light'
  })
  const [iconAnimating, setIconAnimating] = useState(false)

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  const runWithTransition = useCallback((nextTheme: Theme, event?: MouseEvent | React.MouseEvent) => {
    const apply = (): void => {
      setThemeState(nextTheme)
      applyThemeToDocument(nextTheme)
    }

    let origin: TransitionOrigin | undefined
    if (event) {
      origin = originFromMouseEvent(event as MouseEvent)
    }

    const { animateIcon } = runThemeTransition(apply, { origin })

    if (animateIcon) {
      setIconAnimating(true)
      window.setTimeout(() => setIconAnimating(false), 400)
    }
  }, [])

  const toggleTheme = useCallback(
    (event?: MouseEvent | React.MouseEvent) => {
      const nextTheme: Theme = theme === 'light' ? 'dark' : 'light'
      runWithTransition(nextTheme, event)
    },
    [theme, runWithTransition],
  )

  const setTheme = useCallback(
    (newTheme: Theme) => {
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

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
