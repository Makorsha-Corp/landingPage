const sizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
}

const iconSizes = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
}

export default function BrandLogo({ size = 'sm', variant = 'soft', className = '' }) {
  if (variant === 'nav') {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg bg-white dark:bg-brand-primary/20 ${sizes[size]} ${className}`}
        aria-hidden="true"
      >
        <div className={`rounded bg-brand-primary ${size === 'md' ? 'h-6 w-6' : 'h-5 w-5'}`} />
      </div>
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg bg-brand-primary/15 ring-1 ring-brand-primary/25 ${sizes[size]} ${className}`}
      aria-hidden="true"
    >
      <svg
        className={`${iconSizes[size]} text-brand-primary`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
  )
}
