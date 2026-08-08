import { forwardRef } from 'react'
import { UserPlus } from 'lucide-react'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { cn } from '@/lib/utils'
import { getWaitlistFabStyle } from '../../lib/waitlistFabStyles'

const WaitlistFabFace = forwardRef(function WaitlistFabFace(
  { styleId = 'pill_rainbow', variant = 'brand', onClick, className },
  ref,
) {
  const style = getWaitlistFabStyle(styleId)

  if (style === 'fab_icon') {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90',
          className,
        )}
        aria-label="Sign up for the waitlist"
      >
        <UserPlus className="h-5 w-5" aria-hidden="true" />
      </button>
    )
  }

  if (style === 'glass_chip') {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/15',
          'ring-1 ring-inset ring-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]',
          className,
        )}
        aria-label="Sign up for the waitlist"
      >
        Sign Up
      </button>
    )
  }

  if (style === 'mini_banner') {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-2xl border border-white/20 bg-black/35 px-4 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/45',
          className,
        )}
        aria-label="Join the waitlist"
      >
        <span>Join waitlist</span>
        <span aria-hidden="true">→</span>
      </button>
    )
  }

  return (
    <RainbowButton
      ref={ref}
      type="button"
      variant={variant}
      size="default"
      onClick={onClick}
      className={cn('h-10 rounded-full px-5 text-sm shadow-lg shadow-primary/20', className)}
      aria-label="Sign up for the waitlist"
    >
      Sign Up
    </RainbowButton>
  )
})

export default WaitlistFabFace
