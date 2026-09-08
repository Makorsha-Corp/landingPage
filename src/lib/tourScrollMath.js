export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
export const lerp = (a, b, t) => a + (b - a) * t
export const smoothstep = (t) => t * t * (3 - 2 * t)

export const MOBILE_MAX_CAM_SCALE = 1.15
export const MOBILE_FX_CENTER_BIAS = 0.75
export const MOBILE_FY_CENTER_BIAS = 0.75
export const MOBILE_TX_DAMPING = 0.25
export const MOBILE_TY_DAMPING = 0.25
export const HERO_TEXT_FADE_END = 0.8
export const HERO_SCRIM_FADE_END = 0.42
const HERO_BLUR_HOLD = 0.18

export const DEFAULT_TOUR_TRANSITION_SPEED = 0.75
export const DEFAULT_TOUR_CARD_CONTENT_SPEED = 1
export const TOUR_SCROLL_LOCK_SPEED = 1
export const TOUR_TRANSITION_SPEED_MIN = 0.25
export const TOUR_TRANSITION_SPEED_MAX = 4
export const BASE_TOUR_CAMERA_SMOOTH_RATE = 0.18
export const BASE_TOUR_BLUR_SMOOTH_RATE = 0.14
export const BASE_TOUR_HERO_EXIT_SMOOTH_RATE = 0.32
export const BASE_TOUR_HERO_SCRIM_SMOOTH_RATE = 0.6
export const BASE_TOUR_CARD_SMOOTH_RATE = 0.18
export const BASE_TOUR_CONTENT_SMOOTH_RATE = 0.18
export const BASE_TOUR_CARD_SIZE_SMOOTH_RATE = 0.18

export const CARD_COPY_HOLD_OUT = 0.18
export const CARD_COPY_FADE_OUT_END = 0.45
export const CARD_COPY_FADE_IN_START = 0.55
export const CARD_COPY_HOLD_IN = 0.82
export const CARD_COPY_SLIDE_PX = 8

export const HERO_EXIT_COPY_OUT_START = 0.06
export const HERO_EXIT_COPY_OUT_END = 0.44
export const HERO_EXIT_COPY_IN_START = 0.30
export const HERO_EXIT_COPY_IN_END = 0.78

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

