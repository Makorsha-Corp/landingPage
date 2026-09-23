import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type TransitionEvent as ReactTransitionEvent,
} from 'react'
import {
  cloneRect,
  getSettledTriggerRect,
  getWaitlistModalTargetRect,
  isMorphShellTransitionProperty,
  MORPH_COLLAPSE_DURATION_MS,
  MORPH_EXPAND_DURATION_MS,
  type MorphRect,
} from '../lib/waitlistFabMorph'

export type WaitlistMorphPhase = 'idle' | 'morphIn' | 'open' | 'morphOut'

const CONTENT_REVEAL_RATIO = 0.7
const MORPH_COMPLETION_PROPERTY = 'width'

export interface UseWaitlistFabMorphOptions {
  open: boolean
  originRect: MorphRect | DOMRect | null
  reducedMotion: boolean
  onCloseComplete?: () => void
  getReturnFocusElement?: () => HTMLElement | null
}

export interface UseWaitlistFabMorphReturn {
  phase: WaitlistMorphPhase
  collapsed: boolean
  contentVisible: boolean
  useMorph: boolean
  isVisible: boolean
  storedOrigin: MorphRect | null
  targetRect: MorphRect
  startClose: () => void
  handleShellTransitionEnd: (event: ReactTransitionEvent<HTMLElement>) => void
}

export default function useWaitlistFabMorph({
  open,
  originRect,
  reducedMotion,
  onCloseComplete,
  getReturnFocusElement,
}: UseWaitlistFabMorphOptions): UseWaitlistFabMorphReturn {
  const [phase, setPhase] = useState<WaitlistMorphPhase>('idle')
  const [collapsed, setCollapsed] = useState(true)
  const [morphContentRevealed, setMorphContentRevealed] = useState(false)
  const [storedOrigin, setStoredOrigin] = useState<MorphRect | null>(null)
  const [targetRect, setTargetRect] = useState<MorphRect>(() => getWaitlistModalTargetRect())
  const [prevOpen, setPrevOpen] = useState(open)
  const prevOpenRef = useRef(open)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transitionHandledRef = useRef(false)

  const useMorph = Boolean(originRect) && !reducedMotion

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setStoredOrigin(cloneRect(originRect))
      setTargetRect(getWaitlistModalTargetRect())
      setMorphContentRevealed(false)

      if (!useMorph) {
        setPhase('open')
        setCollapsed(false)
      } else {
        setPhase('morphIn')
        setCollapsed(true)
      }
    }
  }

  useLayoutEffect(() => {
    if (open && !prevOpenRef.current) {
      transitionHandledRef.current = false
    }
    prevOpenRef.current = open
  }, [open])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    if (phase !== 'morphIn' || !collapsed || !useMorph) return undefined

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setCollapsed(false))
    })
    return () => cancelAnimationFrame(frame)
  }, [phase, collapsed, useMorph])

  useEffect(() => {
    if (contentTimerRef.current) {
      clearTimeout(contentTimerRef.current)
      contentTimerRef.current = null
    }

    if (phase === 'morphIn' && !collapsed && useMorph) {
      contentTimerRef.current = setTimeout(
        () => setMorphContentRevealed(true),
        Math.round(MORPH_EXPAND_DURATION_MS * CONTENT_REVEAL_RATIO),
      )
      return () => {
        if (contentTimerRef.current) clearTimeout(contentTimerRef.current)
      }
    }

    return undefined
  }, [phase, collapsed, useMorph])

  const contentVisible =
    phase === 'open' || (!useMorph && open) || (phase === 'morphIn' && morphContentRevealed)

  const finishClose = useCallback(() => {
    clearCloseTimer()
    if (contentTimerRef.current) {
      clearTimeout(contentTimerRef.current)
      contentTimerRef.current = null
    }
    transitionHandledRef.current = false
    setPhase('idle')
    setCollapsed(true)
    setMorphContentRevealed(false)
    setStoredOrigin(null)
    onCloseComplete?.()
  }, [clearCloseTimer, onCloseComplete])

  const handleShellTransitionEnd = useCallback(
    (event: ReactTransitionEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget) return
      if (event.propertyName !== MORPH_COMPLETION_PROPERTY) return
      if (!isMorphShellTransitionProperty(event.propertyName)) return
      if (transitionHandledRef.current) return

      if (phase === 'morphIn' && !collapsed) {
        transitionHandledRef.current = true
        setPhase('open')
        return
      }

      if (phase === 'morphOut' && collapsed) {
        transitionHandledRef.current = true
        finishClose()
      }
    },
    [phase, collapsed, finishClose],
  )

  const startClose = useCallback(() => {
    if (!useMorph || phase !== 'open') {
      finishClose()
      return
    }

    const focusEl = getReturnFocusElement?.()
    const settledOrigin = focusEl ? getSettledTriggerRect(focusEl) : null
    if (settledOrigin) {
      setStoredOrigin(settledOrigin)
      setTargetRect(getWaitlistModalTargetRect())
    }

    transitionHandledRef.current = false
    setPhase('morphOut')
    setMorphContentRevealed(false)
    setCollapsed(false)

    clearCloseTimer()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setCollapsed(true))
    })

    closeTimerRef.current = setTimeout(finishClose, MORPH_COLLAPSE_DURATION_MS + 120)
  }, [useMorph, phase, finishClose, getReturnFocusElement, clearCloseTimer])

  useEffect(
    () => () => {
      clearCloseTimer()
      if (contentTimerRef.current) clearTimeout(contentTimerRef.current)
    },
    [clearCloseTimer],
  )

  const isVisible = open || phase === 'morphOut'

  return {
    phase,
    collapsed,
    contentVisible,
    useMorph,
    isVisible,
    storedOrigin,
    targetRect,
    startClose,
    handleShellTransitionEnd,
  }
}
