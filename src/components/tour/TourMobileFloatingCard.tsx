import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent, MouseEvent as ReactMouseEvent } from 'react'
import {
  getTourStoryCardShellClasses,
  getTourStoryCardTextClasses,
} from '../../lib/heroCardStyles'
import TourMobileCondensedBody from './TourMobileCondensedBody'
import TourMobileProgressDots from './TourMobileProgressDots'
import type { StoryCopyStop } from './tourStoryTypes'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Collapsed strip: title row + chevron + hint of body. */
const MOBILE_PEEK_HEIGHT_PX = 168
const CONTENT_HEIGHT_EPSILON_PX = 2
/** Gap between card bottom margin and viewport edge (matches card marginBottom intent). */
const VIEWPORT_EXPAND_GAP_PX = 12
const MIN_BOTTOM_INSET_PX = 16

function readBottomInsetPx(): number {
  if (typeof document === 'undefined') return MIN_BOTTOM_INSET_PX

  const probe = document.createElement('div')
  probe.style.paddingBottom = 'max(0.75rem, env(safe-area-inset-bottom, 0px))'
  probe.style.visibility = 'hidden'
  probe.style.position = 'fixed'
  document.body.appendChild(probe)
  const px = probe.offsetHeight
  document.body.removeChild(probe)
  return Math.max(px, MIN_BOTTOM_INSET_PX)
}

function computeViewportExpandCap(containerHeightPx: number): number {
  if (containerHeightPx <= 0) return 0
  return Math.max(0, containerHeightPx - readBottomInsetPx() - VIEWPORT_EXPAND_GAP_PX)
}

interface MobileCardLiftMetrics {
  expandCeilingPx: number
  peekHeightPx: number
  expandedCapPx: number
  maxLiftPx: number
  canLift: boolean
}

/** Max open height = min(copy, sticky tour viewport). Independent of camera transform. */
function computeMobileCardLiftMetrics(
  contentHeight: number,
  viewportExpandCapPx: number,
): MobileCardLiftMetrics {
  const expandCeilingPx =
    viewportExpandCapPx > 0
      ? viewportExpandCapPx
      : contentHeight > 0
        ? contentHeight
        : MOBILE_PEEK_HEIGHT_PX
  const expandedCapPx =
    contentHeight > 0 ? Math.min(contentHeight, expandCeilingPx) : expandCeilingPx
  const peekHeightPx = Math.min(MOBILE_PEEK_HEIGHT_PX, expandedCapPx)
  const maxLiftPx = Math.max(0, expandedCapPx - peekHeightPx)

  return {
    expandCeilingPx,
    peekHeightPx,
    expandedCapPx,
    maxLiftPx,
    canLift: maxLiftPx > 0,
  }
}

interface PointerStart {
  y: number
  id: number
  toggleTarget: boolean
}

interface TourMobileFloatingCardBodyProps {
  stop: StoryCopyStop
  theme: string
  activeIndex: number
  stopCount: number
  containerRef: RefObject<HTMLElement | null>
  copyRef: RefObject<HTMLDivElement | null>
  scrollDrivenEnter?: boolean
}

