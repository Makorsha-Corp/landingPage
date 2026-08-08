import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import useReducedMotion from '../../hooks/useReducedMotion'
import useWaitlistFabFadeEnter from '../../hooks/useWaitlistFabFadeEnter'
import { DEFAULT_WAITLIST_FAB_STYLE } from '../../lib/waitlistFabStyles'
import { getSettledTriggerRect } from '../../lib/waitlistFabMorph'
import WaitlistFabFace from './WaitlistFabFace'

const WaitlistFab = forwardRef(function WaitlistFab(
  {
    visible = true,
    morphing = false,
    enterFromHero = false,
    fabStyle = DEFAULT_WAITLIST_FAB_STYLE,
    variant = 'brand',
    onClick,
    className = '',
  },
  ref,
) {
  const reducedMotion = useReducedMotion()

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

  return (
    <div
      data-waitlist-fab-wrap=""
      className={cn(
        'fixed right-4 z-[95] transition-opacity duration-300 ease-out',
        useFadeEnter && !reducedMotion && 'animate-waitlist-fab-enter',
        morphing && 'pointer-events-none opacity-0',
        !morphing && !useFadeEnter && 'opacity-100',
        className,
      )}
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
      }}
      aria-hidden={morphing ? true : undefined}
    >
      <WaitlistFabFace ref={ref} styleId={fabStyle} variant={variant} onClick={handleClick} />
    </div>
  )
})

export default WaitlistFab
