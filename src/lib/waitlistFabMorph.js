export const MORPH_EXPAND_DURATION_MS = 480

export const MORPH_COLLAPSE_DURATION_MS = 420

export const MORPH_EXPAND_EASING = 'cubic-bezier(0.34, 1.24, 0.64, 1)'

export const MORPH_COLLAPSE_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'

export const MORPH_BACKDROP_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'

export const MORPH_BACKDROP_MAX_OPACITY = 0.6

export const PANEL_REVEAL_DURATION_MS = 420

export const PANEL_REVEAL_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'

export const MORPH_MODAL_BORDER_RADIUS = '24px'

export const MORPH_DEFAULT_ORIGIN_BORDER_RADIUS = '8px'

/** Rounded-rect morph start — avoids pill FAB `rounded-full` producing oval expand shells. */
export const MORPH_ORIGIN_BORDER_RADIUS = '12px'

export const MORPH_SHELL_TRANSITION_PROPS = ['left', 'top', 'width', 'height', 'border-radius', 'box-shadow']



/** @deprecated Use MORPH_EXPAND_DURATION_MS or MORPH_COLLAPSE_DURATION_MS */

export const MORPH_DURATION_MS = MORPH_EXPAND_DURATION_MS

/** @deprecated Use MORPH_EXPAND_EASING or MORPH_COLLAPSE_EASING */

export const MORPH_EASING = MORPH_EXPAND_EASING



export const MORPH_SHELL_SHADOW_COLLAPSED =

  '0 10px 28px -6px hsl(var(--primary) / 0.4), 0 0 0 1px hsl(var(--primary) / 0.15)'

export const MORPH_SHELL_SHADOW_EXPANDED =

  '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px hsl(var(--border) / 0.7)'



const MODAL_MAX_WIDTH_PX = 960

const MODAL_WIDTH_VW = 0.94

const MODAL_MAX_HEIGHT_VH = 0.85

const MODAL_FALLBACK_HEIGHT_PX = 704



export function getWaitlistModalTargetRect(viewport = typeof window !== 'undefined' ? window : null) {

  if (!viewport) {

    return { left: 0, top: 0, width: MODAL_MAX_WIDTH_PX, height: MODAL_FALLBACK_HEIGHT_PX }

  }



  const width = Math.min(MODAL_MAX_WIDTH_PX, viewport.innerWidth * MODAL_WIDTH_VW)

  const height = Math.min(viewport.innerHeight * MODAL_MAX_HEIGHT_VH, MODAL_FALLBACK_HEIGHT_PX)



  return {

    left: (viewport.innerWidth - width) / 2,

    top: (viewport.innerHeight - height) / 2,

    width,

    height,

  }

}



function parseLeadingRadiusValue(borderRadius) {
  if (!borderRadius) return null
  const leading = borderRadius.trim().split(/\s+/)[0]
  if (!leading) return null

  if (leading.includes('9999')) {
    return { kind: 'pill' }
  }

  if (leading.endsWith('%')) {
    const value = parseFloat(leading)
    if (!Number.isFinite(value)) return null
    return { kind: 'percent', value }
  }

  const value = parseFloat(leading)
  if (!Number.isFinite(value)) return null
  return { kind: 'px', value }
}

/**
 * Clamp pill-like trigger radii so morph expand uses a hero-style rounded rect, not an oval.
 */
export function normalizeMorphOriginRadius(borderRadius, rect) {
  const fallback = MORPH_ORIGIN_BORDER_RADIUS
  const raw = borderRadius?.trim() || fallback
  const parsed = parseLeadingRadiusValue(raw)

  if (!parsed) return raw

  if (parsed.kind === 'pill') return fallback

  if (parsed.kind === 'percent' && parsed.value >= 50) return fallback

  if (parsed.kind === 'px') {
    if (parsed.value > 20) return fallback

    if (rect && rect.width > 0 && rect.height > 0) {
      const minDim = Math.min(rect.width, rect.height)
      if (parsed.value >= minDim / 2 - 1) return fallback
    }
  }

  return raw
}

