import { capabilitiesForStorage } from './capabilitiesContent'
import { faqForStorage } from './faqContent'
import {
  DEFAULT_SECTIONS_BACKDROP_OPACITY,
  DEFAULT_TOUR_BACKDROP_OPACITY,
  normalizeBackdropOpacity,
} from './homepageWash'
import { normalizeCard } from '../pages/Homepage2CardControls'
import { DEFAULT_HERO_FACTORY_BLUR_PX } from './tourScrollMath'

const LAST_EXPORT_KEY = 'homepage2-last-export'

function jsString(value) {
  return JSON.stringify(value)
}

function stableEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function normalizeStop(stop) {
  return {
    id: stop.id,
    title: stop.title,
    desc: stop.desc,
    desc2: stop.desc2 ?? '',
    points: (stop.points || []).map((point) => point.trim()).filter(Boolean),
    fx: stop.fx,
    fy: stop.fy,
    scale: stop.scale,
    card: normalizeCard(stop.card),
    mobileCamera: stop.mobileCamera
      ? {
          fx: stop.mobileCamera.fx,
          fy: stop.mobileCamera.fy,
          scale: stop.mobileCamera.scale,
        }
      : null,
  }
}

function formatMobileCamera(mobileCamera) {
  return `{ fx: ${mobileCamera.fx}, fy: ${mobileCamera.fy}, scale: ${mobileCamera.scale} }`
}

export function normalizeHomepageSnapshot({
  stops,
  hero,
  heroCamera,
  heroFactoryBlurPx,
  capabilities,
  faq,
  tourBackdropOpacity,
  sectionsBackdropOpacity,
  sectionBackdrops,
}) {
  return {
    stops: stops.map(normalizeStop),
    hero: {
      badge: hero.badge,
      title: hero.title,
      subtitle: hero.subtitle,
    },
    heroCamera: {
      fx: heroCamera.fx,
      fy: heroCamera.fy,
      scale: heroCamera.scale,
    },
    heroFactoryBlurPx: heroFactoryBlurPx ?? DEFAULT_HERO_FACTORY_BLUR_PX,
    tourBackdropOpacity: normalizeBackdropOpacity(
      tourBackdropOpacity,
      DEFAULT_TOUR_BACKDROP_OPACITY,
    ),
    sectionsBackdropOpacity: normalizeBackdropOpacity(
      sectionsBackdropOpacity,
      DEFAULT_SECTIONS_BACKDROP_OPACITY,
    ),
    sectionBackdrops: { ...sectionBackdrops },
    capabilities: capabilitiesForStorage(capabilities),
    faq: faqForStorage(faq),
  }
}

