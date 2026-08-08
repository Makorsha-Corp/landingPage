import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import useWaitlistForm from '../../hooks/useWaitlistForm'
import useWaitlistFabMorph from '../../hooks/useWaitlistFabMorph'
import useWaitlistPanelReveal from '../../hooks/useWaitlistPanelReveal'
import useReducedMotion from '../../hooks/useReducedMotion'
import {
  getMorphShellStyle,
  getWaitlistModalTargetRect,
  MORPH_BACKDROP_EASING,
  MORPH_BACKDROP_MAX_OPACITY,
  MORPH_COLLAPSE_DURATION_MS,
  MORPH_EXPAND_DURATION_MS,
  MORPH_DEFAULT_ORIGIN_BORDER_RADIUS,
  resolveTravelBg,
} from '../../lib/waitlistFabMorph'
import { cn } from '@/lib/utils'
import FabMorphFace from './FabMorphFace'
import WaitlistDialogLayout from './WaitlistDialogLayout'
import WaitlistForm from './WaitlistForm'
import WaitlistSuccess from './WaitlistSuccess'

const DEFAULT_MORPH_META = {
  label: 'Sign Up',
  variant: 'brand',
  face: 'rainbow',
  borderRadius: MORPH_DEFAULT_ORIGIN_BORDER_RADIUS,
  travelBg: 'primary',
}

const TRAVEL_BG_CLASS = {
  primary: 'bg-primary',
  'brand-secondary': 'bg-brand-secondary',
  card: 'bg-card',
}

function getBackdropOpacity(phase, collapsed) {
  if (phase === 'morphOut') return 0
  if (phase === 'morphIn' && collapsed) return 0
  return MORPH_BACKDROP_MAX_OPACITY
}

