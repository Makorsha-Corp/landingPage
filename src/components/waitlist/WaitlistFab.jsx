import { forwardRef, useRef } from 'react'
import { cn } from '@/lib/utils'
import useReducedMotion from '../../hooks/useReducedMotion'
import useWaitlistFabHeroTravel from '../../hooks/useWaitlistFabHeroTravel'
import { DEFAULT_WAITLIST_FAB_STYLE } from '../../lib/waitlistFabStyles'
import { getSettledTriggerRect } from '../../lib/waitlistFabMorph'
import WaitlistFabFace from './WaitlistFabFace'

const WaitlistFab = forwardRef(function WaitlistFab(
  {
    visible = true,
    morphing = false,
    enterFromHero = false,
    heroSignUpRef = null,
    fabStyle = DEFAULT_WAITLIST_FAB_STYLE,
    variant = 'brand',
    onClick,
    className = '',
  },
  ref,
) {
  const reducedMotion = useReducedMotion()
  const wrapRef = useRef(null)

  const { wrapStyle, travelPhase } = useWaitlistFabHeroTravel({
    heroSignUpRef,
    wrapRef,
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

  const isAnimating = travelPhase === 'traveling'

  return (
    <div
      ref={wrapRef}
      data-waitlist-fab-wrap=""
      className={cn(
        'fixed right-4 z-[95] transition-opacity duration-300 ease-out',
        isAnimating && 'z-[95]',
        morphing && 'pointer-events-none opacity-0',
        !morphing && 'opacity-100',
        className,
      )}
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        ...wrapStyle,
      }}
      aria-hidden={morphing ? true : undefined}
    >
      <WaitlistFabFace ref={ref} styleId={fabStyle} variant={variant} onClick={handleClick} />
    </div>
  )
})

export default WaitlistFab
