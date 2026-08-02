import { useEffect, useRef } from 'react'
import { formatPercent, parsePercent } from '../pages/Homepage2CardControls'

const CARD_CLAMP_MIN = 2
const CARD_CLAMP_MAX = 98

function clampPercent(value) {
  return Math.min(CARD_CLAMP_MAX, Math.max(CARD_CLAMP_MIN, Math.round(value)))
}

/**
 * Drag a tour story card anchor point within boundsRef.
 * Updates card x/y as percentages (same coords as dpad / DEFAULT_STOPS).
 */
export default function useStoryCardDrag({ boundsRef, card, onCardChange, enabled }) {
  const dragRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const onPointerMove = (event) => {
      const drag = dragRef.current
      const bounds = boundsRef?.current
      if (!drag?.active || !bounds) return

      const rect = bounds.getBoundingClientRect()
      const anchorX = event.clientX - rect.left - drag.offsetX
      const anchorY = event.clientY - rect.top - drag.offsetY

      onCardChange({
        x: formatPercent(clampPercent((anchorX / rect.width) * 100)),
        y: formatPercent(clampPercent((anchorY / rect.height) * 100)),
      })
    }

    const onPointerUp = () => {
      if (dragRef.current) dragRef.current.active = false
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [boundsRef, enabled, onCardChange])

  const startDrag = (event) => {
    if (!enabled) return
    const bounds = boundsRef?.current
    if (!bounds) return

    event.preventDefault()
    event.stopPropagation()

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    const rect = bounds.getBoundingClientRect()
    const anchorX = (parsePercent(card.x) / 100) * rect.width
    const anchorY = (parsePercent(card.y) / 100) * rect.height

    dragRef.current = {
      active: true,
      offsetX: event.clientX - rect.left - anchorX,
      offsetY: event.clientY - rect.top - anchorY,
    }
  }

  return {
    handleProps: {
      onPointerDown: startDrag,
      className: 'cursor-grab touch-none select-none active:cursor-grabbing',
    },
  }
}
