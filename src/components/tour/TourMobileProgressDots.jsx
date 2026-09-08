export default function TourMobileProgressDots({ count, activeIndex }) {
  if (count <= 0) return null

  return (
    <span
      className="flex shrink-0 flex-col items-center gap-0.5 rounded-full bg-muted/30 px-1 py-1"
      role="tablist"
      aria-label="Tour stops"
    >
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeIndex
        return (
          <span
            key={index}
            role="tab"
            aria-selected={isActive}
            aria-label={`Stop ${index + 1} of ${count}`}
            className={`w-1 rounded-full transition-all duration-300 ${
              isActive ? 'h-2.5 bg-primary' : 'h-1 bg-muted-foreground/40'
            }`}
          />
        )
      })}
    </span>
  )
}
