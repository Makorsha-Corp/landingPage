import { useCallback, useEffect, useRef, useState } from 'react'
import { PANEL_REVEAL_DURATION_MS } from '../lib/waitlistFabMorph'

export default function useWaitlistPanelReveal({ phase, reducedMotion, contentVisible }) {
  const [revealed, setRevealed] = useState(() => reducedMotion)
  const [isCovering, setIsCovering] = useState(false)
  const coverTimerRef = useRef(null)
  const coverCallbackRef = useRef(null)

  useEffect(() => {
    if (reducedMotion) {
      setRevealed(true)
      return
    }

    if (!contentVisible) {
      setRevealed(false)
      setIsCovering(false)
    }
  }, [contentVisible, reducedMotion])

  useEffect(() => {
    if (reducedMotion || phase !== 'open') return undefined

    const frame = requestAnimationFrame(() => {
      setRevealed(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [phase, reducedMotion])

  useEffect(() => {
    if (phase !== 'idle') return undefined
    setRevealed(reducedMotion)
    setIsCovering(false)
    return undefined
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

  return {
    revealed: reducedMotion ? true : revealed,
    isCovering,
    startReveal,
    startCover,
  }
}
