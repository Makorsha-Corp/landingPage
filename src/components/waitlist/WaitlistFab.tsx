import type { RefObject, CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import useLandingMotion from '../../hooks/useLandingMotion'
import useWaitlistFabFadeEnter from '../../hooks/useWaitlistFabFadeEnter'
import { DEFAULT_WAITLIST_FAB_STYLE } from '../../lib/waitlistFabStyles'
import { getSettledTriggerRect, type MorphRect } from '../../lib/waitlistFabMorph'
import WaitlistFabFace from './WaitlistFabFace'
import type { RainbowButtonProps } from '@/components/ui/rainbow-button'

const INLINE_FACE_CLASS =
  'h-9 shrink-0 rounded-full px-3.5 text-xs sm:text-sm shadow-md shadow-primary/15'

export interface WaitlistFabProps {
  ref?: RefObject<HTMLButtonElement | null>
  visible?: boolean
  morphing?: boolean
  enterFromHero?: boolean
  fabStyle?: string
  variant?: RainbowButtonProps['variant']
  placement?: 'fixed' | 'inline'
  onClick?: (rect: MorphRect | null, node: HTMLButtonElement | null) => void
  className?: string
}

export default function WaitlistFab({
  ref,
  visible = true,
  morphing = false,
  enterFromHero = false,
  fabStyle = DEFAULT_WAITLIST_FAB_STYLE,
  variant = 'brand',
  placement = 'fixed',
  onClick,
  className = '',
}: WaitlistFabProps) {
  const { reducedMotion } = useLandingMotion()
  const isInline = placement === 'inline'

  const { useFadeEnter } = useWaitlistFabFadeEnter({
    reducedMotion,
    enabled: visible && !morphing && enterFromHero,
    freezeTravel: morphing,
  })

  if (!visible) return null

  const handleClick = (): void => {
    const node = ref?.current ?? null
    const rect = node ? getSettledTriggerRect(node) : null
    onClick?.(rect, node)
  }

  const fadeEnterCls =
    useFadeEnter && !reducedMotion
      ? isInline
        ? 'animate-waitlist-nav-signup-enter'
        : 'animate-waitlist-fab-enter'
      : null

  const bottomStyle: CSSProperties | undefined = isInline
    ? undefined
    : { bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }

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
      style={bottomStyle}
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
}
