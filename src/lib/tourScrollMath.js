export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
export const lerp = (a, b, t) => a + (b - a) * t
export const smoothstep = (t) => t * t * (3 - 2 * t)

export const DEFAULT_HERO_FACTORY_BLUR_PX = 4
export const MOBILE_MAX_CAM_SCALE = 1.15
export const MOBILE_FX_CENTER_BIAS = 0.75
export const MOBILE_FY_CENTER_BIAS = 0.75
export const MOBILE_TX_DAMPING = 0.25
export const MOBILE_TY_DAMPING = 0.25
export const HERO_TEXT_FADE_END = 0.8
const HERO_BLUR_HOLD = 0.18
const STORY_CARD_FADE_SPAN = 0.25
const STORY_CARD_FADE_START = 0

export const DEFAULT_TOUR_TRANSITION_SPEED = 0.75
export const DEFAULT_TOUR_CARD_CONTENT_SPEED = 1
export const TOUR_SCROLL_LOCK_SPEED = 1
export const TOUR_TRANSITION_SPEED_MIN = 0.25
export const TOUR_TRANSITION_SPEED_MAX = 4
export const BASE_TOUR_CAMERA_SMOOTH_RATE = 0.18
export const BASE_TOUR_BLUR_SMOOTH_RATE = 0.14
export const BASE_TOUR_HERO_EXIT_SMOOTH_RATE = 0.2
export const BASE_TOUR_CARD_SMOOTH_RATE = 0.18
export const BASE_TOUR_CONTENT_SMOOTH_RATE = 0.18
export const BASE_TOUR_CARD_SIZE_SMOOTH_RATE = 0.18

export const CARD_COPY_HOLD_OUT = 0.18
export const CARD_COPY_FADE_OUT_END = 0.45
export const CARD_COPY_FADE_IN_START = 0.55
export const CARD_COPY_HOLD_IN = 0.82
export const CARD_COPY_SLIDE_PX = 8

export function computeCardCopyPhase(t) {
  if (t <= CARD_COPY_FADE_OUT_END) {
    const p = smoothstep(
      clamp((t - CARD_COPY_HOLD_OUT) / (CARD_COPY_FADE_OUT_END - CARD_COPY_HOLD_OUT), 0, 1),
    )
    return { opacity: 1 - p, offsetY: CARD_COPY_SLIDE_PX * p, useNextStop: false }
  }
  const p = smoothstep(
    clamp((t - CARD_COPY_FADE_IN_START) / (CARD_COPY_HOLD_IN - CARD_COPY_FADE_IN_START), 0, 1),
  )
  return { opacity: p, offsetY: -CARD_COPY_SLIDE_PX * (1 - p), useNextStop: true }
}

export function getTourSmoothRate(baseRate, speed = DEFAULT_TOUR_TRANSITION_SPEED) {
  return clamp(baseRate * speed, 0.01, 0.95)
}

