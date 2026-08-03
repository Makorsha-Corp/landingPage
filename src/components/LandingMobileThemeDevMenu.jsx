import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../context/ThemeContext'
import { navIconButtonClass } from '../lib/navChrome'
import { cn } from '../lib/cn'
import DevToolsPopover from './DevToolsPopover'

export default function LandingMobileThemeDevMenu({ devToolsProps }) {
  const { theme, iconAnimating, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [devToolsOpen, setDevToolsOpen] = useState(false)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const iconClass = `h-5 w-5 shrink-0${iconAnimating ? ' theme-toggle-icon--animate' : ''}`

  useEffect(() => {
    if (!menuOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    const onPointerDown = (event) => {
      const target = event.target
      if (panelRef.current?.contains(target)) return
      if (buttonRef.current?.contains(target)) return
      setMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  const openDevTools = () => {
    setMenuOpen(false)
    setDevToolsOpen(true)
  }

  return (
    <div className="relative md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        className={cn(
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
          navIconButtonClass,
          menuOpen ? 'border-brand-primary bg-brand-primary text-white hover:bg-brand-primary hover:text-white' : '',
        )}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Appearance and dev tools"
      >
        {theme === 'light' ? (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>

      {menuOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-[110] md:hidden" role="presentation">
              <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
              <div
                ref={panelRef}
                role="menu"
                aria-label="Appearance and dev tools"
                className="absolute right-4 top-[calc(env(safe-area-inset-top,0px)+4.25rem)] w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/70 bg-background/98 p-2 shadow-2xl backdrop-blur-md"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={(event) => toggleTheme(event)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {theme === 'light' ? (
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                  <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={openDevTools}
                  className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <span>Dev tools</span>
                  <span className="text-xs text-muted-foreground">Homepage</span>
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}

      <DevToolsPopover
        {...devToolsProps}
        showTrigger={false}
        open={devToolsOpen}
        onOpenChange={setDevToolsOpen}
      />
    </div>
  )
}
