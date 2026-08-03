import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getStoryCardStyles } from '../../lib/storyCardStyles'
import DrawerGrabHandle from './DrawerGrabHandle'

const SWIPE_OPEN_PX = 48
const SWIPE_DISMISS_PX = 80
const SHEET_DURATION_MS = 380
const SHEET_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'
const PEEK_FALLBACK_PX = 156
const EXPANDED_VH = 0.85
const PEEK_MAX_VH = 0.55
const BODY_TOP_PX = 12
const CONTENT_END_GAP_PX = 16

export default function TourMobileStopDrawer({
  peekStop,
  expandedStop,
  theme,
  scrollerRef,
  reducedMotion = false,
  peekVisible = false,
  isOpen = false,
  onOpen,
  onClose,
}) {
  const sheetRef = useRef(null)
  const headerRef = useRef(null)
  const bodyRef = useRef(null)
  const contentMeasureRef = useRef(null)
  const returnFocusRef = useRef(null)
  const pointerStartRef = useRef(null)
  const expandedStopRef = useRef(null)

  const [peekHeightPx, setPeekHeightPx] = useState(PEEK_FALLBACK_PX)
  const [expandedHeightPx, setExpandedHeightPx] = useState(PEEK_FALLBACK_PX)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [revealPoints, setRevealPoints] = useState(false)

  if (expandedStop) expandedStopRef.current = expandedStop

  const expandedCapPx = Math.round(
    typeof window !== 'undefined' ? window.innerHeight * EXPANDED_VH : 640,
  )
  const peekCapPx = Math.round(
    typeof window !== 'undefined' ? window.innerHeight * PEEK_MAX_VH : 420,
  )

  const resolvedExpandedStop = expandedStop ?? expandedStopRef.current
  const displayStop = peekStop ?? resolvedExpandedStop
  const showDrawer = Boolean(displayStop) && (peekVisible || isOpen || revealPoints)

  const hasPoints = Boolean(displayStop?.points?.length)
  const canExpand = hasPoints

  const collapsingByDrag = isOpen && isDragging && dragOffset > 24
  const showPoints = canExpand && ((isOpen && !collapsingByDrag) || (revealPoints && !isOpen))

  const readBottomInsetPx = useCallback(() => {
    if (typeof document === 'undefined') return CONTENT_END_GAP_PX
    const probe = document.createElement('div')
    probe.style.paddingBottom = 'max(1rem, env(safe-area-inset-bottom, 0px))'
    probe.style.visibility = 'hidden'
    probe.style.position = 'fixed'
    document.body.appendChild(probe)
    const px = probe.offsetHeight
    document.body.removeChild(probe)
    return Math.max(px, CONTENT_END_GAP_PX)
  }, [])

  const measurePeekHeight = useCallback(() => {
    const headerH = headerRef.current?.offsetHeight ?? 0
    const contentH = contentMeasureRef.current?.scrollHeight ?? 0
    const bottomInset = readBottomInsetPx()
    return Math.min(
      Math.max(headerH + BODY_TOP_PX + contentH + bottomInset, PEEK_FALLBACK_PX),
      peekCapPx,
    )
  }, [peekCapPx, readBottomInsetPx])

  const measureExpandedHeight = useCallback(() => {
    const headerH = headerRef.current?.offsetHeight ?? 0
    const contentH = contentMeasureRef.current?.scrollHeight ?? 0
    const bottomInset = readBottomInsetPx()
    return Math.min(headerH + BODY_TOP_PX + contentH + bottomInset + 4, expandedCapPx)
  }, [expandedCapPx, readBottomInsetPx])

  useLayoutEffect(() => {
    if (!showDrawer) return
    setPeekHeightPx(measurePeekHeight())

    if (canExpand && showPoints && !isDragging) {
      setExpandedHeightPx(Math.max(measureExpandedHeight(), measurePeekHeight()))
    } else if (canExpand) {
      setExpandedHeightPx(measurePeekHeight())
    }
  }, [
    showDrawer,
    showPoints,
    isOpen,
    isDragging,
    revealPoints,
    canExpand,
    displayStop?.id,
    measurePeekHeight,
    measureExpandedHeight,
  ])

  useEffect(() => {
    if (isOpen) {
      setRevealPoints(true)
      return undefined
    }
    setRevealPoints(false)
    return undefined
  }, [isOpen])

  useEffect(() => {
    setDragOffset(0)
    setIsDragging(false)
  }, [isOpen])

  const getSheetHeight = useCallback(() => {
    const peek = peekHeightPx
    const expanded = Math.max(expandedHeightPx, peek)

    if (!canExpand) return peek

    if (isDragging) {
      if (isOpen) {
        return Math.max(peek, expanded - Math.max(0, dragOffset))
      }
      return Math.min(expanded, peek + Math.max(0, -dragOffset))
    }

    return isOpen ? expanded : peek
  }, [isOpen, isDragging, dragOffset, peekHeightPx, expandedHeightPx, canExpand])

  const releaseScrollLock = useCallback(() => {
    scrollerRef?.current?.style.removeProperty('overflow')
  }, [scrollerRef])

  const handleClose = useCallback(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
    onClose?.()
    const trigger = returnFocusRef.current
    if (trigger && typeof trigger.focus === 'function') {
      requestAnimationFrame(() => trigger.focus())
    }
  }, [onClose])

  const handlePointerDown = (event) => {
    if (!canExpand) return
    if (isOpen && bodyRef.current) {
      bodyRef.current.scrollTop = 0
    }
    pointerStartRef.current = { y: event.clientY, id: event.pointerId }
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!canExpand) return
    const start = pointerStartRef.current
    if (!start || start.id !== event.pointerId) return

    const dy = event.clientY - start.y
    setDragOffset(dy)

    if (!isOpen) {
      const draggedHeight = peekHeightPx + Math.max(0, -dy)
      setRevealPoints(draggedHeight > peekHeightPx + 20)
    }
  }

  const handlePointerUp = (event) => {
    if (!canExpand) return
    const start = pointerStartRef.current
    pointerStartRef.current = null
    setIsDragging(false)

    if (!start || start.id !== event.pointerId) {
      setDragOffset(0)
      if (!isOpen) setRevealPoints(false)
      return
    }

    const dy = event.clientY - start.y

    if (!isOpen) {
      if (-dy >= SWIPE_OPEN_PX || Math.abs(dy) < 10) {
        onOpen?.()
      } else {
        setRevealPoints(false)
      }
    } else if (dy >= SWIPE_DISMISS_PX) {
      handleClose()
    }

    setDragOffset(0)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handlePointerCancel = (event) => {
    pointerStartRef.current = null
    setIsDragging(false)
    setDragOffset(0)
    if (!isOpen) setRevealPoints(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  useEffect(() => {
    if (isOpen && !peekVisible) onClose?.()
  }, [isOpen, peekVisible, onClose])

  useEffect(() => {
    if (!isOpen) return undefined

    returnFocusRef.current = document.activeElement
    scrollerRef?.current?.style.setProperty('overflow', 'hidden')
    sheetRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      releaseScrollLock()
    }
  }, [isOpen, handleClose, releaseScrollLock, scrollerRef])

  if (!showDrawer || typeof document === 'undefined') return null

  const { card: cardCls, title: titleCls, desc: descCls } = getStoryCardStyles(theme)
  const sheetHeightPx = getSheetHeight()
  const expanded = Math.max(expandedHeightPx, peekHeightPx)
  const needsScroll = isOpen && expanded >= expandedCapPx - 1
  const peekNeedsScroll = !isOpen && peekHeightPx >= peekCapPx - 1

  return createPortal(
    <div className="md:hidden">
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[100] bg-black/50 ${
          reducedMotion ? '' : 'transition-opacity duration-[380ms] ease-out'
        } ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-label="Close tour stop details"
        onClick={handleClose}
      />

      <div
        ref={sheetRef}
        tabIndex={isOpen ? -1 : undefined}
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? true : undefined}
        aria-labelledby={isOpen ? 'tour-stop-drawer-title' : undefined}
        style={{
          height: `${sheetHeightPx}px`,
          transition:
            isDragging || reducedMotion ? 'none' : `height ${SHEET_DURATION_MS}ms ${SHEET_EASING}`,
        }}
        className={`fixed inset-x-0 bottom-0 z-[101] flex flex-col overflow-hidden rounded-t-2xl border border-b-0 shadow-2xl outline-none will-change-[height] ${cardCls}`}
        onPointerDown={!isOpen && canExpand ? handlePointerDown : undefined}
        onPointerMove={!isOpen && canExpand ? handlePointerMove : undefined}
        onPointerUp={!isOpen && canExpand ? handlePointerUp : undefined}
        onPointerCancel={!isOpen && canExpand ? handlePointerCancel : undefined}
      >
        <header
          ref={headerRef}
          className={`shrink-0 touch-none px-4 pt-1 ${isOpen ? 'pb-2' : 'pb-0'}`}
          onPointerDown={isOpen && canExpand ? handlePointerDown : undefined}
          onPointerMove={isOpen && canExpand ? handlePointerMove : undefined}
          onPointerUp={isOpen && canExpand ? handlePointerUp : undefined}
          onPointerCancel={isOpen && canExpand ? handlePointerCancel : undefined}
        >
          <DrawerGrabHandle />
          <h2 id="tour-stop-drawer-title" className={`text-lg font-bold tracking-tight ${titleCls}`}>
            {displayStop.title}
          </h2>
        </header>

        <div
          ref={bodyRef}
          className={`min-h-0 flex-1 px-4 pt-3 ${
            needsScroll || peekNeedsScroll
              ? 'overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]'
              : 'overflow-hidden pb-[max(1rem,env(safe-area-inset-bottom))]'
          }`}
        >
          <div ref={contentMeasureRef} className="pb-4">
            <p className={`text-sm leading-relaxed sm:text-base ${descCls}`}>{displayStop.desc}</p>
            {displayStop.desc2 ? (
              <p className={`mt-4 text-sm leading-relaxed sm:text-base ${descCls}`}>{displayStop.desc2}</p>
            ) : null}

            {showPoints ? (
              <ul className="mt-6 space-y-3">
                {displayStop.points.map((point) => (
                  <li key={point} className={`flex items-start gap-2.5 text-sm ${descCls}`}>
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
