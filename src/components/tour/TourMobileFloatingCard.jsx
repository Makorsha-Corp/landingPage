import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import useMobileTourCopySpace from '../../hooks/useMobileTourCopySpace'
import { getStoryCardStyles } from '../../lib/storyCardStyles'
import TourMobileCondensedBody from './TourMobileCondensedBody'
import TourMobileProgressDots from './TourMobileProgressDots'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function TourMobileFloatingCardBody({
  stop,
  theme,
  activeIndex,
  stopCount,
  containerRef,
  stageRef,
}) {
  const { availablePx } = useMobileTourCopySpace(containerRef, stageRef)
  const { card: cardCls, title: titleCls, desc: descCls } = getStoryCardStyles(theme)

  const contentRef = useRef(null)
  const pointerStartRef = useRef(null)
  const liftStartRef = useRef(0)

  const [contentHeight, setContentHeight] = useState(0)
  const [liftPx, setLiftPx] = useState(0)

  const peekHeight = availablePx > 0 ? availablePx : contentHeight
  const maxLiftPx = Math.max(0, contentHeight - peekHeight)
  const canLift = maxLiftPx > 0
  const effectiveLiftPx = clamp(liftPx, 0, maxLiftPx)
  const visibleHeight = canLift
    ? Math.min(contentHeight, peekHeight + effectiveLiftPx)
    : contentHeight
  const isFullyLifted = canLift && effectiveLiftPx >= maxLiftPx - 2
  const showLiftChevron = canLift && !isFullyLifted

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

  const handlePointerDown = (event) => {
    if (!canLift) return
    pointerStartRef.current = { y: event.clientY, id: event.pointerId }
    liftStartRef.current = effectiveLiftPx
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const start = pointerStartRef.current
    if (!start || start.id !== event.pointerId) return

    const dy = start.y - event.clientY
    setLiftPx(clamp(liftStartRef.current + dy, 0, maxLiftPx))
    event.preventDefault()
  }

  const handlePointerEnd = (event) => {
    const start = pointerStartRef.current
    if (!start || start.id !== event.pointerId) return

    pointerStartRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleWheel = (event) => {
    if (!canLift) return
    event.preventDefault()
    setLiftPx((prev) => clamp(prev - event.deltaY, 0, maxLiftPx))
  }

  return (
    <div
      className={`animate-tour-mobile-copy-in pointer-events-auto flex touch-none flex-col overflow-hidden rounded-2xl border shadow-2xl ${cardCls} ${
        canLift ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{
        marginBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
        transform: `translate3d(0, ${-effectiveLiftPx}px, 0)`,
        maxHeight: visibleHeight > 0 ? `${visibleHeight}px` : undefined,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onWheel={handleWheel}
    >
      <div ref={contentRef} className="px-4 pb-4 pt-4">
        <div className="flex items-center gap-2">
          {showLiftChevron ? (
            <svg
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 animate-bounce ${descCls}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          ) : null}
          <h2 className={`min-w-0 flex-1 text-xl font-bold leading-snug tracking-tight ${titleCls}`}>
            {stop.title}
          </h2>
          <div className="shrink-0 self-center">
            <TourMobileProgressDots count={stopCount} activeIndex={activeIndex} />
          </div>
        </div>
        <div className="mt-2">
          <TourMobileCondensedBody stop={stop} descCls={descCls} />
        </div>
      </div>
    </div>
  )
}

export default function TourMobileFloatingCard(props) {
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-0 z-20 md:hidden">
      <TourMobileFloatingCardBody key={props.stop.id} {...props} />
    </div>
  )
}
