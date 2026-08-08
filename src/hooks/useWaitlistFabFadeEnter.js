import { useLayoutEffect, useRef, useState } from 'react'

/** Fade + slide up when desktop FAB appears after hero (no FLIP travel). */
export default function useWaitlistFabFadeEnter({
  enabled = true,
  reducedMotion = false,
  freezeTravel = false,
}) {
  const [useFadeEnter, setUseFadeEnter] = useState(false)
  const didEnterRef = useRef(false)

  useLayoutEffect(() => {
    if (!enabled) {
      if (!freezeTravel) {
        didEnterRef.current = false
      }
      setUseFadeEnter(false)
      return
    }

    if (reducedMotion || didEnterRef.current) return

    didEnterRef.current = true
    setUseFadeEnter(true)
  }, [enabled, freezeTravel, reducedMotion])

  return { useFadeEnter }
}