export function getOriginChrome(element) {

  if (!element || typeof window === 'undefined') {

    return { borderRadius: MORPH_DEFAULT_ORIGIN_BORDER_RADIUS }

  }



  const style = window.getComputedStyle(element)

  const raw = style.borderRadius?.trim() || MORPH_DEFAULT_ORIGIN_BORDER_RADIUS
  const rect = element.getBoundingClientRect?.()
  const borderRadius = normalizeMorphOriginRadius(raw, rect)



  return { borderRadius }

}



export function resolveTravelBg(meta = {}) {

  if (meta.travelBg) return meta.travelBg

  if (meta.face === 'rainbow') return 'primary'

  if (meta.variant === 'marketing' || meta.variant === 'heroGlass') return 'brand-secondary'

  if (meta.variant === 'outline' || meta.variant === 'marketingOutline') return 'card'

  return 'primary'

}



export function getMorphShellStyle(fromRect, toRect, collapsed, reducedMotion, options = {}) {

  if (!fromRect) return null



  const { collapsing = false, originRadius = MORPH_DEFAULT_ORIGIN_BORDER_RADIUS } = options

  const durationMs = collapsing ? MORPH_COLLAPSE_DURATION_MS : MORPH_EXPAND_DURATION_MS

  const easing = collapsing ? MORPH_COLLAPSE_EASING : MORPH_EXPAND_EASING

  const targetRect = toRect ?? getWaitlistModalTargetRect()

  const frame = collapsed ? fromRect : targetRect

  const radiusDurationMs = collapsing
    ? durationMs
    : Math.round(durationMs * 0.4)



  return {

    position: 'fixed',

    left: frame.left,

    top: frame.top,

    width: frame.width,

    height: frame.height,

    borderRadius: collapsed ? originRadius : MORPH_MODAL_BORDER_RADIUS,

    transform: 'none',

    zIndex: 201,

    boxShadow: collapsed ? MORPH_SHELL_SHADOW_COLLAPSED : MORPH_SHELL_SHADOW_EXPANDED,

    transition: reducedMotion

      ? undefined

      : `left ${durationMs}ms ${easing}, top ${durationMs}ms ${easing}, width ${durationMs}ms ${easing}, height ${durationMs}ms ${easing}, border-radius ${radiusDurationMs}ms ${easing}, box-shadow ${durationMs}ms ${easing}`,

  }

}



export function isMorphShellTransitionProperty(propertyName) {

  return MORPH_SHELL_TRANSITION_PROPS.includes(propertyName)

}



export function cloneRect(rect) {

  if (!rect) return null

  return {

    left: rect.left,

    top: rect.top,

    width: rect.width,

    height: rect.height,

    right: rect.right,

    bottom: rect.bottom,

  }

}

/**
 * Morph origin from settled button box — strips in-flight hero FLIP scale on FAB wrap.
 */
export function getSettledTriggerRect(triggerEl) {
  if (!triggerEl?.getBoundingClientRect) return null

  const wrapEl = triggerEl.closest?.('[data-waitlist-fab-wrap]')
  if (!wrapEl?.style) {
    return cloneRect(triggerEl.getBoundingClientRect())
  }

  const prevTransform = wrapEl.style.transform
  const prevTransition = wrapEl.style.transition
  wrapEl.style.transform = 'none'
  wrapEl.style.transition = 'none'
  const rect = cloneRect(triggerEl.getBoundingClientRect())
  wrapEl.style.transform = prevTransform
  wrapEl.style.transition = prevTransition

  return rect
}

export function markWaitlistMorphOrigin(element) {

  if (!element?.setAttribute) return

  element.setAttribute('data-waitlist-morph-origin', '')

  element.classList.add('waitlist-morph-origin-hidden')

}



export function clearWaitlistMorphOrigin() {

  if (typeof document === 'undefined') return

  document.querySelectorAll('[data-waitlist-morph-origin]').forEach((element) => {

    element.removeAttribute('data-waitlist-morph-origin')

    element.classList.remove('waitlist-morph-origin-hidden')

  })

}


