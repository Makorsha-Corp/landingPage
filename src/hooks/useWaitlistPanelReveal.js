import { useCallback, useEffect, useRef, useState } from 'react'
import { PANEL_REVEAL_DURATION_MS } from '../lib/waitlistFabMorph'

export default function useWaitlistPanelReveal({ phase, reducedMotion, contentVisible }) {
  const [revealed, setRevealed] = useState(false)
  const [isCovering, setIsCovering] = useState(false)
  const coverTimerRef = useRef(null)
  const coverCallbackRef = useRef(null)

  useEffect(() => {
    if (reducedMotion || phase !== 'open') return undefined

    const frame = requestAnimationFrame(() => {
      setRevealed(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [phase, reducedMotion])

  const startReveal = useCallback(() => {
    if (!reducedMotion) {
      setRevealed(true)
    }
  }, [reducedMotion])

  const startCover = useCallback(
    (onComplete) => {
      if (coverTimerRef.current) {
        window.clearTimeout(coverTimerRef.current)
        coverTimerRef.current = null
      }

      if (reducedMotion || !revealed) {
        onComplete?.()
        return
      }

      setIsCovering(true)
      setRevealed(false)
      coverCallbackRef.current = onComplete

      coverTimerRef.current = window.setTimeout(() => {
        coverTimerRef.current = null
        setIsCovering(false)
        coverCallbackRef.current?.()
        coverCallbackRef.current = null
      }, PANEL_REVEAL_DURATION_MS)
    },
    [reducedMotion, revealed],
  )

  useEffect(
    () => () => {
      if (coverTimerRef.current) window.clearTimeout(coverTimerRef.current)
    },
    [],
  )

  const showRevealed = reducedMotion
    ? true
    : phase === 'idle' || !contentVisible
      ? false
      : revealed

  const showCovering = phase === 'idle' ? false : isCovering

  return {
    revealed: showRevealed,
    isCovering: showCovering,
    startReveal,
    startCover,
  }
}
