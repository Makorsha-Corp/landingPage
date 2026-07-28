import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'marker-nav-layout'

const NavLayoutContext = createContext(undefined)

export function NavLayoutProvider({ children }) {
  const [navLayout, setNavLayout] = useState(() => {
    if (typeof window === 'undefined') return 'island'
    return localStorage.getItem(STORAGE_KEY) === 'bar' ? 'bar' : 'island'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, navLayout)
  }, [navLayout])

  const cycleNavLayout = useCallback(() => {
    setNavLayout((prev) => (prev === 'island' ? 'bar' : 'island'))
  }, [])

  return (
    <NavLayoutContext.Provider value={{ navLayout, setNavLayout, cycleNavLayout }}>
      {children}
    </NavLayoutContext.Provider>
  )
}

export function useNavLayout() {
  const context = useContext(NavLayoutContext)
  if (context === undefined) {
    throw new Error('useNavLayout must be used within a NavLayoutProvider')
  }
  return context
}
