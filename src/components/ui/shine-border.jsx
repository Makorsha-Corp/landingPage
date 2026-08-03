import * as React from 'react'

import { cn } from '@/lib/utils'

function getShineBackgroundImage(shineColor, gradient, radialOpacity = 'default') {
  const colors = Array.isArray(shineColor) ? shineColor : [shineColor]

  if (gradient === 'linear') {
    return `linear-gradient(90deg, ${colors.join(',')})`
  }

  if (radialOpacity === 'bold') {
    const [c1, c2, c3, c4] = colors
    const mid = c2 ?? c1
    const peak = c3 ?? mid
    const tail = c4 ?? peak
    return `radial-gradient(circle at center, transparent 0%, transparent 14%, ${c1} 34%, ${mid} 46%, ${peak} 54%, ${tail} 66%, transparent 86%, transparent 100%)`
  }

  return `radial-gradient(transparent,transparent, ${colors.join(',')},transparent,transparent)`
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = '#000000',
  gradient = 'radial',
  radialOpacity = 'default',
  backgroundSize = '300% 300%',
  className,
  style,
  ...props
}) {
  return (
    <div
      style={{
        '--border-width': `${borderWidth}px`,
        '--duration': `${duration}s`,
        backgroundImage: getShineBackgroundImage(shineColor, gradient, radialOpacity),
        backgroundSize,
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        padding: 'var(--border-width)',
        ...style,
      }}
      className={cn(
        'animate-shine pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position]',
        className,
      )}
      {...props}
    />
  )
}
