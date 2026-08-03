import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getStoryCardStyles } from '../../lib/storyCardStyles'

export default function TourMobileStopPanel({
  stop,
  theme,
  scrollerRef,
  reducedMotion = false,
  onClose,
}) {
  const closeButtonRef = useRef(null)
  const returnFocusRef = useRef(null)

  const releaseScrollLock = useCallback(() => {
    scrollerRef?.current?.style.removeProperty('overflow')
  }, [scrollerRef])

  const handleClose = useCallback(() => {
    releaseScrollLock()
    onClose?.()
    const trigger = returnFocusRef.current
    if (trigger && typeof trigger.focus === 'function') {
      requestAnimationFrame(() => trigger.focus())
    }
  }, [onClose, releaseScrollLock])

  useEffect(() => {
    if (!stop) return undefined

    returnFocusRef.current = document.activeElement
    scrollerRef?.current?.style.setProperty('overflow', 'hidden')
    closeButtonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      releaseScrollLock()
    }
  }, [stop, handleClose, releaseScrollLock, scrollerRef])

  if (!stop || typeof document === 'undefined') return null

  const { title: titleCls, desc: descCls } = getStoryCardStyles(theme)
  const fadeCls = reducedMotion ? '' : 'animate-fade-in'

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex flex-col bg-background ${fadeCls}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-stop-panel-title"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-border/60 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close tour stop details"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 id="tour-stop-panel-title" className={`min-w-0 flex-1 truncate text-lg font-bold ${titleCls}`}>
          {stop.title}
        </h2>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className={`text-sm leading-relaxed sm:text-base ${descCls}`}>{stop.desc}</p>
        {stop.desc2 ? (
          <p className={`mt-4 text-sm leading-relaxed sm:text-base ${descCls}`}>{stop.desc2}</p>
        ) : null}
        {stop.points?.length ? (
          <ul className="mt-6 space-y-3">
            {stop.points.map((point) => (
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
    </div>,
    document.body,
  )
}
