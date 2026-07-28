import { useCallback, useRef, useState } from 'react'
import CapabilitiesSettings from './CapabilitiesSettings'
import useCarouselPageSize from '../hooks/useCarouselPageSize'
import useInView from '../hooks/useInView'
import { getStoryCardStyles } from '../lib/storyCardStyles'

const SWIPE_THRESHOLD_PX = 40
const CAPABILITY_CARD_CLASS = 'flex h-[219px] flex-col'
const CAPABILITY_CARD_EDIT_CLASS = 'flex min-h-[219px] flex-col'

function chunkCards(cards, pageSize) {
  const pages = []
  for (let i = 0; i < cards.length; i += pageSize) {
    pages.push(cards.slice(i, i + pageSize))
  }
  return pages
}

function CapabilityIcon({ path }) {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

function CapabilityCard({
  card,
  index,
  theme,
  reducedMotion,
  editMode,
  onCardChange,
  onSave,
}) {
  const [ref, inView] = useInView({ enabled: !reducedMotion })
  const { card: cardCls, title: titleCls, desc: descCls } = getStoryCardStyles(theme)
  const reveal = reducedMotion || inView

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border p-5 ${editMode ? CAPABILITY_CARD_EDIT_CLASS : CAPABILITY_CARD_CLASS} ${cardCls} ${
        editMode ? 'ring-2 ring-primary/50' : ''
      } ${reveal ? 'animate-fade-up' : 'opacity-0'}`}
      style={reveal && !reducedMotion ? { animationDelay: `${Math.min(index, 6) * 40}ms` } : undefined}
    >
      {card.badge && (
        <span className="absolute right-4 top-4 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {card.badge}
        </span>
      )}

      {editMode ? (
        <CapabilitiesSettings card={card} onChange={onCardChange} onSave={onSave} />
      ) : (
        <>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <CapabilityIcon path={card.icon} />
          </div>
          <h3 className={`text-base font-semibold ${titleCls}`}>{card.title}</h3>
          <p className={`mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed ${descCls}`}>
            {card.description}
          </p>
        </>
      )}
    </div>
  )
}

function CarouselArrow({ direction, disabled, onClick, label, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40 ${className}`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={direction === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
        />
      </svg>
    </button>
  )
}

export default function CapabilitiesCarousel({
  cards,
  theme,
  reducedMotion = false,
  editMode = false,
  onCardChange,
  onSave,
}) {
  const pageSize = useCarouselPageSize()
  const pages = chunkCards(cards, pageSize)
  const pageCount = pages.length
  const [pageIndex, setPageIndex] = useState(0)
  const [trackedPageSize, setTrackedPageSize] = useState(pageSize)
  const touchStartRef = useRef(null)

  if (pageSize !== trackedPageSize) {
    setTrackedPageSize(pageSize)
    setPageIndex(0)
  }

  const safePageIndex = Math.min(pageIndex, Math.max(pageCount - 1, 0))

  const goPrev = useCallback(() => {
    setPageIndex((current) => Math.max(current - 1, 0))
  }, [])

  const goNext = useCallback(() => {
    setPageIndex((current) => Math.min(current + 1, pageCount - 1))
  }, [pageCount])

  const onTouchStart = (event) => {
    const touch = event.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const onTouchEnd = (event) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return

    const touch = event.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y

    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return
    if (dx < 0) goNext()
    else goPrev()
  }

  const atStart = safePageIndex === 0
  const atEnd = safePageIndex >= pageCount - 1

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
        <div className="flex w-full items-center gap-2.5 sm:gap-3.5">
          {pageCount > 1 && (
            <CarouselArrow
              direction="prev"
              disabled={atStart}
              onClick={goPrev}
              label="Previous capability page"
            />
          )}

          <div
            className="min-w-0 flex-1 overflow-hidden"
            aria-roledescription="carousel"
            aria-label="Capability cards"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className={`flex ${reducedMotion ? '' : 'transition-transform duration-300 ease-out'}`}
              style={{ transform: `translateX(-${safePageIndex * 100}%)` }}
            >
              {pages.map((pageCards, pageIdx) => (
                <div key={pageIdx} className="w-full shrink-0 px-0.5">
                  <div
                    className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5"
                    aria-hidden={pageIdx !== safePageIndex}
                  >
                    {pageCards.map((card, localIndex) => (
                      <CapabilityCard
                        key={card.id}
                        card={card}
                        index={localIndex}
                        theme={theme}
                        reducedMotion={reducedMotion}
                        editMode={editMode}
                        onCardChange={onCardChange}
                        onSave={onSave}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pageCount > 1 && (
            <CarouselArrow
              direction="next"
              disabled={atEnd}
              onClick={goNext}
              label="Next capability page"
            />
          )}
        </div>

        {pageCount > 1 && (
          <div className="flex h-8 shrink-0 items-center justify-center">
            <div className="flex items-center gap-2" role="tablist" aria-label="Capability pages">
              {pages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === safePageIndex}
                  aria-label={`Page ${idx + 1} of ${pageCount}`}
                  onClick={() => setPageIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === safePageIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60'
                  }`}
                />
              ))}
            </div>

            <span className="sr-only" aria-live="polite">
              Page {safePageIndex + 1} of {pageCount}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
