import { useEffect, useRef, useState } from 'react'
import Button from './ui/Button'
import NavLayoutToggle from './NavLayoutToggle'

const activeCls =
  'border-brand-primary bg-brand-primary text-white hover:bg-brand-primary hover:text-white'

export default function DevToolsPopover({
  editMode,
  onToggleEditMode,
  factoryPanMode,
  onToggleFactoryPanMode,
  barVariant,
  onCycleBarVariant,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const menuBtnCls = 'shrink-0 whitespace-nowrap'

  return (
    <div ref={rootRef} className="relative z-[60]">
      {open ? (
        <div
          role="menu"
          aria-label="Dev tools"
          className="absolute right-full top-1/2 z-[60] mr-2 flex -translate-y-1/2 items-center gap-1 rounded-xl border border-border/70 bg-background/95 p-1.5 shadow-lg backdrop-blur-md"
        >
          <Button
            type="button"
            role="menuitem"
            onClick={onToggleEditMode}
            variant="navGhost"
            size="sm"
            className={`${menuBtnCls} ${editMode ? activeCls : ''}`}
            aria-label="Toggle card edit mode"
            aria-pressed={editMode}
          >
            Edit mode
          </Button>
          <Button
            type="button"
            role="menuitem"
            onClick={onToggleFactoryPanMode}
            variant="navGhost"
            size="sm"
            className={`${menuBtnCls} ${factoryPanMode ? activeCls : ''}`}
            aria-label="Toggle factory pan on hero"
            aria-pressed={factoryPanMode}
          >
            Factory pan
          </Button>
          <Button
            type="button"
            role="menuitem"
            onClick={onCycleBarVariant}
            variant="navGhost"
            size="sm"
            className={menuBtnCls}
            aria-label="Cycle right-bar design"
          >
            Bar: {barVariant}
          </Button>
          <NavLayoutToggle className="!inline-flex shrink-0" />
        </div>
      ) : null}

      <Button
        type="button"
        variant="navGhost"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open dev tools"
        className={open ? activeCls : ''}
      >
        Dev tools
      </Button>
    </div>
  )
}
