import { useLayoutEffect, useRef, useState } from 'react'
import BrandLogo from '../BrandLogo'
import { cn } from '@/lib/utils'
import useIsMobileTour from '../../hooks/useIsMobileTour'
import useWaitlistColumnShift from '../../hooks/useWaitlistColumnShift'
import { WAITLIST_COPY } from './waitlistContent'

function CloseButton({ closeButtonRef, onClose, onBrandPanel = false }) {
  return (
    <button
      ref={closeButtonRef}
      type="button"
      onClick={onClose}
      className={cn(
        'absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full transition-colors',
        onBrandPanel
          ? 'bg-white/15 text-white hover:bg-white/25'
          : 'z-10 bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      aria-label="Close waitlist signup"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  )
}

function BrandName({ className }) {
  return (
    <span className={cn('text-2xl font-bold tracking-tight text-white', className)}>
      {WAITLIST_COPY.brandName}
    </span>
  )
}

function BrandEyebrow({ className }) {
  return (
    <p
      className={cn(
        'mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/70 sm:mt-6 sm:text-xs',
        className,
      )}
    >
      {WAITLIST_COPY.eyebrow}
    </p>
  )
}

function BrandHeadline({ titleId, className }) {
  return (
    <h2
      id={titleId}
      className={cn(
        'mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-white sm:mt-4 sm:text-4xl md:text-5xl',
        className,
      )}
    >
      {WAITLIST_COPY.titleLine1}
      <span className="block text-white/80">{WAITLIST_COPY.titleLine2}</span>
    </h2>
  )
}

export default function WaitlistDialogLayout({
  titleId,
  renderForm,
  renderSuccess,
  isSuccess,
  onClose,
  onFaqClick,
  closeButtonRef,
  revealed = true,
  reducedMotion = false,
}) {
  const rootRef = useRef(null)
  const brandPanelRef = useRef(null)
  const brandColumnRef = useRef(null)
  const [brandHeightPx, setBrandHeightPx] = useState(null)
  const isMobile = useIsMobileTour()

  const showRevealed = reducedMotion || revealed
  const showBrandExtras = reducedMotion || revealed
  const useDesktopChoreography = !isMobile && !reducedMotion
  const columnCentered = useDesktopChoreography && !revealed

  const { columnStyle } = useWaitlistColumnShift({
    centered: columnCentered,
    reducedMotion,
    enabled: useDesktopChoreography,
    panelRef: brandPanelRef,
    columnRef: brandColumnRef,
  })

  useLayoutEffect(() => {
    if (!isMobile || !showRevealed) {
      return undefined
    }

    const panelEl = brandPanelRef.current
    const columnEl = brandColumnRef.current
    const rootEl = rootRef.current
    if (!panelEl || !columnEl || !rootEl) return undefined

    const measure = () => {
      const styles = getComputedStyle(panelEl)
      const padTop = parseFloat(styles.paddingTop) || 0
      const padBottom = parseFloat(styles.paddingBottom) || 0
      const measured = columnEl.offsetHeight + padTop + padBottom
      const panelH = rootEl.offsetHeight
      const capped = Math.min(measured, panelH * 0.42)
      setBrandHeightPx(Math.ceil(capped))
    }

    const observer = new ResizeObserver(measure)
    observer.observe(columnEl)
    observer.observe(rootEl)

    measure()

    return () => observer.disconnect()
  }, [isMobile, showRevealed, titleId])

  const wrapperStyle =
    isMobile && brandHeightPx != null ? { '--waitlist-brand-h': `${brandHeightPx}px` } : undefined

  return (
    <div ref={rootRef} className="relative h-full min-h-0 overflow-hidden" style={wrapperStyle}>
      <div
        className={cn(
          'waitlist-form-panel absolute inset-0 flex min-h-0 flex-col overflow-y-auto bg-card px-4 py-5 sm:px-8 sm:py-10',
          showRevealed && (isMobile ? 'justify-start' : 'justify-center'),
          showRevealed ? 'waitlist-form-panel--revealed' : 'waitlist-form-panel--covered',
        )}
      >
        {!isMobile ? <CloseButton closeButtonRef={closeButtonRef} onClose={onClose} /> : null}

        <div
          className={cn(
            'mx-auto w-full max-w-md transition-opacity duration-300 ease-out',
            showRevealed ? 'opacity-100 delay-100' : 'opacity-0',
          )}
        >
          {isSuccess ? (
            renderSuccess()
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">{WAITLIST_COPY.formEyebrow}</p>
              <div className="mt-4">{renderForm()}</div>
            </>
          )}
        </div>
      </div>

      <div
        ref={brandPanelRef}
        className={cn(
          'waitlist-brand-panel absolute left-0 top-0 z-10 flex min-h-0 flex-col bg-primary px-4 py-5 sm:px-8 sm:py-10',
          isMobile
            ? 'items-start justify-start pt-4'
            : cn('justify-center', columnCentered ? 'items-center' : 'items-stretch'),
          showRevealed ? 'waitlist-brand-panel--revealed' : 'waitlist-brand-panel--covered',
        )}
      >
        {isMobile ? (
          <CloseButton closeButtonRef={closeButtonRef} onClose={onClose} onBrandPanel />
        ) : null}

        <div
          ref={brandColumnRef}
          className={cn(
            'waitlist-brand-column',
            columnCentered && 'waitlist-brand-column--centered',
            !columnCentered && 'waitlist-brand-column--left',
            showBrandExtras && 'waitlist-brand-column--in',
          )}
          style={useDesktopChoreography ? columnStyle : undefined}
        >
          <BrandLogo size="md" surface="dark" />
          <BrandName className="mt-1 sm:mt-2" />
          <BrandEyebrow />
          <BrandHeadline titleId={titleId} />
          <p
            className={cn(
              'waitlist-brand-item waitlist-brand-item-delay-0 mt-2 max-w-sm line-clamp-2 text-pretty text-sm leading-relaxed text-white/85 max-md:hidden sm:mt-4 sm:text-lg sm:line-clamp-none',
              !showBrandExtras && 'waitlist-brand-item--hidden',
            )}
          >
            {WAITLIST_COPY.lead}
          </p>
          <p
            className={cn(
              'waitlist-brand-item waitlist-brand-item-delay-1 mt-3 text-xs text-white/75 max-md:hidden sm:mt-6 sm:text-sm',
              !showBrandExtras && 'waitlist-brand-item--hidden',
            )}
          >
            {WAITLIST_COPY.secondaryPrompt}{' '}
            <a
              href={WAITLIST_COPY.secondaryLinkHref}
              onClick={onFaqClick}
              className="font-medium text-white underline underline-offset-4 hover:text-white/90"
            >
              {WAITLIST_COPY.secondaryLinkLabel}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
