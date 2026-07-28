import { cn } from '../../lib/cn'

const base =
  'inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

export const buttonVariants = {
  variant: {
    default: 'rounded-md bg-primary text-primary-foreground hover:bg-primary/90',
    outline:
      'rounded-md border border-border bg-card hover:bg-muted/60 hover:text-foreground',
    secondary: 'rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'rounded-md hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
    muted:
      'rounded-md border border-border bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground',
    navGhost:
      'rounded-full border border-border bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground',
    marketing:
      'rounded-lg bg-brand-secondary text-secondary-foreground font-semibold hover:bg-brand-secondary/90',
    marketingOutline:
      'rounded-lg border border-border bg-card font-semibold text-foreground hover:bg-muted/60',
    ctaInverse:
      'rounded-lg bg-card text-foreground font-semibold border border-border hover:bg-muted/60',
    ctaOutline:
      'rounded-lg border border-border bg-card font-semibold text-foreground hover:bg-muted/60',
    heroPrimary:
      'rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-brand-primary-hover',
    heroGlass:
      'rounded-lg border border-white/40 bg-white/10 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20',
  },
  size: {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-12 px-8 text-base',
    xs: 'h-8 px-3 text-xs font-semibold',
    icon: 'h-9 w-9 shrink-0 p-0',
  },
}

export function getButtonClasses({ variant = 'default', size = 'default', className = '' } = {}) {
  const v = buttonVariants.variant[variant] ?? buttonVariants.variant.default
  const s = buttonVariants.size[size] ?? buttonVariants.size.default
  return cn(base, v, s, className)
}
