import { forwardRef } from 'react'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { cn } from '@/lib/utils'
import useReducedMotion from '../../hooks/useReducedMotion'

const WaitlistMobileNavSignUp = forwardRef(function WaitlistMobileNavSignUp(
  {
    visible = true,
    morphing = false,
    variant = 'brand',
    onClick,
    className = '',
  },
  ref,
) {
  const reducedMotion = useReducedMotion()

  if (!visible) return null

  const handleClick = (event) => {
    const node = ref?.current ?? event.currentTarget
    const rect = node?.getBoundingClientRect?.() ?? null
    onClick?.(rect, node)
  }

  return (
    <div
      data-waitlist-fab-wrap=""
      className={cn(
        'relative shrink-0 origin-center transition-opacity duration-300 ease-out',
        !reducedMotion && 'animate-waitlist-nav-signup-enter',
        morphing && 'pointer-events-none opacity-0',
        !morphing && 'opacity-100',
        className,
      )}
      aria-hidden={morphing ? true : undefined}
    >
      <RainbowButton
        ref={ref}
        type="button"
        variant={variant}
        size="sm"
        className="h-9 shrink-0 rounded-full px-3.5 text-xs sm:text-sm"
        aria-label="Sign up for the waitlist"
        onClick={handleClick}
      >
        Sign Up
      </RainbowButton>
    </div>
  )
})

export default WaitlistMobileNavSignUp
