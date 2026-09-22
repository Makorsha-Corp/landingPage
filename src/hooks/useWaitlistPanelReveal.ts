import { useCallback, useEffect, useRef, useState } from 'react'
import { PANEL_REVEAL_DURATION_MS } from '../lib/waitlistFabMorph'
import type { WaitlistMorphPhase } from './useWaitlistFabMorph'

export interface UseWaitlistPanelRevealOptions {
  phase: WaitlistMorphPhase
  reducedMotion: boolean
  contentVisible: boolean
}

export interface UseWaitlistPanelRevealReturn {
  revealed: boolean
  isCovering: boolean
  startReveal: () => void
  startCover: (onComplete?: () => void) => void
}

export default function useWaitlistPanelReveal({
  phase,
  reducedMotion,
  contentVisible,
}: UseWaitlistPanelRevealOptions): UseWaitlistPanelRevealReturn {
  const [revealed, setRevealed] = useState(false)
  const [isCovering, setIsCovering] = useState(false)
  const coverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const coverCallbackRef = useRef<(() => void) | null>(null)

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
    (onComplete?: () => void) => {
      if (coverTimerRef.current) {
        clearTimeout(coverTimerRef.current)
        coverTimerRef.current = null
      }

      if (reducedMotion || !revealed) {
        onComplete?.()
        return
      }

      setIsCovering(true)
      setRevealed(false)
      coverCallbackRef.current = onComplete ?? null

      coverTimerRef.current = setTimeout(() => {
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
      if (coverTimerRef.current) clearTimeout(coverTimerRef.current)
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
