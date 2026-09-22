import type { CSSProperties } from 'react'
import { useBrandLogoLightVariant } from '../context/BrandLogoVariantContext'
import { getBrandLogoLightVariant } from '../lib/brandLogoVariants'

const PEN_MASK = "url('/brand/kolom-pen.png')"

const sizes: Record<string, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
}

const iconSizes: Record<string, string> = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
}

const penMaskStyle: CSSProperties = {
  maskImage: PEN_MASK,
  WebkitMaskImage: PEN_MASK,
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskPosition: 'center',
}

interface PenSilhouetteProps {
  className?: string
  style?: CSSProperties
}

function PenSilhouette({ className = '', style }: PenSilhouetteProps) {
  return <div className={className} style={{ ...penMaskStyle, ...style }} aria-hidden="true" />
}

interface BrandLogoProps {
  size?: 'sm' | 'md'
  surface?: 'light' | 'dark' | null
  className?: string
  variant?: string
}

export default function BrandLogo({
  size = 'sm',
  surface = 'light',
  className = '',
  variant,
}: BrandLogoProps) {
  const contextVariant = useBrandLogoLightVariant()
  const lightVariant = getBrandLogoLightVariant(contextVariant)
  const resolvedSurface = surface ?? (variant === 'nav' ? 'dark' : 'light')

  if (resolvedSurface === 'dark') {
    return <PenSilhouette className={`shrink-0 bg-white ${iconSizes[size]} ${className}`} />
  }

  if (lightVariant === 'purpleSilhouette') {
    return <PenSilhouette className={`shrink-0 bg-brand-primary ${sizes[size]} ${className}`} />
  }

  if (lightVariant === 'softTile') {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg bg-brand-primary/15 ring-1 ring-brand-primary/25 ${sizes[size]} ${className}`}
        aria-hidden="true"
      >
        <PenSilhouette className={`bg-brand-primary ${iconSizes[size]}`} />
      </div>
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg bg-white dark:bg-brand-primary/20 ${sizes[size]} ${className}`}
      aria-hidden="true"
    >
      <PenSilhouette className={`bg-brand-primary ${iconSizes[size]}`} />
    </div>
  )
}
