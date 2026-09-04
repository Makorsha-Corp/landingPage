import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import useLandingVitals from '../hooks/useLandingVitals'
import usePerfMonitor from '../hooks/usePerfMonitor'
import { SHOW_PERF_HUD } from '../lib/landingFeatureFlags'

const LandingPerfContext = createContext(null)

export function LandingPerfProvider({ children }) {
  useLandingVitals()

  const tourContextRef = useRef({})
  const [hudEnabled, setHudEnabled] = useState(false)
  const perfMonitorEnabled = SHOW_PERF_HUD && hudEnabled
  const perf = usePerfMonitor(perfMonitorEnabled)

  const setTourContext = useCallback((context) => {
    tourContextRef.current = context
  }, [])

  const getSnapshot = useCallback(() => {
    return perf.getSessionSnapshot(tourContextRef.current)
  }, [perf])

  const value = useMemo(
    () => ({
      ...perf,
      hudEnabled,
      setHudEnabled,
      perfMonitorEnabled,
      setTourContext,
      getSnapshot,
    }),
    [perf, hudEnabled, setTourContext, getSnapshot],
  )

  return <LandingPerfContext.Provider value={value}>{children}</LandingPerfContext.Provider>
}

export function useLandingPerf() {
  const context = useContext(LandingPerfContext)
  if (!context) {
    throw new Error('useLandingPerf must be used within LandingPerfProvider')
  }
  return context
}

/** Sync Home perf HUD toggle into the shared perf context. */
export function useLandingPerfHudToggle(enabled) {
  const { setHudEnabled } = useLandingPerf()

  useEffect(() => {
    setHudEnabled(enabled)
  }, [enabled, setHudEnabled])
}
