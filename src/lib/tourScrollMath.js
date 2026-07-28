export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
export const lerp = (a, b, t) => a + (b - a) * t
export const smoothstep = (t) => t * t * (3 - 2 * t)

export const HERO_EXIT_DURATION_MS = 650
const HERO_EXIT_HOLD = 0.3
export const HERO_TEXT_FADE_END = 0.8
const STORY_CARD_FADE_SPAN = 0.25
const STORY_CARD_FADE_START = 1 - STORY_CARD_FADE_SPAN

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

export function computeBackgroundTransforms(tx, ty, scale, heroBlend) {
  const panX = tx * BACKGROUND_PARALLAX
  const panY = ty * BACKGROUND_PARALLAX_Y

  if (heroBlend >= 1) {
    return {
      wrapperTransform: `translate(${panX * 0.4}%, ${panY * 0.4}%) scale(1)`,
      imgTransform: null,
      imgObjectFit: 'contain',
      imgObjectPosition: '50% 50%',
    }
  }

  const zoom = 1 + (scale - 1) * BACKGROUND_PARALLAX
  const panExtent = Math.max(Math.abs(panX), Math.abs(panY))
  const upwardPanBoost = Math.max(0, ty) * 0.004
  const imgOverscan = 1.18 + panExtent * 0.006 + (scale - 1) * 0.12 + upwardPanBoost
  const zoomT = clamp((scale - 1) / 1.5, 0, 1)

  return {
    wrapperTransform: `translate(${panX}%, ${panY}%) scale(${zoom})`,
    imgTransform: `scale(${imgOverscan})`,
    imgObjectFit: 'cover',
    imgObjectPosition: `50% ${lerp(40, 25, zoomT)}%`,
  }
}

export function computeTourFrame({
  progress,
  stops,
  heroCamera,
  displayHeroExitT,
  reducedMotion,
  editMode,
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
  const fx = lerp(from.fx, to.fx, frac)
  const fy = lerp(from.fy, to.fy, frac)
  const scale = lerp(from.scale, to.scale, frac)

  const heroBlend = heroActive ? 1 : 0
  const camFx = lerp(fx, heroCamera.fx, heroBlend)
  const camFy = lerp(fy, heroCamera.fy, heroBlend)
  const camScale = lerp(scale, heroCamera.scale, heroBlend)

  const tx = (0.5 - camFx) * 100 * camScale
  const ty = (0.5 - camFy) * 100 * camScale

  return {
    heroActive,
    activeIndex,
    stopProgress,
    scaled,
    heroTextOpacity,
    storyCardOpacity,
    heroBlurOpacity: 1 - displayHeroExitT,
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
