import { useLayoutEffect, useRef, useState, type RefObject, type CSSProperties } from 'react'
import { PANEL_REVEAL_DURATION_MS, PANEL_REVEAL_EASING } from '../lib/waitlistFabMorph'

function measureCenterOffset(panelEl: HTMLElement, columnEl: HTMLElement): number {
  if (!panelEl || !columnEl) return 0
  return Math.max(0, (panelEl.clientWidth - columnEl.offsetWidth) / 2)
}

export interface UseWaitlistColumnShiftOptions {
  centered: boolean
  reducedMotion: boolean
  enabled?: boolean
  panelRef?: RefObject<HTMLElement | null>
  columnRef?: RefObject<HTMLElement | null>
}

export interface UseWaitlistColumnShiftReturn {
  columnStyle: CSSProperties | undefined
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
}: UseWaitlistColumnShiftOptions): UseWaitlistColumnShiftReturn {
  const [shiftX, setShiftX] = useState(0)
  const [transitionEnabled, setTransitionEnabled] = useState(false)
  const centeredOffsetRef = useRef(0)
  const generationRef = useRef(0)

  useLayoutEffect(() => {
    if (!enabled || reducedMotion || centered) {
      if (centered) {
        const panelEl = panelRef?.current
        const columnEl = columnRef?.current
        if (panelEl && columnEl) {
          centeredOffsetRef.current = measureCenterOffset(panelEl, columnEl)
        }
      }
      return undefined
    }

    const panelEl = panelRef?.current
    const columnEl = columnRef?.current
    if (!panelEl || !columnEl) return undefined

    const generation = generationRef.current + 1
    generationRef.current = generation
    const startOffset = centeredOffsetRef.current

    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      if (generationRef.current !== generation) return
      setTransitionEnabled(false)
      setShiftX(startOffset)

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

    const update = (): void => {
      centeredOffsetRef.current = measureCenterOffset(panelEl, columnEl)
    }

    const observer = new ResizeObserver(update)
    observer.observe(panelEl)
    observer.observe(columnEl)
    return () => observer.disconnect()
  }, [centered, enabled, reducedMotion, panelRef, columnRef])

  const effectiveShiftX = !enabled || reducedMotion || centered ? 0 : shiftX
  const effectiveTransitionEnabled = enabled && !reducedMotion && !centered && transitionEnabled

  const columnStyle: CSSProperties | undefined =
    !enabled || reducedMotion
      ? undefined
      : {
          transform: `translate3d(${effectiveShiftX}px, 0, 0)`,
          transition: effectiveTransitionEnabled
            ? `transform ${PANEL_REVEAL_DURATION_MS}ms ${PANEL_REVEAL_EASING}`
            : 'none',
        }

  return { columnStyle }
}
