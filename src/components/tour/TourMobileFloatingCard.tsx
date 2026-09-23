import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent, MouseEvent as ReactMouseEvent } from 'react'
import useMobileTourCopySpace from '../../hooks/useMobileTourCopySpace'
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
/** Minimum expand travel on tap/drag — avoids chevron vanishing with ~0px lift. */
const MIN_MEANINGFUL_LIFT_PX = 64

interface MobileCardLiftMetrics {
  expandCeilingPx: number
  peekHeightPx: number
  expandedCapPx: number
  maxLiftPx: number
  canLift: boolean
}

function computeMobileCardLiftMetrics(
  contentHeight: number,
  availablePx: number,
): MobileCardLiftMetrics {
  const reliableAvailablePx =
    availablePx >= MOBILE_PEEK_HEIGHT_PX
      ? availablePx
      : contentHeight > 0
        ? contentHeight
        : MOBILE_PEEK_HEIGHT_PX
  const expandCeilingPx =
    availablePx > 0 ? reliableAvailablePx : contentHeight > 0 ? contentHeight : MOBILE_PEEK_HEIGHT_PX
  const expandedCapPx =
    contentHeight > 0 ? Math.min(contentHeight, expandCeilingPx) : expandCeilingPx

  let peekHeightPx = Math.min(MOBILE_PEEK_HEIGHT_PX, expandedCapPx)
  let maxLiftPx = Math.max(0, expandedCapPx - peekHeightPx)

  if (maxLiftPx > 0 && maxLiftPx < MIN_MEANINGFUL_LIFT_PX) {
    peekHeightPx = Math.min(
      MOBILE_PEEK_HEIGHT_PX,
      expandedCapPx,
      Math.max(Math.floor(expandedCapPx * 0.38), expandedCapPx - MIN_MEANINGFUL_LIFT_PX),
    )
    maxLiftPx = Math.max(0, expandedCapPx - peekHeightPx)
  }

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
  stageRef: RefObject<HTMLElement | null>
  scrollerRef: RefObject<HTMLElement | null>
  copyRef: RefObject<HTMLDivElement | null>
  scrollDrivenEnter?: boolean
}

function TourMobileFloatingCardBody({
  stop,
  theme,
  activeIndex,
  stopCount,
  containerRef,
  stageRef,
  scrollerRef,
  copyRef,
  scrollDrivenEnter = false,
}: TourMobileFloatingCardBodyProps) {
  const { availablePx } = useMobileTourCopySpace({ containerRef, stageRef, scrollerRef })
  const glassCls = getTourStoryCardShellClasses(theme)
  const { title: titleCls, desc: descCls } = getTourStoryCardTextClasses(theme)

  const contentRef = useRef<HTMLDivElement>(null)
  const dragSurfaceRef = useRef<HTMLDivElement>(null)
  const pointerStartRef = useRef<PointerStart | null>(null)
  const liftStartRef = useRef<number>(0)
  const dragGestureRef = useRef<boolean>(false)
  const suppressClickRef = useRef<boolean>(false)

  const [contentHeight, setContentHeight] = useState(0)
  const [liftPx, setLiftPx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const { peekHeightPx, expandedCapPx, maxLiftPx, canLift } = computeMobileCardLiftMetrics(
    contentHeight,
    availablePx,
  )
  const effectiveLiftPx = clamp(liftPx, 0, maxLiftPx)
  const visibleHeight =
    contentHeight > 0
      ? Math.min(expandedCapPx, peekHeightPx + effectiveLiftPx)
      : peekHeightPx
  const isFullyLifted = canLift && effectiveLiftPx >= maxLiftPx - 2
  const showLiftChevron = canLift && !isFullyLifted
  const isContentClipped = contentHeight > expandedCapPx + 2
  const needsBodyScroll = isFullyLifted && isContentClipped

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
    setContentHeight(Math.max(el.offsetHeight, el.scrollHeight))
  }, [])

  useLayoutEffect(() => {
    measureContent()
    const el = contentRef.current
    if (!el) return undefined

    const observer = new ResizeObserver(measureContent)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measureContent, stop.id])

  useEffect(() => {
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
    if (!canLift || needsBodyScroll) return
    event.preventDefault()
    setLiftPx((prev) => clamp(prev - event.deltaY, 0, maxLiftPx))
  }

  const liftTransition =
    canLift && !isDragging ? 'max-height 280ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
  const dragSurfaceCls = canLift ? 'touch-none cursor-grab active:cursor-grabbing' : ''

  return (
    <div
      className={`${scrollDrivenEnter ? '' : 'animate-tour-mobile-copy-in'} tour-glass-shell isolate pointer-events-auto flex flex-col overflow-hidden rounded-2xl ${glassCls}`}
      style={{
        marginBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
        maxHeight: visibleHeight > 0 ? `${visibleHeight}px` : undefined,
        transition: liftTransition,
      }}
      onWheel={handleWheel}
    >
      <div ref={copyRef} className="flex min-h-0 flex-1 flex-col" style={{ opacity: 0, willChange: 'opacity, transform' }}>
        <div ref={contentRef} className="flex min-h-0 flex-1 flex-col">
          <div
            ref={dragSurfaceRef}
            className={`shrink-0 px-4 pt-4 ${dragSurfaceCls}`}
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
          <div
            className={`px-4 pb-4 pt-2 ${needsBodyScroll ? 'min-h-0 flex-1 overflow-y-auto overscroll-y-contain' : ''}`}
          >
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
  stageRef: RefObject<HTMLElement | null>
  scrollerRef: RefObject<HTMLElement | null>
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
