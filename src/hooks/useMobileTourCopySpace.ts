import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react'

const GAP_PX = 12
const MIN_BOTTOM_INSET_PX = 16
const MEASURE_EPSILON_PX = 1

function readBottomInsetPx(): number {
  if (typeof document === 'undefined') return MIN_BOTTOM_INSET_PX

  const probe = document.createElement('div')
  probe.style.paddingBottom = 'max(1rem, env(safe-area-inset-bottom, 0px))'
  probe.style.visibility = 'hidden'
  probe.style.position = 'fixed'
  document.body.appendChild(probe)
  const px = probe.offsetHeight
  document.body.removeChild(probe)
  return Math.max(px, MIN_BOTTOM_INSET_PX)
}

export interface MobileTourCopySpace {
  availablePx: number
  sceneBottomPx: number
}

export interface UseMobileTourCopySpaceOptions {
  containerRef: RefObject<HTMLElement | null>
  stageRef: RefObject<HTMLElement | null>
  scrollerRef?: RefObject<HTMLElement | null>
  enabled?: boolean
}

export default function useMobileTourCopySpace({
  containerRef,
  stageRef,
  scrollerRef,
  enabled = true,
}: UseMobileTourCopySpaceOptions): MobileTourCopySpace {
  const [space, setSpace] = useState<MobileTourCopySpace>({ availablePx: 0, sceneBottomPx: 0 })
  const lastMeasuredRef = useRef<MobileTourCopySpace>({ availablePx: 0, sceneBottomPx: 0 })

  const measure = useCallback(() => {
    const containerEl = containerRef?.current
    const stageEl = stageRef?.current
    if (!enabled || !containerEl || !stageEl) return

    const sceneBottomPx = stageEl.getBoundingClientRect().bottom - containerEl.getBoundingClientRect().top
    const bottomInsetPx = readBottomInsetPx()
    const availablePx = Math.max(
      0,
      containerEl.clientHeight - sceneBottomPx - bottomInsetPx - GAP_PX,
    )

    const last = lastMeasuredRef.current
    if (
      Math.abs(last.availablePx - availablePx) < MEASURE_EPSILON_PX &&
      Math.abs(last.sceneBottomPx - sceneBottomPx) < MEASURE_EPSILON_PX
    ) {
      return
    }

    lastMeasuredRef.current = { availablePx, sceneBottomPx }
    setSpace({ availablePx, sceneBottomPx })
  }, [containerRef, stageRef, enabled])

  useLayoutEffect(() => {
    if (!enabled) return undefined

    measure()

    const containerEl = containerRef?.current
    const stageEl = stageRef?.current
    if (!containerEl || !stageEl) return undefined

    let settleRaf1 = 0
    let settleRaf2 = 0
    settleRaf1 = requestAnimationFrame(() => {
      measure()
      settleRaf2 = requestAnimationFrame(measure)
    })

    const observer = new ResizeObserver(measure)
    observer.observe(containerEl)
    observer.observe(stageEl)
    window.addEventListener('resize', measure)

    const scroller = scrollerRef?.current
    let scrollRaf = 0
    const onScroll = (): void => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        measure()
      })
    }
    scroller?.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(settleRaf1)
      cancelAnimationFrame(settleRaf2)
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
      observer.disconnect()
      window.removeEventListener('resize', measure)
      scroller?.removeEventListener('scroll', onScroll)
    }
  }, [containerRef, stageRef, scrollerRef, enabled, measure])

  return space
}
