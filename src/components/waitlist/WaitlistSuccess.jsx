export default function WaitlistSuccess() {
  return (
    <div className="flex flex-col items-center py-4 text-center sm:py-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <h3 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        You&apos;re on the list
      </h3>
      <p className="mt-3 max-w-sm text-base text-muted-foreground">
        We&apos;ll email you when Marker opens. Thanks for your interest.
      </p>
      <p className="mt-2 text-sm text-muted-foreground/80">Check your inbox for a confirmation.</p>
    </div>
  )
}
