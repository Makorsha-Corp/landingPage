export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
export const lerp = (a, b, t) => a + (b - a) * t
export const smoothstep = (t) => t * t * (3 - 2 * t)

export const HERO_EXIT_DURATION_MS = 650
export const DEFAULT_HERO_FACTORY_BLUR_PX = 4
export const MOBILE_MAX_CAM_SCALE = 1.15
export const MOBILE_FX_CENTER_BIAS = 0.75
export const MOBILE_FY_CENTER_BIAS = 0.75
export const MOBILE_TX_DAMPING = 0.25
export const MOBILE_TY_DAMPING = 0.25
const HERO_EXIT_HOLD = 0.3
export const HERO_TEXT_FADE_END = 0.8
const HERO_BLUR_HOLD = 0.18
const STORY_CARD_FADE_SPAN = 0.25
const STORY_CARD_FADE_START = 1 - STORY_CARD_FADE_SPAN

/** Full blur on hero; gradual unblur through hero→tour exit scroll. */
export function computeHeroBlurOpacity(displayHeroExitT, heroActive) {
  if (heroActive) return 1
  const t = clamp((displayHeroExitT - HERO_BLUR_HOLD) / (1 - HERO_BLUR_HOLD), 0, 1)
  return 1 - smoothstep(t)
}

export function heroExitEase(t) {
  if (t <= HERO_EXIT_HOLD) return 0
  return smoothstep((t - HERO_EXIT_HOLD) / (1 - HERO_EXIT_HOLD))
}

export function stopCardScrollOpacity(scaled, stopIndex) {
  const delta = scaled - stopIndex
  if (Math.abs(delta) < 1e-6) return 1
  if (delta > 0 && delta <= STORY_CARD_FADE_SPAN) {
    return 1 - smoothstep(delta / STORY_CARD_FADE_SPAN)
  }
  if (delta >= -STORY_CARD_FADE_SPAN && delta < 0) {
    return smoothstep((delta + STORY_CARD_FADE_SPAN) / STORY_CARD_FADE_SPAN)
  }
  return 0
}

const BACKGROUND_PARALLAX = 0.3
const BACKGROUND_PARALLAX_Y = 0.15

function tourBgTransform(scale) {
  return `scale(${scale})`
}

export function computeBackgroundTransforms(tx, ty, scale, heroBlend) {
  const panX = tx * BACKGROUND_PARALLAX
  const panY = ty * BACKGROUND_PARALLAX_Y
  const tourMix = 1 - clamp(heroBlend, 0, 1)

  const zoom = 1 + (scale - 1) * BACKGROUND_PARALLAX
  const panExtent = Math.max(Math.abs(panX), Math.abs(panY))
  const upwardPanBoost = Math.max(0, ty) * 0.004
  const tourOverscan =
    1.12 + panExtent * 0.006 + (scale - 1) * 0.08 + upwardPanBoost
  const zoomT = clamp((scale - 1) / 1.5, 0, 1)

  const wrapperPanX = lerp(panX * 0.4, panX, tourMix)
  const wrapperPanY = lerp(panY * 0.4, panY, tourMix)
  const wrapperScale = Math.max(1, lerp(1, zoom, tourMix))
  const imgOverscan = Math.max(1.12, lerp(1, tourOverscan, tourMix))
  const objPosY = lerp(42, lerp(40, 25, zoomT), tourMix)

  return {
    wrapperTransform: `translate(${wrapperPanX}%, ${wrapperPanY}%) scale(${wrapperScale})`,
    imgTransform: tourBgTransform(imgOverscan),
    imgObjectFit: 'cover',
    imgObjectPosition: `50% ${objPosY}%`,
  }
}

function getStopCamera(stop) {
  if (stop.mobileCamera) {
    return {
      fx: stop.mobileCamera.fx,
      fy: stop.mobileCamera.fy,
      scale: stop.mobileCamera.scale,
    }
  }
  return { fx: stop.fx, fy: stop.fy, scale: stop.scale }
}