export function loadLastExportBaseline() {
  try {
    const raw = sessionStorage.getItem(LAST_EXPORT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveLastExportBaseline(snapshot) {
  sessionStorage.setItem(LAST_EXPORT_KEY, JSON.stringify(normalizeHomepageSnapshot(snapshot)))
}

function formatCard(card) {
  const height = card.heightPx == null ? 'null' : String(card.heightPx)
  return `{ x: ${jsString(card.x)}, y: ${jsString(card.y)}, anchor: ${jsString(card.anchor)}, widthPx: ${card.widthPx}, heightPx: ${height}, maxWidthVw: ${card.maxWidthVw} }`
}

function formatStop(stop) {
  const points = stop.points.map((point) => `      ${jsString(point)},`).join('\n')
  const mobileCameraLine = stop.mobileCamera
    ? `\n    mobileCamera: ${formatMobileCamera(stop.mobileCamera)},`
    : ''

  return `  {
    id: ${jsString(stop.id)},
    title: ${jsString(stop.title)},
    desc: ${jsString(stop.desc)},
    desc2: ${jsString(stop.desc2)},
    points: [
${points}
    ],
    fx: ${stop.fx},
    fy: ${stop.fy},
    scale: ${stop.scale},
    card: ${formatCard(stop.card)},${mobileCameraLine}
  }`
}

function formatStopFieldPatch(stop, fields) {
  const lines = [`// ${stop.id} — patch in DEFAULT_STOPS`]
  for (const field of fields) {
    if (field === 'points') {
      const points = stop.points.map((point) => `      ${jsString(point)},`).join('\n')
      lines.push(`points: [\n${points}\n    ],`)
      continue
    }
    if (field === 'card') {
      lines.push(`card: ${formatCard(stop.card)},`)
      continue
    }
    if (field === 'mobileCamera') {
      if (stop.mobileCamera) {
        lines.push(`mobileCamera: ${formatMobileCamera(stop.mobileCamera)},`)
      } else {
        lines.push('// remove mobileCamera from this stop')
      }
      continue
    }
    lines.push(`${field}: ${jsString(stop[field])},`)
  }
  return lines.join('\n')
}

function getChangedStopFields(current, baseline) {
  const fields = []
  for (const key of ['title', 'desc', 'desc2', 'fx', 'fy', 'scale']) {
    if (current[key] !== baseline[key]) fields.push(key)
  }
  if (!stableEqual(current.points, baseline.points)) fields.push('points')
  if (!stableEqual(current.card, baseline.card)) fields.push('card')
  if (!stableEqual(current.mobileCamera, baseline.mobileCamera)) fields.push('mobileCamera')
  return fields
}

function diffStops(currentStops, baselineStops) {
  const baselineById = Object.fromEntries(baselineStops.map((stop) => [stop.id, stop]))
  const patches = []

  for (const stop of currentStops) {
    const baseline = baselineById[stop.id]
    if (!baseline) {
      patches.push({ type: 'added', stop })
      continue
    }
    const fields = getChangedStopFields(stop, baseline)
    if (fields.length > 0) {
      patches.push(
        fields.length >= 5 ? { type: 'full', stop } : { type: 'patch', stop, fields },
      )
    }
  }

  return patches
}

function diffHero(current, baseline) {
  const fields = ['badge', 'title', 'subtitle'].filter((key) => current[key] !== baseline[key])
  return fields.length ? { current, fields } : null
}

function diffHeroCamera(current, baseline) {
  const fields = ['fx', 'fy', 'scale'].filter((key) => current[key] !== baseline[key])
  return fields.length ? { current, fields } : null
}

function diffBackdropOpacity(current, baseline) {
  const fields = ['light', 'dark'].filter((key) => current[key] !== baseline[key])
  return fields.length ? { current, fields } : null
}

function diffSectionBackdrops(current, baseline) {
  const changed = Object.entries(current).filter(([id, enabled]) => baseline[id] !== enabled)
  return changed.length ? Object.fromEntries(changed) : null
}

function diffCapabilities(current, baseline) {
  const headerFields = ['eyebrow', 'heading', 'sub'].filter((key) => current[key] !== baseline[key])
  const changedCards = current.cards.filter((card) => {
    const base = baseline.cards.find((entry) => entry.id === card.id)
    return !base || !stableEqual(card, base)
  })

  if (!headerFields.length && !changedCards.length) return null
  return { headerFields, changedCards, current }
}

function diffFaq(current, baseline) {
  const changedItems = current.items.filter((item) => {
    const base = baseline.items.find((entry) => entry.id === item.id)
    return !base || !stableEqual(item, base)
  })
  return changedItems.length ? { changedItems } : null
}

function formatCapabilitiesDiff(diff) {
  const lines = ['// DEFAULT_CAPABILITIES — changed fields only']
  for (const field of diff.headerFields) {
    lines.push(`${field}: ${jsString(diff.current[field])},`)
  }
  if (diff.changedCards.length) {
    lines.push('cards: [')
    for (const card of diff.changedCards) {
      lines.push(JSON.stringify(card, null, 2) + ',')
    }
    lines.push('],')
  }
  return lines.join('\n')
}

function formatFaqDiff(diff) {
  return [
    '// DEFAULT_FAQ — changed items only',
    JSON.stringify({ items: diff.changedItems }, null, 2),
  ].join('\n')
}

function formatBackdropOpacityDiff(name, fileHint, diff) {
  const lines = [`// ${name} — changed keys only in ${fileHint}`]
  for (const field of diff.fields) {
    lines.push(`${field}: ${diff.current[field]},`)
  }
  return lines.join('\n')
}

function formatSectionBackdropsDiff(changedBackdrops) {
  const lines = ['// DEFAULT_SECTION_BACKDROPS — changed keys only in src/pages/Home.jsx']
  for (const [id, enabled] of Object.entries(changedBackdrops)) {
    lines.push(`${id}: ${enabled},`)
  }
  return lines.join('\n')
}

export function formatHomepageContentDiff(currentSnapshot, baselineSnapshot, { baselineLabel }) {
  const current = normalizeHomepageSnapshot(currentSnapshot)
  const baseline = normalizeHomepageSnapshot(baselineSnapshot)

  const sections = []
  const stopPatches = diffStops(current.stops, baseline.stops)
  const heroDiff = diffHero(current.hero, baseline.hero)
  const cameraDiff = diffHeroCamera(current.heroCamera, baseline.heroCamera)
  const tourBackdropDiff = diffBackdropOpacity(current.tourBackdropOpacity, baseline.tourBackdropOpacity)
  const heroFactoryBlurChanged =
    current.heroFactoryBlurPx !== baseline.heroFactoryBlurPx ? current.heroFactoryBlurPx : null
  const sectionsBackdropDiff = diffBackdropOpacity(
    current.sectionsBackdropOpacity,
    baseline.sectionsBackdropOpacity,
  )
  const sectionBackdropsDiff = diffSectionBackdrops(current.sectionBackdrops, baseline.sectionBackdrops)
  const capabilitiesDiff = diffCapabilities(current.capabilities, baseline.capabilities)
  const faqDiff = diffFaq(current.faq, baseline.faq)

  if (
    !stopPatches.length &&
    !heroDiff &&
    !cameraDiff &&
    !tourBackdropDiff &&
    !heroFactoryBlurChanged &&
    !sectionsBackdropDiff &&
    !sectionBackdropsDiff &&
    !capabilitiesDiff &&
    !faqDiff
  ) {
    return `// No homepage content changes since ${baselineLabel}.`
  }

  sections.push(
    `// Homepage diff since ${baselineLabel}. Paste to agent or patch source files.`,
    '// Files: src/pages/Home.jsx, src/lib/capabilitiesContent.js, src/lib/faqContent.js, src/lib/homepageWash.js, src/lib/tourScrollMath.js',
    '',
  )

  if (stopPatches.length) {
    sections.push('// --- Tour stops ---')
    for (const patch of stopPatches) {
      if (patch.type === 'full' || patch.type === 'added') {
        sections.push(`// Replace or add stop ${patch.stop.id} in DEFAULT_STOPS`)
        sections.push(formatStop(patch.stop))
      } else {
        sections.push(formatStopFieldPatch(patch.stop, patch.fields))
      }
      sections.push('')
    }
  }

  if (heroDiff) {
    sections.push('// --- Hero ---')
    for (const field of heroDiff.fields) {
      sections.push(`${field}: ${jsString(heroDiff.current[field])},`)
    }
    sections.push('')
  }

  if (cameraDiff) {
    sections.push('// --- Hero camera ---')
    for (const field of cameraDiff.fields) {
      sections.push(`${field}: ${cameraDiff.current[field]},`)
    }
    sections.push('')
  }

  if (heroFactoryBlurChanged != null) {
    sections.push(
      `// Hero factory blur — DEFAULT_HERO_FACTORY_BLUR_PX in src/lib/tourScrollMath.js\n${heroFactoryBlurChanged},`,
    )
    sections.push('')
  }

  if (tourBackdropDiff) {
    sections.push(
      formatBackdropOpacityDiff(
        'Tour background opacity',
        'DEFAULT_TOUR_BACKDROP_OPACITY in src/lib/homepageWash.js',
        tourBackdropDiff,
      ),
    )
    sections.push('')
  }

  if (sectionsBackdropDiff) {
    sections.push(
      formatBackdropOpacityDiff(
        'Sections background opacity',
        'DEFAULT_SECTIONS_BACKDROP_OPACITY in src/lib/homepageWash.js',
        sectionsBackdropDiff,
      ),
    )
    sections.push('')
  }

  if (sectionBackdropsDiff) {
    sections.push(formatSectionBackdropsDiff(sectionBackdropsDiff))
    sections.push('')
  }

  if (capabilitiesDiff) {
    sections.push(formatCapabilitiesDiff(capabilitiesDiff))
    sections.push('')
  }

  if (faqDiff) {
    sections.push(formatFaqDiff(faqDiff))
    sections.push('')
  }

  sections.push('// Next copy diffs against this export baseline.')
  return sections.join('\n').trim()
}

export async function copyHomepageContentForCode(currentSnapshot, { codeBaselineSnapshot }) {
  const lastExport = loadLastExportBaseline()
  const baselineSnapshot = lastExport ?? codeBaselineSnapshot
  const baselineLabel = lastExport ? 'last copy' : 'loaded code defaults'

  const text = formatHomepageContentDiff(currentSnapshot, baselineSnapshot, { baselineLabel })
  await navigator.clipboard.writeText(text)

  if (!text.startsWith('// No homepage content changes')) {
    saveLastExportBaseline(currentSnapshot)
  }

  return { text, baselineLabel, hadChanges: !text.startsWith('// No homepage content changes') }
}
