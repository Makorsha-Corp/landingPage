import { useState } from 'react'

/** Fade + slide up when desktop FAB appears after hero (no FLIP travel). */
export default function useWaitlistFabFadeEnter({
  enabled = true,
  reducedMotion = false,
  freezeTravel = false,
}) {
  const [entered, setEntered] = useState(false)

  if (enabled && !reducedMotion && !entered) {
    setEntered(true)
  }

  if (!enabled && !freezeTravel && entered) {
    setEntered(false)
  }

  return { useFadeEnter: enabled && entered }
}
