import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

function FeatureIcon({ path, className = 'h-6 w-6' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

function ScreenshotSlot({ card }) {
  const src = card.screenshotSrc?.trim()
  const placeholderHint = `/features/${card.id}.png`

  if (src) {
    return (
      <div className="min-h-[12rem] overflow-hidden rounded-xl border border-border bg-muted/40 md:min-h-[16rem]">
        <img
          src={src}
          alt={`${card.title} screenshot`}
          className="h-full w-full object-contain object-center"
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center md:min-h-[16rem]">
      <FeatureIcon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H5.25A2.25 2.25 0 0 0 3 3.75V18.75A2.25 2.25 0 0 0 5.25 21Z" className="mb-3 h-8 w-8 text-muted-foreground/70" />
      <p className="text-sm font-medium text-muted-foreground">Screenshot coming soon</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground/80">{placeholderHint}</p>
    </div>
  )
}

function TextBlock({ card }) {
  return (
    <div>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <FeatureIcon path={card.icon} />
      </div>
      <h2 id="feature-dialog-title" className="text-xl font-bold text-foreground sm:text-2xl">
        {card.title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {card.description}
      </p>
    </div>
  )
}

export default function FeatureCardDialog({
  card,
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
    if (!card) return undefined

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
  }, [card, handleClose, releaseScrollLock, scrollerRef])

  if (!card || typeof document === 'undefined') return null

  const fadeCls = reducedMotion ? '' : 'animate-fade-in'

  return createPortal(
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 ${fadeCls}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-dialog-title"
        className={`relative flex max-h-[66vh] w-[min(64rem,96vw)] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl ${fadeCls}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close feature details"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-start">
          <TextBlock card={card} />
          <div className="md:pt-7">
            <ScreenshotSlot card={card} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
