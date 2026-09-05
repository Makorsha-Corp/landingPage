export default function TourMobileProgressDots({ count, activeIndex, onSelect }) {
  if (count <= 0) return null

  return (
    <div
      className="flex items-center justify-center gap-1.5"
      role="tablist"
      aria-label="Tour stops"
    >
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeIndex
        const sharedCls = `h-1.5 rounded-full transition-all duration-300 ${
          isActive ? 'w-5 bg-primary' : 'w-1.5 bg-primary/35'
        }`

        if (onSelect) {
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Stop ${index + 1} of ${count}`}
              onClick={() => onSelect(index)}
              className={`pointer-events-auto ${sharedCls}`}
            />
          )
        }

        return (
          <span
            key={index}
            role="tab"
            aria-selected={isActive}
            aria-label={`Stop ${index + 1} of ${count}`}
            className={`pointer-events-none ${sharedCls}`}
          />
        )
      })}
    </div>
  )
}
