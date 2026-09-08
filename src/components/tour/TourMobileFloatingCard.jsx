import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import useMobileTourCopySpace from '../../hooks/useMobileTourCopySpace'
import {
  getTourStoryCardShellClasses,
  getTourStoryCardTextClasses,
} from '../../lib/heroCardStyles'
import TourMobileCondensedBody from './TourMobileCondensedBody'
import TourMobileProgressDots from './TourMobileProgressDots'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/** Collapsed strip: title row + chevron + hint of body. */
const MOBILE_PEEK_HEIGHT_PX = 168

function TourMobileFloatingCardBody({
  stop,
  theme,
  activeIndex,
  stopCount,
  containerRef,
  stageRef,
  copyRef,
  scrollDrivenEnter = false,
}) {
  const { availablePx } = useMobileTourCopySpace(containerRef, stageRef)
  const glassCls = getTourStoryCardShellClasses(theme)
  const { title: titleCls, desc: descCls } = getTourStoryCardTextClasses(theme)

  const contentRef = useRef(null)
  const pointerStartRef = useRef(null)
  const liftStartRef = useRef(0)
  const dragGestureRef = useRef(false)
  const suppressClickRef = useRef(false)

  const [contentHeight, setContentHeight] = useState(0)
  const [liftPx, setLiftPx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // availablePx = max expand ceiling (stay below building); peek = fixed collapsed strip.
  const expandCeilingPx =
    availablePx > 0 ? availablePx : contentHeight > 0 ? contentHeight : MOBILE_PEEK_HEIGHT_PX
  const peekHeightPx = Math.min(MOBILE_PEEK_HEIGHT_PX, expandCeilingPx)
  const expandedCapPx = Math.min(contentHeight, expandCeilingPx)
  const maxLiftPx = Math.max(0, expandedCapPx - peekHeightPx)
  const canLift = maxLiftPx > 0
  const effectiveLiftPx = clamp(liftPx, 0, maxLiftPx)
  const visibleHeight =
    contentHeight > 0
      ? Math.min(expandedCapPx, peekHeightPx + effectiveLiftPx)
      : peekHeightPx
  const isFullyLifted = canLift && effectiveLiftPx >= maxLiftPx - 2
  const showLiftChevron = canLift && !isFullyLifted

  const toggleLift = useCallback(() => {
    if (!canLift) return
    setLiftPx(isFullyLifted ? 0 : maxLiftPx)
  }, [canLift, isFullyLifted, maxLiftPx])

  const handleToggleClick = useCallback(
    (event) => {
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
    setContentHeight(el.offsetHeight)
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

  const handlePointerDown = (event) => {
    if (!canLift) return
    if (event.target.closest('[data-tour-mobile-no-drag]')) return
    pointerStartRef.current = {
      y: event.clientY,
      id: event.pointerId,
      toggleTarget: Boolean(event.target.closest('[data-tour-mobile-toggle]')),
    }
    liftStartRef.current = effectiveLiftPx
    dragGestureRef.current = false
    suppressClickRef.current = false
    setIsDragging(true)
  }

  const handlePointerMove = (event) => {
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

  const handlePointerEnd = (event) => {
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

  const handleWheel = (event) => {
    if (!canLift) return
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
      <div ref={copyRef} style={{ opacity: 0, willChange: 'opacity, transform' }}>
        <div
          ref={contentRef}
          className={`px-4 pb-4 pt-4 ${dragSurfaceCls}`}
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
        <div className="mt-2">
          <TourMobileCondensedBody stop={stop} descCls={descCls} />
        </div>
        </div>
      </div>
    </div>
  )
}

const MemoTourMobileFloatingCardBody = memo(TourMobileFloatingCardBody)

// Copy opacity starts at 0; glass shell stays at opacity 1 so backdrop-blur compositing works.
function TourMobileFloatingCard({ wrapRef, copyRef, scrollDrivenEnter = true, ...props }) {
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
