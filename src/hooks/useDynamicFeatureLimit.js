import { useLayoutEffect, useState } from 'react'

const MIN_VISIBLE_FEATURES = 3
const LIST_PADDING_BUFFER = 16
const FALLBACK_ROW_HEIGHT = 32
const TOGGLE_RESERVE = 28

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export default function useDynamicFeatureLimit({
  enabled,
  expanded,
  totalCount,
  cardRef,
  headerRef,
  actionsRef,
  sampleRowRef,
}) {
  const [limit, setLimit] = useState(MIN_VISIBLE_FEATURES)

  useLayoutEffect(() => {
    if (!enabled || expanded) {
      setLimit(totalCount)
      return undefined
    }

    const card = cardRef.current
    if (!card) return undefined

    const measure = () => {
      const cardHeight = card.clientHeight
      const headerHeight = headerRef.current?.offsetHeight ?? 0
      const actionsHeight = actionsRef.current?.offsetHeight ?? 0
      const rowHeight = sampleRowRef.current?.offsetHeight || FALLBACK_ROW_HEIGHT
      const toggleReserve = totalCount > MIN_VISIBLE_FEATURES ? TOGGLE_RESERVE : 0

      const listBudget =
        cardHeight - headerHeight - actionsHeight - toggleReserve - LIST_PADDING_BUFFER
      const nextLimit = clamp(
        Math.floor(listBudget / rowHeight),
        MIN_VISIBLE_FEATURES,
        totalCount,
      )

      setLimit((current) => (current === nextLimit ? current : nextLimit))
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(card)

    if (headerRef.current) observer.observe(headerRef.current)
    if (actionsRef.current) observer.observe(actionsRef.current)
    if (sampleRowRef.current) observer.observe(sampleRowRef.current)

    return () => observer.disconnect()
  }, [enabled, expanded, totalCount, cardRef, headerRef, actionsRef, sampleRowRef])

  return expanded ? totalCount : limit
}
