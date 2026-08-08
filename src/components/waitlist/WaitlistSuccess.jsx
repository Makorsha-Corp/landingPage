import { iconTileLg } from '../../lib/loginSurfaceStyles'

function CheckGlyph({ className = 'h-7 w-7' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function WaitlistSuccess() {
  return (
    <div className="flex flex-col items-center py-4 text-center sm:py-6">
      <div
        className={`${iconTileLg} rounded-2xl ring-1 ring-primary/20`}
        aria-hidden="true"
      >
        <CheckGlyph />
      </div>
      <h3 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        You&apos;re on the list
      </h3>
      <p className="mt-3 max-w-sm text-base text-muted-foreground">
        We&apos;ll be in touch when Marker opens. Thanks for your interest.
      </p>
    </div>
  )
}
