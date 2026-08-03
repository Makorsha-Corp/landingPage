import { getStoryCardStyles } from '../../lib/storyCardStyles'

export default function TourMobileCompactCard({ stop, theme, onOpen, visible }) {
  if (!stop || !visible) return null

  const { card: cardCls, title: titleCls, desc: descCls } = getStoryCardStyles(theme)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 md:hidden">
      <div className="pointer-events-auto mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] max-h-[32vh]">
        <button
          type="button"
          onClick={onOpen}
          className={`flex w-full flex-col rounded-2xl border p-4 text-left shadow-2xl transition-opacity ${cardCls}`}
          aria-label={`Read more about ${stop.title}`}
        >
          <h2 className={`line-clamp-2 text-lg font-bold tracking-tight ${titleCls}`}>{stop.title}</h2>
          <p className={`mt-2 line-clamp-2 flex-1 text-sm leading-relaxed ${descCls}`}>{stop.desc}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Read more
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  )
}
