import { useEffect, useRef, useState } from 'react'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Drag a panel within boundsRef (or window). Returns style + handle props.
 * Position is session-only pixels from top-left of the boundary box.
 */
export default function useFloatingPanelDrag({
  boundsRef,
  panelRef,
  defaultPosition = { x: null, y: null },
  margin = 12,
}) {
  const [position, setPosition] = useState(defaultPosition)
  const dragRef = useRef(null)

  useEffect(() => {
    const onPointerMove = (event) => {
      const drag = dragRef.current
      const bounds = boundsRef?.current
      const panel = panelRef?.current
      if (!drag?.active || !bounds || !panel) return

      const rect = bounds.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      const maxX = Math.max(margin, rect.width - panelRect.width - margin)
      const maxY = Math.max(margin, rect.height - panelRect.height - margin)

      const nextX = clamp(event.clientX - rect.left - drag.offsetX, margin, maxX)
      const nextY = clamp(event.clientY - rect.top - drag.offsetY, margin, maxY)
      setPosition({ x: nextX, y: nextY })
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
  }, [boundsRef, panelRef, margin])

  const startDrag = (event) => {
    const bounds = boundsRef?.current
    const panel = panelRef?.current
    if (!bounds || !panel) return

    event.preventDefault()
    const rect = bounds.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    const currentX = position.x ?? panelRect.left - rect.left
    const currentY = position.y ?? panelRect.top - rect.top

    dragRef.current = {
      active: true,
      offsetX: event.clientX - rect.left - currentX,
      offsetY: event.clientY - rect.top - currentY,
    }

    if (position.x == null || position.y == null) {
      setPosition({ x: currentX, y: currentY })
    }
  }

  const panelStyle =
    position.x != null && position.y != null
      ? { left: `${position.x}px`, top: `${position.y}px`, right: 'auto', bottom: 'auto' }
      : { right: '1.5rem', bottom: '1.5rem' }

  return {
    panelStyle,
    handleProps: {
      onPointerDown: startDrag,
      className: 'cursor-grab touch-none select-none active:cursor-grabbing',
    },
  }
}
