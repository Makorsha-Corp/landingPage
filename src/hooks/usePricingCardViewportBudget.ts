import { useEffect, useState } from 'react'

const NAV_HEIGHT = 56
const SECTION_HEADER_RESERVE = 120
const CAROUSEL_CONTROLS_RESERVE = 88
const FOOTER_DISCLAIMER_RESERVE = 44
const SECTION_PADDING_RESERVE = 160
const MIN_CARD_HEIGHT = 320
const MAX_CARD_HEIGHT = 560

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function computeCardMinHeight(): number {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  const reserved =
    NAV_HEIGHT +
    SECTION_HEADER_RESERVE +
    CAROUSEL_CONTROLS_RESERVE +
    FOOTER_DISCLAIMER_RESERVE +
    SECTION_PADDING_RESERVE

  return clamp(viewportHeight - reserved, MIN_CARD_HEIGHT, MAX_CARD_HEIGHT)
}

export default function usePricingCardViewportBudget(): number {
  const [cardMinHeight, setCardMinHeight] = useState(() =>
    typeof window !== 'undefined' ? computeCardMinHeight() : MIN_CARD_HEIGHT,
  )

  useEffect(() => {
    const update = (): void => setCardMinHeight(computeCardMinHeight())

    update()
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)

    return () => {
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  return cardMinHeight
}