/** Overlapping hero→story copy crossfade during hero exit (desktop + mobile). */
export function computeHeroExitCopyPhase(t) {
  const clampedT = clamp(t, 0, 1)

  let heroOpacity = 1
  let heroOffsetY = 0
  if (clampedT <= HERO_EXIT_COPY_OUT_END) {
    const outP =
      clampedT <= HERO_EXIT_COPY_OUT_START
        ? 0
        : smoothstep(
            (clampedT - HERO_EXIT_COPY_OUT_START) /
              (HERO_EXIT_COPY_OUT_END - HERO_EXIT_COPY_OUT_START),
          )
    heroOpacity = 1 - outP
    heroOffsetY = CARD_COPY_SLIDE_PX * outP
  } else {
    heroOpacity = 0
    heroOffsetY = CARD_COPY_SLIDE_PX
  }

  let storyOpacity = 0
  let storyOffsetY = -CARD_COPY_SLIDE_PX
  if (clampedT >= HERO_EXIT_COPY_IN_START) {
    const inP =
      clampedT >= HERO_EXIT_COPY_IN_END
        ? 1
        : smoothstep(
            (clampedT - HERO_EXIT_COPY_IN_START) /
              (HERO_EXIT_COPY_IN_END - HERO_EXIT_COPY_IN_START),
          )
    storyOpacity = inP
    storyOffsetY = -CARD_COPY_SLIDE_PX * (1 - inP)
  }

  return { heroOpacity, storyOpacity, heroOffsetY, storyOffsetY }
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

/** Fast ease-out scrim lift — decoupled from hero copy fade. */
export function computeHeroScrimOpacity(scrimExitT, heroActive) {
  if (heroActive) return 1
  const t = clamp(scrimExitT / HERO_SCRIM_FADE_END, 0, 1)
  const eased = 1 - (1 - t) ** 2
  return 1 - eased
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
export const COMPACT_TOUR_STAGE_MAX_PX = DEFAULT_STAGE_WIDTH_PX
export const CARD_STAGE_RIGHT_GUTTER_PX = 80
export const CARD_STAGE_EDGE_PADDING_PX = 16
export const CARD_MIN_WIDTH_PX = 320
export const CARD_MIN_HEIGHT_PX = DEFAULT_CARD_HEIGHT_PX
export const CARD_AUTO_HEIGHT_ESTIMATE_PX = DEFAULT_CARD_HEIGHT_PX
export const COMPACT_CARD_MAX_WIDTH_RATIO = 0.68
/** Vertical padding on story card inner (`p-6` × 2) — for content shell min-height cap. */
export const CARD_INNER_PADDING_Y_PX = 48

function isCompactTourStage(stageWidthPx) {
  return stageWidthPx > 0 && stageWidthPx < COMPACT_TOUR_STAGE_MAX_PX
}

export function getCardWidthPx(card, stageWidthPx) {
  const normalized = normalizeCardForLerp(card)
  const widthPx = normalized.widthPx ?? DEFAULT_CARD_LAYOUT.widthPx
  const maxWidthVw = normalized.maxWidthVw ?? DEFAULT_CARD_LAYOUT.maxWidthVw
  if (stageWidthPx <= 0) return widthPx
  const maxFromVw = (maxWidthVw / 100) * stageWidthPx
  let resolved = Math.min(widthPx, maxFromVw)
  if (isCompactTourStage(stageWidthPx)) {
    resolved = Math.min(resolved, Math.floor(stageWidthPx * COMPACT_CARD_MAX_WIDTH_RATIO))
  }
  return resolved
}

/** Keep floating story card inside sticky tour stage on compact widths (tablet). */
export function fitCardLayoutToStage(layout, stageWidthPx, stageHeightPx) {
  if (stageWidthPx <= 0 || !isCompactTourStage(stageWidthPx)) return layout

  const pad = CARD_STAGE_EDGE_PADDING_PX
  const rightGutter = CARD_STAGE_RIGHT_GUTTER_PX
  const effectiveStageH =
    stageHeightPx > 0 ? stageHeightPx : stageWidthPx * (9 / 16)

  let widthPx = layout.widthPx ?? DEFAULT_CARD_LAYOUT.widthPx
  widthPx = Math.min(
    widthPx,
    stageWidthPx - pad * 2 - rightGutter,
  )
  widthPx = clamp(widthPx, CARD_MIN_WIDTH_PX, stageWidthPx - pad - rightGutter - pad)

  let leftPx = layout.leftPx
  const maxLeft = stageWidthPx - widthPx - rightGutter
  leftPx = clamp(leftPx, pad, Math.max(pad, maxLeft))

  if (leftPx + widthPx > stageWidthPx - rightGutter - pad) {
    widthPx = clamp(
      stageWidthPx - rightGutter - pad - leftPx,
      CARD_MIN_WIDTH_PX,
      stageWidthPx - pad - rightGutter - pad,
    )
  }

  const cardHeight = layout.heightPx ?? CARD_AUTO_HEIGHT_ESTIMATE_PX
  let topPx = layout.topPx
  const maxTop = effectiveStageH - cardHeight - pad
  topPx = clamp(topPx, pad, Math.max(pad, maxTop))

  let maxHeightPx = Math.round(effectiveStageH - topPx - pad)
  if (maxHeightPx < CARD_MIN_HEIGHT_PX) {
    maxHeightPx = CARD_MIN_HEIGHT_PX
    topPx = Math.max(pad, effectiveStageH - maxHeightPx - pad)
  }

  return {
    ...layout,
    leftPx: Math.round(leftPx),
    topPx: Math.round(topPx),
    widthPx: Math.round(widthPx),
    maxHeightPx,
  }
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

  return fitCardLayoutToStage(
    {
      positioning: 'absolute',
      leftPx: lerp(fromAbs.leftPx, toAbs.leftPx, frac),
      topPx: lerp(fromAbs.topPx, toAbs.topPx, frac),
      widthPx: Math.round(
        lerp(getCardWidthPx(from, stageWidthPx), getCardWidthPx(to, stageWidthPx), frac),
      ),
      heightPx: lerpNullable(from.heightPx, to.heightPx, frac),
      maxWidthVw: lerp(from.maxWidthVw, to.maxWidthVw, frac),
    },
    stageWidthPx,
    stageHeightPx,
  )
}

export function getStoryCardAbsoluteWrapperStyle(card) {
  return {
    left: '0px',
    top: '0px',
    transform: `translate3d(${card.leftPx}px, ${card.topPx}px, 0)`,
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
  const widthPx = card.widthPx ?? getCardWidthPx(normalized, stageWidthPx)
  const style = {
    width: `${widthPx}px`,
    maxWidth: `${normalized.maxWidthVw}vw`,
  }

  if (normalized.heightPx) {
    style.height = `${normalized.heightPx}px`
    style.overflowY = 'auto'
  } else if (card.maxHeightPx) {
    style.maxHeight = `${card.maxHeightPx}px`
    style.overflowY = 'auto'
  }

  return style
}

export function cardAtAbsoluteRest(stop, card, stageWidthPx, stageHeightPx) {
  const normalized = normalizeCardForLerp(card)
  const abs = cardToAbsoluteTopLeft(normalized, stageWidthPx, stageHeightPx)
  return fitCardLayoutToStage(
    {
      positioning: 'absolute',
      leftPx: abs.leftPx,
      topPx: abs.topPx,
      widthPx: getCardWidthPx(normalized, stageWidthPx),
      heightPx: normalized.heightPx,
      maxWidthVw: normalized.maxWidthVw,
    },
    stageWidthPx,
    stageHeightPx,
  )
}

const HERO_CARD_HEIGHT_ESTIMATE_PX = 360

/** Hero card bbox in stage px — width matches first story stop for clean morph handoff. */
export function computeHeroCenterCard(stageWidthPx, stageHeightPx, stopCard = null) {
  const cardForWidth = stopCard ?? DEFAULT_CARD_LAYOUT
  const maxWidthVw = cardForWidth.maxWidthVw ?? DEFAULT_CARD_LAYOUT.maxWidthVw
  const widthPx = getCardWidthPx(cardForWidth, stageWidthPx)
  const effectiveStageH =
    stageHeightPx > 0 ? stageHeightPx : (stageWidthPx > 0 ? stageWidthPx * (9 / 16) : 0)
  const leftPx = stageWidthPx > 0 ? (stageWidthPx - widthPx) / 2 : 0
  const topPx =
    effectiveStageH > 0
      ? Math.max(
          CARD_STAGE_EDGE_PADDING_PX,
          (effectiveStageH - HERO_CARD_HEIGHT_ESTIMATE_PX) / 2,
        )
      : 0

  return fitCardLayoutToStage(
    {
      positioning: 'absolute',
      leftPx,
      topPx,
      widthPx: Math.round(widthPx),
      heightPx: null,
      maxWidthVw,
    },
    stageWidthPx,
    stageHeightPx,
  )
}

/** Measured hero card shell rect → stage layout for morph handoff (flex-centered hero). */
export function layoutHeroCardFromDomRect(shellRect, boundsRect, stopCard = null) {
  const maxWidthVw = stopCard?.maxWidthVw ?? DEFAULT_CARD_LAYOUT.maxWidthVw
  return {
    positioning: 'absolute',
    leftPx: shellRect.left - boundsRect.left,
    topPx: shellRect.top - boundsRect.top,
    widthPx: shellRect.width,
    heightPx: null,
    maxWidthVw,
  }
}

function interpolateAbsoluteCardLayouts(fromLayout, toLayout, frac, stageWidthPx, stageHeightPx) {
  return fitCardLayoutToStage(
    {
      positioning: 'absolute',
      leftPx: lerp(fromLayout.leftPx, toLayout.leftPx, frac),
      topPx: lerp(fromLayout.topPx, toLayout.topPx, frac),
      widthPx: Math.round(lerp(fromLayout.widthPx, toLayout.widthPx, frac)),
      heightPx: lerpNullable(fromLayout.heightPx, toLayout.heightPx, frac),
      maxWidthVw: lerp(
        fromLayout.maxWidthVw ?? DEFAULT_CARD_LAYOUT.maxWidthVw,
        toLayout.maxWidthVw ?? DEFAULT_CARD_LAYOUT.maxWidthVw,
        frac,
      ),
    },
    stageWidthPx,
    stageHeightPx,
  )
}

export const HERO_REST_PROGRESS_EPSILON = 0.005

/** Hero rest + full-panel exit progress — one panel span matches a story segment. */
export function computeHeroExitState(progress, stopCount) {
  const heroSegment = stopCount > 0 ? 1 / stopCount : 1
  const heroActive = progress < HERO_REST_PROGRESS_EPSILON
  const scrollHeroExitT = heroActive ? 0 : clamp(progress / heroSegment, 0, 1)
  return { heroActive, heroSegment, scrollHeroExitT }
}

export function computeTourFrame({
  progress,
  stops,
  heroCamera,
  heroMobileCamera = null,
  displayHeroExitT,
  displayScrimExitT = displayHeroExitT,
  scrollHeroExitT = displayHeroExitT,
  reducedMotion,
  editMode,
  isMobile = false,
  mobileCameraPanMode = false,
  stageWidthPx = 0,
  stageHeightPx = 0,
  heroExitOriginLayout = null,
  heroHandoffLatched = false,
}) {
  const { heroActive: atHeroRest, heroSegment } = computeHeroExitState(progress, stops.length)
  const heroActive = atHeroRest && !heroHandoffLatched
  const scrollExitT = scrollHeroExitT
  const visualExitT = displayHeroExitT ?? scrollExitT
  const scrimExitT = displayScrimExitT ?? visualExitT
  const heroTextOpacity = heroActive
    ? 1
    : 1 - smoothstep(clamp(visualExitT / HERO_TEXT_FADE_END, 0, 1))
  const heroScrimOpacity = computeHeroScrimOpacity(scrimExitT, heroActive)

  const tourSpan = 1 - heroSegment
  const stopProgress =
    heroActive || tourSpan <= 0 ? 0 : clamp((progress - heroSegment) / tourSpan, 0, 1)

  const segments = Math.max(stops.length - 1, 0)
  const scaled = stopProgress * segments
  const index = segments > 0 ? clamp(Math.floor(scaled), 0, segments - 1) : 0
  const frac = segments > 0 ? smoothstep(scaled - index) : 0
  const activeIndex =
    segments <= 0 ? 0 : clamp(Math.round(scaled), 0, stops.length - 1)

  const from = stops[index]
  const to = stops[index + 1] ?? from
  const fromCam = getStopCamera(from)
  const toCam = getStopCamera(to)
  const fx = lerp(fromCam.fx, toCam.fx, frac)
  const fy = lerp(fromCam.fy, toCam.fy, frac)
  const scale = lerp(fromCam.scale, toCam.scale, frac)

  const heroBlend = heroActive ? 1 : clamp(1 - visualExitT, 0, 1)
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
    const firstStop = stops[0]
    const inHeroExitMorph = visualExitT < 0.999

    if (reducedMotion) {
      const restStop = stops[activeIndex] ?? from
      interpolatedCard = cardAtAbsoluteRest(
        restStop,
        restStop?.card ?? fromCard,
        stageWidthPx,
        stageHeightPx,
      )
    } else if (inHeroExitMorph && firstStop?.card) {
      const heroCenter = heroExitOriginLayout
        ? fitCardLayoutToStage(heroExitOriginLayout, stageWidthPx, stageHeightPx)
        : computeHeroCenterCard(stageWidthPx, stageHeightPx, firstStop.card)
      const stop0Rest = cardAtAbsoluteRest(
        firstStop,
        firstStop.card,
        stageWidthPx,
        stageHeightPx,
      )
      const exitMorphT = smoothstep(clamp(visualExitT, 0, 1))
      interpolatedCard = interpolateAbsoluteCardLayouts(
        heroCenter,
        stop0Rest,
        exitMorphT,
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

  const heroBlurOpacity = computeHeroBlurOpacity(visualExitT, heroActive)

  // Only fields the camera hook reads. Stage transform and background strings are
  // rebuilt there from smoothed values, so building them here would be thrown away.
  return {
    heroActive,
    activeIndex,
    interpolatedCard,
    scaled,
    heroTextOpacity,
    heroScrimOpacity,
    heroBlurOpacity,
    sharpBgOpacity: heroActive
      ? 0
      : clamp((visualExitT - 0.35) / 0.65, 0, 1),
    displayHeroExitT: visualExitT,
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
