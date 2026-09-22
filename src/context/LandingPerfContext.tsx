import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import useLandingVitals from '../hooks/useLandingVitals'
import usePerfMonitor, { type UsePerfMonitorReturn } from '../hooks/usePerfMonitor'
import { SHOW_PERF_HUD } from '../lib/landingFeatureFlags'
import type { TourContext } from '../lib/landingPerfReport'
import type { PerfSessionSnapshot } from '../lib/landingPerfMetrics'

export interface LandingPerfContextValue extends UsePerfMonitorReturn {
  hudEnabled: boolean
  setHudEnabled: (enabled: boolean) => void
  perfMonitorEnabled: boolean
  setTourContext: (context: TourContext) => void
  getSnapshot: () => PerfSessionSnapshot
}

const LandingPerfContext = createContext<LandingPerfContextValue | null>(null)

export interface LandingPerfProviderProps {
  children: ReactNode
}

export function LandingPerfProvider({ children }: LandingPerfProviderProps): React.JSX.Element {
  useLandingVitals()

  const tourContextRef = useRef<TourContext>({})
  const [hudEnabled, setHudEnabled] = useState(false)
  const perfMonitorEnabled = SHOW_PERF_HUD && hudEnabled
  const perf = usePerfMonitor(perfMonitorEnabled)

  const setTourContext = useCallback((context: TourContext) => {
    tourContextRef.current = context
  }, [])

  const getSnapshot = useCallback((): PerfSessionSnapshot => {
    return perf.getSessionSnapshot(tourContextRef.current)
  }, [perf])

  const value = useMemo<LandingPerfContextValue>(
    () => ({
      ...perf,
      hudEnabled,
      setHudEnabled,
      perfMonitorEnabled,
      setTourContext,
      getSnapshot,
    }),
    [perf, hudEnabled, perfMonitorEnabled, setTourContext, getSnapshot],
  )

  return <LandingPerfContext.Provider value={value}>{children}</LandingPerfContext.Provider>
}

export function useLandingPerf(): LandingPerfContextValue {
  const context = useContext(LandingPerfContext)
  if (!context) {
    throw new Error('useLandingPerf must be used within LandingPerfProvider')
  }
  return context
}

/** Sync Home perf HUD toggle into the shared perf context. */
export function useLandingPerfHudToggle(enabled: boolean): void {
  const { setHudEnabled } = useLandingPerf()

  useEffect(() => {
    setHudEnabled(enabled)
  }, [enabled, setHudEnabled])
}
