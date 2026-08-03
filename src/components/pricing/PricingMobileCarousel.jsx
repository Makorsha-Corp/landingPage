import { useCallback, useRef, useState } from 'react'
import usePricingCardViewportBudget from '../../hooks/usePricingCardViewportBudget'
import useReducedMotion from '../../hooks/useReducedMotion'
import PricingTierCard from './PricingTierCard'
import PricingTierSwitcher from './PricingTierSwitcher'

const DEFAULT_INDEX = 1
const SWIPE_THRESHOLD_PX = 48

function getTierAnimationClass(direction, reducedMotion) {
  if (reducedMotion) return 'animate-fade-in'
  if (direction > 0) return 'animate-pricing-tier-from-right'
  if (direction < 0) return 'animate-pricing-tier-from-left'
  return ''
}

export default function PricingMobileCarousel({ tiers, onJoinWaitlist }) {
  const [activeIndex, setActiveIndex] = useState(DEFAULT_INDEX)
  const [slideDirection, setSlideDirection] = useState(0)
  const cardMinHeight = usePricingCardViewportBudget()
  const reducedMotion = useReducedMotion()
  const pointerStartRef = useRef(null)
  const activeTier = tiers[activeIndex] ?? tiers[DEFAULT_INDEX]

  const goToIndex = useCallback(
    (index) => {
      const next = Math.min(Math.max(index, 0), tiers.length - 1)
      if (next === activeIndex) return
      setSlideDirection(next > activeIndex ? 1 : -1)
      setActiveIndex(next)
    },
    [activeIndex, tiers.length],
  )

  const navigateRelative = useCallback(
    (delta) => {
      goToIndex(activeIndex + delta)
    },
    [activeIndex, goToIndex],
  )

  const handlePointerDown = (event) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerUp = (event) => {
    const start = pointerStartRef.current
    pointerStartRef.current = null

    if (!start || start.id !== event.pointerId) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)

    if (absX >= SWIPE_THRESHOLD_PX && absX > absY * 1.2) {
      if (dx < 0) navigateRelative(1)
      else navigateRelative(-1)
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handlePointerCancel = (event) => {
    pointerStartRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      navigateRelative(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      navigateRelative(1)
    }
  }

  const cardAnimationClass = getTierAnimationClass(slideDirection, reducedMotion)

  return (
    <div onKeyDown={handleKeyDown}>
      <p className="sr-only">Swipe left or right on the plan card to change tiers.</p>

      <div
        className="overflow-hidden"
        style={{ minHeight: cardMinHeight }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          key={activeTier.name}
          id={`pricing-tier-panel-${activeTier.name}`}
          role="tabpanel"
          aria-labelledby={`pricing-tier-tab-${activeTier.name}`}
          className={`touch-pan-y ${cardAnimationClass}`}
          style={{ minHeight: cardMinHeight }}
        >
          <PricingTierCard
            tier={activeTier}
            onJoinWaitlist={onJoinWaitlist}
            presentation={activeTier.highlighted ? 'mobileHero' : 'mobileMuted'}
            foldFeatures
            className="h-full w-full"
            style={{ minHeight: cardMinHeight }}
          />
        </div>
      </div>

      <PricingTierSwitcher tiers={tiers} activeIndex={activeIndex} onSelect={goToIndex} />

      <p className="mt-2 text-center text-xs text-muted-foreground/80">Swipe card to compare plans</p>
    </div>
  )
}