/** Full blur on hero; gradual unblur through hero→tour exit scroll. */
export function computeHeroBlurOpacity(displayHeroExitT, heroActive) {
  if (heroActive) return 1
  const t = clamp((displayHeroExitT - HERO_BLUR_HOLD) / (1 - HERO_BLUR_HOLD), 0, 1)
  return 1 - smoothstep(t)
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

const DEFAULT_CARD_LAYOUT = {
  x: '6%',
  y: '50%',
  widthPx: 640,
  heightPx: null,
  maxWidthVw: 92,
}

export function parseCardPercent(value) {
  if (typeof value === 'number') return value
  const n = parseFloat(String(value || '0').replace('%', ''))
  return Number.isFinite(n) ? n : 0
}

function normalizeCardForLerp(card) {
  return { ...DEFAULT_CARD_LAYOUT, ...(card || {}) }
}

function lerpNullable(a, b, t) {
  if (a == null && b == null) return null
  if (a == null) return b
  if (b == null) return a
  return lerp(a, b, t)
}

export const DEFAULT_STAGE_WIDTH_PX = 1280
export const DEFAULT_CARD_HEIGHT_PX = 200

export function getCardWidthPx(card, stageWidthPx) {
  const normalized = normalizeCardForLerp(card)
  const widthPx = normalized.widthPx ?? DEFAULT_CARD_LAYOUT.widthPx
  const maxWidthVw = normalized.maxWidthVw ?? DEFAULT_CARD_LAYOUT.maxWidthVw
  if (stageWidthPx <= 0) return widthPx
  const maxFromVw = (maxWidthVw / 100) * stageWidthPx
  return Math.min(widthPx, maxFromVw)
}

/** Card x/y (top-left %) → absolute top-left bbox in stage px. */
export function cardToAbsoluteTopLeft(card, stageWidthPx, stageHeightPx) {
  const normalized = normalizeCardForLerp(card)
  const effectiveStageW = stageWidthPx > 0 ? stageWidthPx : DEFAULT_STAGE_WIDTH_PX
  const effectiveStageH =
    stageHeightPx > 0 ? stageHeightPx : effectiveStageW * (9 / 16)

  return {
    leftPx: (parseCardPercent(normalized.x) / 100) * effectiveStageW,
    topPx: (parseCardPercent(normalized.y) / 100) * effectiveStageH,
  }
}

export function computeInterpolatedCard(fromCard, toCard, frac, layout = {}) {
  const { stageWidthPx = 0, stageHeightPx = 0 } = layout

  const from = normalizeCardForLerp(fromCard)
  const to = normalizeCardForLerp(toCard)

  const fromAbs = cardToAbsoluteTopLeft(from, stageWidthPx, stageHeightPx)
  const toAbs = cardToAbsoluteTopLeft(to, stageWidthPx, stageHeightPx)

  return {
    positioning: 'absolute',
    leftPx: lerp(fromAbs.leftPx, toAbs.leftPx, frac),
    topPx: lerp(fromAbs.topPx, toAbs.topPx, frac),
    widthPx: Math.round(
      lerp(getCardWidthPx(from, stageWidthPx), getCardWidthPx(to, stageWidthPx), frac),
    ),
    heightPx: lerpNullable(from.heightPx, to.heightPx, frac),
    maxWidthVw: lerp(from.maxWidthVw, to.maxWidthVw, frac),
  }
}

export function getStoryCardAbsoluteWrapperStyle(card) {
  return {
    left: `${card.leftPx}px`,
    top: `${card.topPx}px`,
    transform: 'none',
  }
}

export function getStoryCardWrapperStyle(card) {
  const normalized = normalizeCardForLerp(card)
  return {
    left: normalized.x,
    top: normalized.y,
    transform: 'none',
  }
}

export function getStoryCardInnerSizeStyle(card, stageWidthPx = 0) {
  const normalized = normalizeCardForLerp(card)
  const widthPx = getCardWidthPx(normalized, stageWidthPx)
  return {
    width: `${widthPx}px`,
    maxWidth: `${normalized.maxWidthVw}vw`,
    ...(normalized.heightPx
      ? { height: `${normalized.heightPx}px`, overflowY: 'auto' }
      : {}),
  }
}

export function cardAtAbsoluteRest(stop, card, stageWidthPx, stageHeightPx) {
  const normalized = normalizeCardForLerp(card)
  const abs = cardToAbsoluteTopLeft(normalized, stageWidthPx, stageHeightPx)
  return {
    positioning: 'absolute',
    leftPx: abs.leftPx,
    topPx: abs.topPx,
    widthPx: getCardWidthPx(normalized, stageWidthPx),
    heightPx: normalized.heightPx,
    maxWidthVw: normalized.maxWidthVw,
  }
}

export function computeTourFrame({
  progress,
  stops,
  heroCamera,
  heroMobileCamera = null,
  displayHeroExitT,
  reducedMotion,
  editMode,
  isMobile = false,
  mobileCameraPanMode = false,
  stageWidthPx = 0,
  stageHeightPx = 0,
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
  const segmentIndex = clamp(Math.floor(scaled), 0, segments - 1)
  const segmentFrac = smoothstep(scaled - segmentIndex)
  const index = segmentIndex
  const frac = segmentFrac
  const activeIndex =
    segments <= 0 ? 0 : clamp(Math.round(scaled), 0, stops.length - 1)

  const cardWrapperOpacity =
    displayHeroExitT >= 1
      ? 1
      : smoothstep(clamp((displayHeroExitT - STORY_CARD_FADE_START) / STORY_CARD_FADE_SPAN, 0, 1))

  const storyCardOpacity = heroActive
    ? 0
    : editMode || reducedMotion || displayHeroExitT >= 1
      ? 1
      : cardWrapperOpacity

  const from = stops[index]
  const to = stops[index + 1]
  const fromCam = getStopCamera(from)
  const toCam = getStopCamera(to)
  const fx = lerp(fromCam.fx, toCam.fx, frac)
  const fy = lerp(fromCam.fy, toCam.fy, frac)
  const scale = lerp(fromCam.scale, toCam.scale, frac)

  const heroBlend = heroActive ? 1 : clamp(1 - displayHeroExitT, 0, 1)
  const activeHeroCamera =
    isMobile && heroMobileCamera ? heroMobileCamera : heroCamera
  let camFx = lerp(fx, activeHeroCamera.fx, heroBlend)
  let camFy = lerp(fy, activeHeroCamera.fy, heroBlend)
  let camScale = lerp(scale, activeHeroCamera.scale, heroBlend)

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

  let interpolatedCard = null
  if (!heroActive && !editMode) {
    const fromCard = from?.card
    const toCard = to?.card
    if (reducedMotion) {
      const restStop = stops[activeIndex] ?? from
      interpolatedCard = cardAtAbsoluteRest(
        restStop,
        restStop?.card ?? fromCard,
        stageWidthPx,
        stageHeightPx,
      )
    } else if (to) {
      interpolatedCard = computeInterpolatedCard(fromCard, toCard, frac, {
        stageWidthPx,
        stageHeightPx,
      })
    } else {
      interpolatedCard = cardAtAbsoluteRest(
        from,
        fromCard,
        stageWidthPx,
        stageHeightPx,
      )
    }
  }

  return {
    heroActive,
    activeIndex,
    segmentIndex,
    segmentFrac,
    interpolatedCard,
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
