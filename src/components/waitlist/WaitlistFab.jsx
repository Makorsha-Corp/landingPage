import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import useLandingMotion from '../../hooks/useLandingMotion'
import useWaitlistFabFadeEnter from '../../hooks/useWaitlistFabFadeEnter'
import { DEFAULT_WAITLIST_FAB_STYLE } from '../../lib/waitlistFabStyles'
import { getSettledTriggerRect } from '../../lib/waitlistFabMorph'
import WaitlistFabFace from './WaitlistFabFace'

const INLINE_FACE_CLASS =
  'h-9 shrink-0 rounded-full px-3.5 text-xs sm:text-sm shadow-md shadow-primary/15'

const WaitlistFab = forwardRef(function WaitlistFab(
  {
    visible = true,
    morphing = false,
    enterFromHero = false,
    fabStyle = DEFAULT_WAITLIST_FAB_STYLE,
    variant = 'brand',
    placement = 'fixed',
    onClick,
    className = '',
  },
  ref,
) {
  const { reducedMotion } = useLandingMotion()
  const isInline = placement === 'inline'

  const { useFadeEnter } = useWaitlistFabFadeEnter({
    reducedMotion,
    enabled: visible && !morphing && enterFromHero,
    freezeTravel: morphing,
  })

  if (!visible) return null

  const handleClick = () => {
    const node = ref?.current
    const rect = node ? getSettledTriggerRect(node) : null
    onClick?.(rect, node)
  }

  const fadeEnterCls =
    useFadeEnter && !reducedMotion
      ? isInline
        ? 'animate-waitlist-nav-signup-enter'
        : 'animate-waitlist-fab-enter'
      : null

  return (
    <div
      data-waitlist-fab-wrap=""
      className={cn(
        'transition-opacity duration-300 ease-out',
        isInline ? 'relative shrink-0 origin-center' : 'fixed right-4 z-[95]',
        fadeEnterCls,
        morphing && 'pointer-events-none opacity-0',
        !morphing && !useFadeEnter && 'opacity-100',
        className,
      )}
      style={
        isInline
          ? undefined
          : { bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }
      }
      aria-hidden={morphing ? true : undefined}
    >
      <WaitlistFabFace
        ref={ref}
        styleId={fabStyle}
        variant={variant}
        onClick={handleClick}
        className={isInline ? INLINE_FACE_CLASS : undefined}
      />
    </div>
  )
})

export default WaitlistFab
