export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function setTransitionOrigin(origin) {
  const root = document.documentElement
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
}

function runInstantWithIcon(applyTheme) {
  applyTheme()
  return { animateIcon: true }
}

function runWipe(applyTheme, origin) {
  setTransitionOrigin(origin)

  const startViewTransition = document.startViewTransition?.bind(document)
  if (!startViewTransition) {
    return runInstantWithIcon(applyTheme)
  }

  startViewTransition(() => {
    applyTheme()
  })

  return { animateIcon: true }
}

export function runThemeTransition(applyTheme, options) {
  return runWipe(applyTheme, options?.origin)
}

export function originFromMouseEvent(event) {
  if (!event) return undefined
  return { x: event.clientX, y: event.clientY }
}
