import { useEffect } from 'react'
import { startLandingVitalsObservers } from '../lib/landingVitalsStore'

/** Start LCP/CLS/INP/longtask observers once for the landing page session. */
export default function useLandingVitals() {
  useEffect(() => {
    startLandingVitalsObservers()
  }, [])
}
