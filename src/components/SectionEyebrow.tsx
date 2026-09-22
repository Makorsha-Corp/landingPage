import type { ReactNode } from 'react'

interface SectionEyebrowProps {
  children?: ReactNode
  className?: string
}

export default function SectionEyebrow({ children, className = '' }: SectionEyebrowProps) {
  return (
    <span
      className={`text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground ${className}`}
    >
      {children}
    </span>
  )
}