function TourMobileFloatingCardBody({
  stop,
  theme,
  activeIndex,
  stopCount,
  containerRef,
  copyRef,
  scrollDrivenEnter = false,
}: TourMobileFloatingCardBodyProps) {
  const glassCls = getTourStoryCardShellClasses(theme)
  const { title: titleCls, desc: descCls } = getTourStoryCardTextClasses(theme)

  const contentRef = useRef<HTMLDivElement>(null)
  const dragSurfaceRef = useRef<HTMLDivElement>(null)
  const lastContentHeightRef = useRef(0)
  const lastViewportCapRef = useRef(0)
  const pointerStartRef = useRef<PointerStart | null>(null)
  const liftStartRef = useRef<number>(0)
  const dragGestureRef = useRef<boolean>(false)
  const suppressClickRef = useRef<boolean>(false)

  const [contentHeight, setContentHeight] = useState(0)
  const [viewportExpandCapPx, setViewportExpandCapPx] = useState(0)
  const [liftPx, setLiftPx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const { peekHeightPx, expandedCapPx, maxLiftPx, canLift } = computeMobileCardLiftMetrics(
    contentHeight,
    viewportExpandCapPx,
  )
  const effectiveLiftPx = clamp(liftPx, 0, maxLiftPx)
  const visibleHeight =
    contentHeight > 0
      ? Math.min(expandedCapPx, peekHeightPx + effectiveLiftPx)
      : peekHeightPx
  const isFullyLifted = canLift && effectiveLiftPx >= maxLiftPx - 2
  const showLiftChevron = canLift && !isFullyLifted
  const isContentClipped = contentHeight > expandedCapPx + CONTENT_HEIGHT_EPSILON_PX
  const needsShellScroll = isFullyLifted && isContentClipped

  const measureViewportCap = useCallback(() => {
    const containerEl = containerRef?.current
    if (!containerEl) return
    const next = computeViewportExpandCap(containerEl.clientHeight)
    if (Math.abs(next - lastViewportCapRef.current) < CONTENT_HEIGHT_EPSILON_PX) return
    lastViewportCapRef.current = next
    setViewportExpandCapPx(next)
  }, [containerRef])

  const toggleLift = useCallback(() => {
    if (!canLift) return
    setLiftPx(isFullyLifted ? 0 : maxLiftPx)
  }, [canLift, isFullyLifted, maxLiftPx])

  const handleToggleClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false
        return
      }
      if (event.detail === 0) {
        toggleLift()
      }
    },
    [toggleLift],
  )

  const DRAG_CLICK_THRESHOLD_PX = 8

  const measureContent = useCallback(() => {
    const el = contentRef.current
    if (!el) return
    const next = el.scrollHeight
    if (Math.abs(next - lastContentHeightRef.current) < CONTENT_HEIGHT_EPSILON_PX) return
    lastContentHeightRef.current = next
    setContentHeight(next)
  }, [])

  useLayoutEffect(() => {
    measureViewportCap()
    const containerEl = containerRef?.current
    if (!containerEl) return undefined

    const observer = new ResizeObserver(measureViewportCap)
    observer.observe(containerEl)
    window.addEventListener('resize', measureViewportCap)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measureViewportCap)
    }
  }, [containerRef, measureViewportCap])

  useLayoutEffect(() => {
    measureContent()
    const el = contentRef.current
    if (!el) return undefined

    const observer = new ResizeObserver(measureContent)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measureContent, stop.id])

  useEffect(() => {
    lastContentHeightRef.current = 0
    setLiftPx(0)
  }, [stop.id])

  useEffect(() => {
    return () => {
      const surface = dragSurfaceRef.current
      const start = pointerStartRef.current
      if (surface && start && surface.hasPointerCapture(start.id)) {
        surface.releasePointerCapture(start.id)
      }
      pointerStartRef.current = null
      dragGestureRef.current = false
      suppressClickRef.current = false
    }
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canLift) return
    const target = event.target as HTMLElement
    if (target.closest('[data-tour-mobile-no-drag]')) return
    pointerStartRef.current = {
      y: event.clientY,
      id: event.pointerId,
      toggleTarget: Boolean(target.closest('[data-tour-mobile-toggle]')),
    }
    liftStartRef.current = effectiveLiftPx
    dragGestureRef.current = false
    suppressClickRef.current = false
    setIsDragging(true)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current
    if (!start || start.id !== event.pointerId) return

    const dy = start.y - event.clientY
    if (Math.abs(dy) <= DRAG_CLICK_THRESHOLD_PX) return

    if (!dragGestureRef.current) {
      dragGestureRef.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    setLiftPx(clamp(liftStartRef.current + dy, 0, maxLiftPx))
    event.preventDefault()
  }

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current
    pointerStartRef.current = null
    setIsDragging(false)

    if (!start || start.id !== event.pointerId) return

    const dy = Math.abs(start.y - event.clientY)
    const wasTap = !dragGestureRef.current && dy <= DRAG_CLICK_THRESHOLD_PX
    if (wasTap && start.toggleTarget) {
      suppressClickRef.current = true
      toggleLift()
    }

    dragGestureRef.current = false

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!canLift || needsShellScroll) return
    event.preventDefault()
    setLiftPx((prev) => clamp(prev - event.deltaY, 0, maxLiftPx))
  }

  const liftTransition =
    canLift && !isDragging ? 'max-height 280ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
  const dragSurfaceCls = canLift ? 'touch-none cursor-grab active:cursor-grabbing' : ''
  const shellOverflowCls = needsShellScroll
    ? 'overflow-y-auto overscroll-y-contain'
    : 'overflow-hidden'

  return (
    <div
      className={`${scrollDrivenEnter ? '' : 'animate-tour-mobile-copy-in'} tour-glass-shell isolate pointer-events-auto rounded-2xl ${shellOverflowCls} ${glassCls}`}
      style={{
        marginBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
        maxHeight: visibleHeight > 0 ? `${visibleHeight}px` : undefined,
        transition: liftTransition,
      }}
      onWheel={handleWheel}
    >
      <div ref={copyRef} style={{ opacity: 0, willChange: 'opacity, transform' }}>
        <div ref={contentRef}>
          <div
            ref={dragSurfaceRef}
            className={`px-4 pt-4 ${dragSurfaceCls}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-1">
                {canLift ? (
                  <button
                    type="button"
                    data-tour-mobile-toggle
                    onClick={handleToggleClick}
                    aria-expanded={isFullyLifted}
                    aria-label={isFullyLifted ? 'Show less' : 'Show more'}
                    className={`min-w-0 text-left text-xl font-bold leading-snug tracking-tight ${titleCls}`}
                  >
                    {stop.title}
                  </button>
                ) : (
                  <h2 className={`min-w-0 text-xl font-bold leading-snug tracking-tight ${titleCls}`}>
                    {stop.title}
                  </h2>
                )}
                {showLiftChevron ? (
                  <button
                    type="button"
                    aria-label="Show more"
                    data-tour-mobile-toggle
                    onClick={handleToggleClick}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 animate-bounce"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                ) : null}
              </div>
              <div className="shrink-0 self-center" data-tour-mobile-no-drag>
                <TourMobileProgressDots count={stopCount} activeIndex={activeIndex} />
              </div>
            </div>
          </div>
          <div className="mt-2 px-4 pb-4">
            <TourMobileCondensedBody stop={stop} descCls={descCls} />
          </div>
        </div>
      </div>
    </div>
  )
}

const MemoTourMobileFloatingCardBody = memo(TourMobileFloatingCardBody)

interface TourMobileFloatingCardProps {
  wrapRef: RefObject<HTMLDivElement | null>
  copyRef: RefObject<HTMLDivElement | null>
  scrollDrivenEnter?: boolean
  stop: StoryCopyStop
  theme: string
  activeIndex: number
  stopCount: number
  containerRef: RefObject<HTMLElement | null>
}

// Copy opacity starts at 0; glass shell stays at opacity 1 so backdrop-blur compositing works.
function TourMobileFloatingCard({ wrapRef, copyRef, scrollDrivenEnter = true, ...props }: TourMobileFloatingCardProps) {
  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-x-3 bottom-0 z-20 will-change-transform md:hidden"
    >
      <MemoTourMobileFloatingCardBody
        {...props}
        copyRef={copyRef}
        scrollDrivenEnter={scrollDrivenEnter}
      />
    </div>
  )
}

export default memo(TourMobileFloatingCard)