export function computeTourFrame({
  progress,
  stops,
  heroCamera,
  displayHeroExitT,
  reducedMotion,
  editMode,
  isMobile = false,
  mobileCameraPanMode = false,
}) {
  const heroPanelCount = 1
  const totalPanels = heroPanelCount + stops.length
  const heroSegment = 1 / (totalPanels - 1)
  const heroActive = progress < heroSegment * 0.5
  const heroTextOpacity = 1 - smoothstep(clamp(displayHeroExitT / HERO_TEXT_FADE_END, 0, 1))

  const stopProgress = heroActive
    ? 0
    : clamp((progress - heroSegment) / (1 - heroSegment), 0, 1)

  const segments = stops.length - 1
  const scaled = stopProgress * segments
  const index = clamp(Math.floor(scaled), 0, segments - 1)
  const frac = smoothstep(scaled - index)
  const activeIndex = clamp(Math.round(scaled), 0, stops.length - 1)

  const cardWrapperOpacity =
    displayHeroExitT >= 1
      ? 1
      : smoothstep(clamp((displayHeroExitT - STORY_CARD_FADE_START) / STORY_CARD_FADE_SPAN, 0, 1))

  const storyCardOpacity = heroActive
    ? 0
    : displayHeroExitT < 1
      ? cardWrapperOpacity
      : reducedMotion || editMode
        ? 1
        : stopCardScrollOpacity(scaled, activeIndex)

  const from = stops[index]
  const to = stops[index + 1]
  const fromCam = getStopCamera(from)
  const toCam = getStopCamera(to)
  const fx = lerp(fromCam.fx, toCam.fx, frac)
  const fy = lerp(fromCam.fy, toCam.fy, frac)
  const scale = lerp(fromCam.scale, toCam.scale, frac)

  const heroBlend = heroActive ? 1 : clamp(1 - displayHeroExitT, 0, 1)
  let camFx = lerp(fx, heroCamera.fx, heroBlend)
  let camFy = lerp(fy, heroCamera.fy, heroBlend)
  let camScale = lerp(scale, heroCamera.scale, heroBlend)

  let txDamping = 1
  let tyDamping = 1
  const hasMobileCameraOverride = isMobile && (from.mobileCamera || to.mobileCamera)
  const applyMobileDampening = isMobile && !mobileCameraPanMode && !hasMobileCameraOverride
  if (applyMobileDampening) {
    camFx = lerp(camFx, 0.5, MOBILE_FX_CENTER_BIAS)
    camFy = lerp(camFy, 0.5, MOBILE_FY_CENTER_BIAS)
    camScale = Math.min(camScale, MOBILE_MAX_CAM_SCALE)
    txDamping = MOBILE_TX_DAMPING
    tyDamping = MOBILE_TY_DAMPING
  }

  const tx = (0.5 - camFx) * 100 * camScale * txDamping
  const ty = (0.5 - camFy) * 100 * camScale * tyDamping

  return {
    heroActive,
    activeIndex,
    stopProgress,
    scaled,
    heroTextOpacity,
    storyCardOpacity,
    heroBlurOpacity: computeHeroBlurOpacity(displayHeroExitT, heroActive),
    sharpBgOpacity: heroActive
      ? 0
      : clamp((displayHeroExitT - 0.35) / 0.65, 0, 1),
    displayHeroExitT,
    stageTransform: `translate(${tx}%, ${ty}%) scale(${camScale})`,
    background: computeBackgroundTransforms(tx, ty, camScale, heroBlend),
    tx,
    ty,
    camScale,
    heroBlend,
  }
}

export function exponentialSmoothing(current, target, dtMs, rate = 0.18) {
  const k = 1 - Math.pow(1 - rate, dtMs / 16.67)
  return current + (target - current) * k
}

/** Scroll-linked 0→1 fade for tour→features sections backdrop. */
export function computeTourToFeaturesBackdropProgress(
  scrollerEl,
  featuresEl,
  {
    // Start when Features top hits viewport bottom edge
    fadeStartViewportRatio = 1.0,
    fadeEndViewportRatio = 0.08,
  } = {},
) {
  if (!scrollerEl || !featuresEl) return 0
  const viewportH = scrollerEl.clientHeight
  if (viewportH <= 0) return 0

  const scrollerTop = scrollerEl.getBoundingClientRect().top
  const featuresTop = featuresEl.getBoundingClientRect().top - scrollerTop

  const start = viewportH * fadeStartViewportRatio
  const end = viewportH * fadeEndViewportRatio
  const span = start - end
  if (span <= 0) return featuresTop <= end ? 1 : 0

  return smoothstep(clamp((start - featuresTop) / span, 0, 1))
}

/** Sticky tour stage fades after sections wash has started (avoids early double-dim). */
export function computeTourStageFadeProgress(washProgress) {
  const delayed = clamp((washProgress - 0.2) / 0.8, 0, 1)
  return smoothstep(delayed)
}
