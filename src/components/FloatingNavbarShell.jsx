export default function FloatingNavbarShell({ children, className = '' }) {
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 pointer-events-none ${className}`}
    >
      <div className="pointer-events-auto mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-lg ring-1 ring-black/5 dark:shadow-black/30">
        {children}
      </div>
    </header>
  )
}
