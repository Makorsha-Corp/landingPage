import { useEffect, useRef, useState } from 'react'

import { createPortal } from 'react-dom'

import { navActiveSectionClass, navLinkClass } from '../lib/navChrome'

import useIsMobileTour from '../hooks/useIsMobileTour'

import { cn } from '../lib/cn'



const SWIPE_THRESHOLD_PX = 48

const DISMISS_CLICK_GUARD_MS = 450

const SWIPE_HINT_DURATION_MS = 5000



function SectionDots({ sections, activeIndex, animateHint = false }) {

  return (

    <span

      className={cn(

        'flex shrink-0 flex-col items-center gap-0.5 rounded-full bg-muted/30 px-1 py-1',

        animateHint && 'animate-tour-section-dots-nudge',

      )}

      aria-hidden="true"

    >

      {sections.map((section, index) => (

        <span

          key={section.id}

          className={cn(

            'w-1 rounded-full transition-all duration-200',

            index === activeIndex

              ? animateHint

                ? 'h-2.5 bg-primary/90'

                : 'h-2.5 bg-primary'

              : 'h-1 bg-muted-foreground/40',

          )}

        />

      ))}

    </span>

  )

}



export default function LandingMobileMenu({ sections, activeSection, onNavigate }) {

  const isMobileTour = useIsMobileTour()

  const [open, setOpen] = useState(false)

  const [showSwipeHint, setShowSwipeHint] = useState(true)

  const buttonRef = useRef(null)

  const panelRef = useRef(null)

  const pointerStartRef = useRef(null)

  const suppressTapRef = useRef(false)

  const suppressOpenUntilRef = useRef(0)



  const activeIndex = sections.findIndex((section) => section.id === activeSection)

  const activeSectionMeta = activeIndex >= 0 ? sections[activeIndex] : sections[0]



  const close = () => setOpen(false)



  const navigateRelative = (delta) => {

    const nextIndex = activeIndex + delta

    if (nextIndex < 0 || nextIndex >= sections.length) return

    onNavigate?.(sections[nextIndex].id)

  }



  const handleNavigate = (sectionId) => {

    onNavigate?.(sectionId)

    close()

  }



  const handlePointerDown = (event) => {

    pointerStartRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId }

    suppressTapRef.current = false

    event.currentTarget.setPointerCapture(event.pointerId)

  }



  const handlePointerMove = (event) => {

    const start = pointerStartRef.current

    if (!start || start.id !== event.pointerId) return



    const dx = event.clientX - start.x

    const dy = event.clientY - start.y

    const absX = Math.abs(dx)

    const absY = Math.abs(dy)



    // Stop the page scroller from hijacking vertical swipes meant for section change.

    if (absY > 6 && absY > absX * 1.2) {

      event.preventDefault()

    }

  }



  const handlePointerUp = (event) => {

    const start = pointerStartRef.current

    pointerStartRef.current = null



    if (!start || start.id !== event.pointerId) return



    const dx = event.clientX - start.x

    const dy = event.clientY - start.y

    const absX = Math.abs(dx)

    const absY = Math.abs(dy)



    if (absY >= SWIPE_THRESHOLD_PX && absY > absX * 1.2) {

      suppressTapRef.current = true

      if (dy < 0) navigateRelative(1)

      else navigateRelative(-1)

      close()

      return

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



  const armDismissGuard = () => {

    suppressTapRef.current = true

    suppressOpenUntilRef.current = Date.now() + DISMISS_CLICK_GUARD_MS

  }



  const shouldSuppressOpen = () =>

    suppressTapRef.current || Date.now() < suppressOpenUntilRef.current



  const handleClick = () => {

    if (shouldSuppressOpen()) {

      suppressTapRef.current = false

      return

    }



    if (open) {

      close()

      return

    }



    setOpen(true)

  }



  const dismissFromBackdrop = (event) => {

    event.preventDefault()

    event.stopPropagation()

    armDismissGuard()

    close()

  }



  useEffect(() => {

    const timer = window.setTimeout(() => setShowSwipeHint(false), SWIPE_HINT_DURATION_MS)

    return () => window.clearTimeout(timer)

  }, [])



  useEffect(() => {

    if (!open) return undefined



    const onKeyDown = (event) => {

      if (event.key === 'Escape') close()

    }



    window.addEventListener('keydown', onKeyDown)

    return () => {

      window.removeEventListener('keydown', onKeyDown)

    }

  }, [open])



  if (!isMobileTour) return null



  const animateSwipeHint = showSwipeHint && !open



  return (

    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 max-w-[calc(100%-8.5rem)] -translate-x-1/2 -translate-y-1/2 md:hidden">

      <button

        ref={buttonRef}

        type="button"

        onPointerDown={handlePointerDown}

        onPointerMove={handlePointerMove}

        onPointerUp={handlePointerUp}

        onPointerCancel={handlePointerCancel}

        onClick={handleClick}

        aria-expanded={open}

        aria-haspopup="dialog"

        aria-label={`${activeSectionMeta?.label ?? 'Section'}. Swipe up or down to change section. Tap to open section list.`}

        className="pointer-events-auto flex min-h-10 max-w-full touch-none flex-row items-center gap-2 px-2 py-1 active:opacity-70"

      >

        <span

          className={`truncate text-base font-bold leading-none tracking-tight transition-colors duration-200 ${

            open

              ? 'text-primary underline decoration-primary/40 underline-offset-4'

              : 'text-foreground'

          }`}

        >

          {activeSectionMeta?.label ?? 'Section'}

        </span>

        <SectionDots

          sections={sections}

          activeIndex={activeIndex >= 0 ? activeIndex : 0}

          animateHint={animateSwipeHint}

        />

      </button>



      {open && typeof document !== 'undefined'

        ? createPortal(

            <div className="fixed inset-0 z-[110] md:hidden" role="presentation">

              <div

                className="absolute inset-0 bg-black/40"

                aria-hidden="true"

                onPointerUp={dismissFromBackdrop}

                onClick={dismissFromBackdrop}

              />

              <div

                ref={panelRef}

                role="dialog"

                aria-label="Page sections"

                onPointerDown={(event) => event.stopPropagation()}

                onClick={(event) => event.stopPropagation()}

                className="absolute left-4 right-4 top-[calc(env(safe-area-inset-top,0px)+4.25rem)] overflow-hidden rounded-2xl border border-border/70 bg-background/98 shadow-2xl backdrop-blur-md"

              >

                <nav className="flex flex-col p-2">

                  {sections.map((section) => {

                    const isActive = activeSection === section.id

                    return (

                      <button

                        key={section.id}

                        type="button"

                        onClick={() => handleNavigate(section.id)}

                        className={`rounded-xl px-4 py-3 text-left text-sm font-medium ${

                          isActive ? navActiveSectionClass : navLinkClass

                        }`}

                        aria-current={isActive ? 'true' : undefined}

                      >

                        {section.label}

                      </button>

                    )

                  })}

                </nav>

              </div>

            </div>,

            document.body,

          )

        : null}

    </div>

  )

}

