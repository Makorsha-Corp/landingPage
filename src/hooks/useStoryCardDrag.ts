import { useEffect, useRef, type RefObject } from 'react'
import { formatPercent, parsePercent } from '../pages/Homepage2CardControls'

const CARD_CLAMP_MIN = 2
const CARD_CLAMP_MAX = 98

function clampPercent(value: number): number {
  return Math.min(CARD_CLAMP_MAX, Math.max(CARD_CLAMP_MIN, Math.round(value)))
}

export interface CardPosition {
  x: string
  y: string
}

export interface UseStoryCardDragOptions {
  boundsRef: RefObject<HTMLElement | null>
  card: CardPosition
  onCardChange: (update: Partial<CardPosition>) => void
  enabled: boolean
}

interface DragState {
  active: boolean
  offsetX: number
  offsetY: number
}

export interface UseStoryCardDragReturn {
  handleProps: {
    onPointerDown: (event: React.PointerEvent) => void
    className: string
  }
}

/**
 * Drag story card by top-left corner within boundsRef.
 * Updates card x/y as stage percentages.
 */
export default function useStoryCardDrag({
  boundsRef,
  card,
  onCardChange,
  enabled,
}: UseStoryCardDragOptions): UseStoryCardDragReturn {
  const dragRef = useRef<DragState | null>(null)

  useEffect(() => {
    if (!enabled) return

    const onPointerMove = (event: PointerEvent): void => {
      const drag = dragRef.current
      const bounds = boundsRef?.current
      if (!drag?.active || !bounds) return

      const rect = bounds.getBoundingClientRect()
      const leftX = event.clientX - rect.left - drag.offsetX
      const topY = event.clientY - rect.top - drag.offsetY

      onCardChange({
        x: formatPercent(clampPercent((leftX / rect.width) * 100)),
        y: formatPercent(clampPercent((topY / rect.height) * 100)),
      })
    }

    const onPointerUp = (): void => {
      if (dragRef.current) dragRef.current.active = false
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [boundsRef, enabled, onCardChange])

  const startDrag = (event: React.PointerEvent): void => {
    if (!enabled) return
    const bounds = boundsRef?.current
    if (!bounds) return

    event.preventDefault()
    event.stopPropagation()

    const target = event.currentTarget as HTMLElement
    if (target.setPointerCapture) {
      target.setPointerCapture(event.pointerId)
    }

    const rect = bounds.getBoundingClientRect()
    const leftX = (parsePercent(card.x) / 100) * rect.width
    const topY = (parsePercent(card.y) / 100) * rect.height

    dragRef.current = {
      active: true,
      offsetX: event.clientX - rect.left - leftX,
      offsetY: event.clientY - rect.top - topY,
    }
  }

  return {
    handleProps: {
      onPointerDown: startDrag,
      className: 'cursor-grab touch-none select-none active:cursor-grabbing',
    },
  }
}