export default function WaitlistModal({
  open,
  originRect,
  morphMeta = DEFAULT_MORPH_META,
  source = 'waitlist_section',
  onClose,
  scrollerRef,
  returnFocusRef,
}) {
  const reducedMotion = useReducedMotion()
  const closeButtonRef = useRef(null)
  const returnFocusStoredRef = useRef(null)
  const resolvedMorphMeta = { ...DEFAULT_MORPH_META, ...morphMeta }
  const travelBg = resolveTravelBg(resolvedMorphMeta)

  const getReturnFocusElement = useCallback(
    () => returnFocusRef?.current ?? returnFocusStoredRef.current,
    [returnFocusRef],
  )

  const finishClose = useCallback(() => {
    scrollerRef?.current?.style.removeProperty('overflow')
    onClose?.()
    const trigger = getReturnFocusElement()
    if (trigger && typeof trigger.focus === 'function') {
      requestAnimationFrame(() => trigger.focus())
    }
  }, [onClose, getReturnFocusElement, scrollerRef])

  const {
    phase,
    collapsed,
    contentVisible,
    useMorph,
    isVisible,
    storedOrigin,
    targetRect,
    startClose,
    handleShellTransitionEnd,
  } = useWaitlistFabMorph({
    open,
    originRect,
    reducedMotion,
    onCloseComplete: finishClose,
    getReturnFocusElement,
  })

  const { revealed, isCovering, startCover } = useWaitlistPanelReveal({
    phase,
    reducedMotion,
    contentVisible,
  })

  const { formProps, isSuccess } = useWaitlistForm({
    source,
    formIdPrefix: 'waitlist-modal',
  })

  const requestClose = useCallback(() => {
    if (isCovering) return

    if (useMorph && revealed && !reducedMotion) {
      startCover(() => startClose())
      return
    }

    startClose()
  }, [isCovering, useMorph, revealed, reducedMotion, startCover, startClose])

  useEffect(() => {
    if (!isVisible) return undefined

    returnFocusStoredRef.current = document.activeElement
    scrollerRef?.current?.style.setProperty('overflow', 'hidden')

    const onKeyDown = (event) => {
      if (event.key === 'Escape') requestClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isVisible, requestClose, scrollerRef])

  useEffect(() => {
    if (phase === 'open' && revealed) {
      closeButtonRef.current?.focus()
    }
  }, [phase, revealed])

  if (!isVisible || typeof document === 'undefined') return null

  const isCollapsing = phase === 'morphOut'
  const morphDurationMs = isCollapsing ? MORPH_COLLAPSE_DURATION_MS : MORPH_EXPAND_DURATION_MS
  const isTraveling = phase === 'morphIn' || phase === 'morphOut'
  const isOpen = phase === 'open'

  const resolvedTarget = targetRect ?? getWaitlistModalTargetRect()
  const resolvedOrigin = storedOrigin ?? originRect
  const originRadius = resolvedMorphMeta.borderRadius ?? MORPH_DEFAULT_ORIGIN_BORDER_RADIUS
  const shellStyle = useMorph
    ? getMorphShellStyle(resolvedOrigin, resolvedTarget, collapsed, reducedMotion, {
        collapsing: isCollapsing,
        originRadius,
      })
    : null

  const backdropOpacity = getBackdropOpacity(phase, collapsed)
  const backdropBlur = backdropOpacity > 0.05
  const showDialog = isOpen || !useMorph
  const faceVisible = useMorph && phase === 'morphIn' && collapsed
  const showContent = contentVisible || showDialog
  const showModalChrome = isOpen || !useMorph
  const panelRevealed = !useMorph || reducedMotion || revealed

  const dialogBody = (
    <WaitlistDialogLayout
      titleId="waitlist-dialog-title"
      isSuccess={isSuccess}
      onClose={requestClose}
      closeButtonRef={closeButtonRef}
      revealed={panelRevealed}
      reducedMotion={reducedMotion || !useMorph}
      renderForm={() => <WaitlistForm {...formProps} />}
      renderSuccess={() => <WaitlistSuccess />}
    />
  )

  if (!useMorph) {
    return createPortal(
      <div
        className={cn(
          'fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4',
          !reducedMotion && 'animate-fade-in',
        )}
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) requestClose()
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-dialog-title"
          className="relative h-[min(85vh,44rem)] w-[min(60rem,94vw)] overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-border/70"
          onMouseDown={(event) => event.stopPropagation()}
        >
          {dialogBody}
        </div>
      </div>,
      document.body,
    )
  }

  return createPortal(
    <>
      <div
        className={cn(
          'fixed inset-0 z-[200] bg-black transition-[opacity,backdrop-filter]',
          backdropBlur && 'backdrop-blur-sm',
        )}
        style={{
          opacity: backdropOpacity,
          transitionDuration: `${morphDurationMs}ms`,
          transitionTimingFunction: MORPH_BACKDROP_EASING,
          pointerEvents: backdropOpacity > 0.05 ? 'auto' : 'none',
        }}
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && showDialog) requestClose()
        }}
      />

      <div
        className={cn(
          'waitlist-morph-shell relative overflow-hidden transition-colors duration-200',
          isTraveling || isCovering ? TRAVEL_BG_CLASS[travelBg] ?? TRAVEL_BG_CLASS.primary : 'bg-card',
          showModalChrome && !isCovering && 'shadow-2xl ring-1 ring-border/70',
        )}
        style={shellStyle ?? undefined}
        aria-hidden={!showDialog}
        onTransitionEnd={handleShellTransitionEnd}
      >
        <FabMorphFace
          visible={faceVisible}
          label={resolvedMorphMeta.label}
          variant={resolvedMorphMeta.variant}
          face={resolvedMorphMeta.face}
        />

        <div
          role={showDialog ? 'dialog' : undefined}
          aria-modal={showDialog ? true : undefined}
          aria-labelledby={showDialog ? 'waitlist-dialog-title' : undefined}
          className="waitlist-morph-content relative h-full w-full"
        >
          {showContent ? dialogBody : null}
        </div>
      </div>
    </>,
    document.body,
  )
}
