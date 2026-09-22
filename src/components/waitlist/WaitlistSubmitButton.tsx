import { cn } from '@/lib/utils'

function ArrowIcon(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export interface WaitlistSubmitButtonProps {
  disabled: boolean
  isSubmitting: boolean
  className?: string
}

export default function WaitlistSubmitButton({
  disabled,
  isSubmitting,
  className = '',
}: WaitlistSubmitButtonProps): React.JSX.Element {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        'group relative flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <span>{isSubmitting ? 'Joining…' : 'Submit'}</span>
      <span
        aria-hidden="true"
        className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-primary-foreground transition-transform group-hover:translate-x-0.5"
      >
        <ArrowIcon />
      </span>
    </button>
  )
}
