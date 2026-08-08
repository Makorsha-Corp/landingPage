import { useLayoutEffect, useRef, useState } from 'react'
import { PANEL_REVEAL_DURATION_MS, PANEL_REVEAL_EASING } from '../lib/waitlistFabMorph'

function measureCenterOffset(panelEl, columnEl) {
  if (!panelEl || !columnEl) return 0
  return Math.max(0, (panelEl.clientWidth - columnEl.offsetWidth) / 2)
}

/**
 * Horizontal slide for waitlist brand column: centered on cover → flush left on reveal.
 * Stores centered offset while covered; animates via transform when panel aligns left.
 */
export default function useWaitlistColumnShift({
  centered,
  reducedMotion,
  enabled = true,
  panelRef,
  columnRef,
}) {
  const [shiftX, setShiftX] = useState(0)
  const [transitionEnabled, setTransitionEnabled] = useState(false)
  const centeredOffsetRef = useRef(0)
  const generationRef = useRef(0)

  useLayoutEffect(() => {
    if (!enabled || reducedMotion) {
      setShiftX(0)
      setTransitionEnabled(false)
      return
    }

    const panelEl = panelRef?.current
    const columnEl = columnRef?.current
    if (!panelEl || !columnEl) return

    if (centered) {
      centeredOffsetRef.current = measureCenterOffset(panelEl, columnEl)
      setTransitionEnabled(false)
      setShiftX(0)
      return
    }

    const generation = generationRef.current + 1
    generationRef.current = generation
    const startOffset = centeredOffsetRef.current

    setShiftX(startOffset)
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (generationRef.current !== generation) return
        setTransitionEnabled(true)
        setShiftX(0)
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [centered, enabled, reducedMotion, panelRef, columnRef])

  useLayoutEffect(() => {
    if (!enabled || reducedMotion || !centered) return undefined

    const panelEl = panelRef?.current
    const columnEl = columnRef?.current
    if (!panelEl || !columnEl) return undefined

    const update = () => {
      centeredOffsetRef.current = measureCenterOffset(panelEl, columnEl)
    }

    const observer = new ResizeObserver(update)
    observer.observe(panelEl)
    observer.observe(columnEl)
    return () => observer.disconnect()
  }, [centered, enabled, reducedMotion, panelRef, columnRef])

  const columnStyle =
    !enabled || reducedMotion
      ? undefined
      : {
          transform: `translate3d(${shiftX}px, 0, 0)`,
          transition: transitionEnabled
            ? `transform ${PANEL_REVEAL_DURATION_MS}ms ${PANEL_REVEAL_EASING}`
            : 'none',
        }

  return { columnStyle }
}
