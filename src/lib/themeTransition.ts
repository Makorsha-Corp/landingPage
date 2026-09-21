export interface TransitionOrigin {
  x: number
  y: number
}

export interface ThemeTransitionResult {
  animateIcon: boolean
}

export interface ThemeTransitionOptions {
  origin?: TransitionOrigin
}

function setTransitionOrigin(origin?: TransitionOrigin): void {
  const root = document.documentElement
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
}

function runInstantWithIcon(applyTheme: () => void): ThemeTransitionResult {
  applyTheme()
  return { animateIcon: true }
}

function runWipe(applyTheme: () => void, origin?: TransitionOrigin): ThemeTransitionResult {
  setTransitionOrigin(origin)

  const startViewTransition = (document as { startViewTransition?: (callback: () => void) => void }).startViewTransition?.bind(document)
  if (!startViewTransition) {
    return runInstantWithIcon(applyTheme)
  }

  startViewTransition(() => {
    applyTheme()
  })

  return { animateIcon: true }
}

export function runThemeTransition(
  applyTheme: () => void,
  options?: ThemeTransitionOptions,
): ThemeTransitionResult {
  // Bypass prefers-reduced-motion — theme wipe is core UX (Windows Animation effects off).
  return runWipe(applyTheme, options?.origin)
}

export function originFromMouseEvent(event: MouseEvent | null | undefined): TransitionOrigin | undefined {
  if (!event) return undefined
  return { x: event.clientX, y: event.clientY }
}
