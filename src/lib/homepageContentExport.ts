import { capabilitiesForStorage, type Capabilities } from './capabilitiesContent'
import { faqForStorage, type Faq } from './faqContent'
import {
  DEFAULT_SECTIONS_BACKDROP_OPACITY,
  DEFAULT_TOUR_BACKDROP_OPACITY,
  normalizeBackdropOpacity,
  type BackdropOpacity,
} from './homepageWash'
import { normalizeCard } from '../pages/Homepage2CardControls'

const LAST_EXPORT_KEY = 'homepage2-last-export'

function jsString(value: unknown): string {
  return JSON.stringify(value)
}

function stableEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export interface CardLayout {
  x: string
  y: string
  widthPx: number
  heightPx: number | null
  maxWidthVw: number
}

export interface MobileCamera {
  fx: number
  fy: number
  scale: number
}

export interface TourStop {
  id: string
  title: string
  desc: string
  desc2: string
  points: string[]
  fx: number
  fy: number
  scale: number
  card: CardLayout
  mobileCamera: MobileCamera | null
}

export interface HeroCopy {
  badge: string
  title: string
  subtitle: string
  paragraph: string
  paragraph2: string
}

export interface HeroCamera {
  fx: number
  fy: number
  scale: number
}

export interface SectionBackdrops {
  [key: string]: boolean
}

export interface HomepageSnapshot {
  stops: TourStop[]
  hero: HeroCopy
  heroCamera: HeroCamera
  heroMobileCamera: HeroCamera
  capabilities: Capabilities
  faq: Faq
  tourBackdropOpacity: BackdropOpacity
  sectionsBackdropOpacity: BackdropOpacity
  sectionBackdrops: SectionBackdrops
}

interface RawStop {
  id: string
  title: string
  desc: string
  desc2?: string
  points?: string[]
  fx: number
  fy: number
  scale: number
  card?: Partial<CardLayout>
  mobileCamera?: MobileCamera | null
}

function normalizeStop(stop: RawStop): TourStop {
  return {
    id: stop.id,
    title: stop.title,
    desc: stop.desc,
    desc2: stop.desc2 ?? '',
    points: (stop.points || []).map((point) => point.trim()).filter(Boolean),
    fx: stop.fx,
    fy: stop.fy,
    scale: stop.scale,
    card: normalizeCard(stop.card) as CardLayout,
    mobileCamera: stop.mobileCamera
      ? {
          fx: stop.mobileCamera.fx,
          fy: stop.mobileCamera.fy,
          scale: stop.mobileCamera.scale,
        }
      : null,
  }
}

function formatMobileCamera(mobileCamera: MobileCamera): string {
  return `{ fx: ${mobileCamera.fx}, fy: ${mobileCamera.fy}, scale: ${mobileCamera.scale} }`
}

interface RawHero {
  badge: string
  title: string
  subtitle: string
  paragraph?: string
  paragraph2?: string
}

interface RawHomepageSnapshot {
  stops: RawStop[]
  hero: RawHero
  heroCamera: HeroCamera
  heroMobileCamera: HeroCamera
  capabilities: Capabilities
  faq: Faq
  tourBackdropOpacity?: Partial<BackdropOpacity> | null
  sectionsBackdropOpacity?: Partial<BackdropOpacity> | null
  sectionBackdrops: SectionBackdrops
}

export function normalizeHomepageSnapshot(raw: RawHomepageSnapshot): HomepageSnapshot {
  return {
    stops: raw.stops.map(normalizeStop),
    hero: {
      badge: raw.hero.badge,
      title: raw.hero.title,
      subtitle: raw.hero.subtitle,
      paragraph: raw.hero.paragraph ?? '',
      paragraph2: raw.hero.paragraph2 ?? '',
    },
    heroCamera: {
      fx: raw.heroCamera.fx,
      fy: raw.heroCamera.fy,
      scale: raw.heroCamera.scale,
    },
    heroMobileCamera: {
      fx: raw.heroMobileCamera.fx,
      fy: raw.heroMobileCamera.fy,
      scale: raw.heroMobileCamera.scale,
    },
    tourBackdropOpacity: normalizeBackdropOpacity(
      raw.tourBackdropOpacity,
      DEFAULT_TOUR_BACKDROP_OPACITY,
    ),
    sectionsBackdropOpacity: normalizeBackdropOpacity(
      raw.sectionsBackdropOpacity,
      DEFAULT_SECTIONS_BACKDROP_OPACITY,
    ),
    sectionBackdrops: { ...raw.sectionBackdrops },
    capabilities: capabilitiesForStorage(raw.capabilities),
    faq: faqForStorage(raw.faq),
  }
}

export function loadLastExportBaseline(): HomepageSnapshot | null {
  try {
    const raw = sessionStorage.getItem(LAST_EXPORT_KEY)
    return raw ? (JSON.parse(raw) as HomepageSnapshot) : null
  } catch {
    return null
  }
}

function saveLastExportBaseline(snapshot: RawHomepageSnapshot): void {
  sessionStorage.setItem(LAST_EXPORT_KEY, JSON.stringify(normalizeHomepageSnapshot(snapshot)))
}

function formatCard(card: CardLayout): string {
  const height = card.heightPx == null ? 'null' : String(card.heightPx)
  return `{ x: ${jsString(card.x)}, y: ${jsString(card.y)}, widthPx: ${card.widthPx}, heightPx: ${height}, maxWidthVw: ${card.maxWidthVw} }`
}

function formatStop(stop: TourStop): string {
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

type StopField = 'title' | 'desc' | 'desc2' | 'fx' | 'fy' | 'scale' | 'points' | 'card' | 'mobileCamera'

function formatStopFieldPatch(stop: TourStop, fields: StopField[]): string {
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

function getChangedStopFields(current: TourStop, baseline: TourStop): StopField[] {
  const fields: StopField[] = []
  for (const key of ['title', 'desc', 'desc2', 'fx', 'fy', 'scale'] as const) {
    if (current[key] !== baseline[key]) fields.push(key)
  }
  if (!stableEqual(current.points, baseline.points)) fields.push('points')
  if (!stableEqual(current.card, baseline.card)) fields.push('card')
  if (!stableEqual(current.mobileCamera, baseline.mobileCamera)) fields.push('mobileCamera')
  return fields
}

interface StopPatch {
  type: 'added' | 'full' | 'patch'
  stop: TourStop
  fields?: StopField[]
}

function diffStops(currentStops: TourStop[], baselineStops: TourStop[]): StopPatch[] {
  const baselineById = Object.fromEntries(baselineStops.map((stop) => [stop.id, stop]))
  const patches: StopPatch[] = []

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

type HeroField = 'badge' | 'title' | 'subtitle' | 'paragraph' | 'paragraph2'

interface HeroDiff {
  current: HeroCopy
  fields: HeroField[]
}

function diffHero(current: HeroCopy, baseline: HeroCopy): HeroDiff | null {
  const fields = (['badge', 'title', 'subtitle', 'paragraph', 'paragraph2'] as const).filter(
    (key) => current[key] !== baseline[key],
  )
  return fields.length ? { current, fields } : null
}

type CameraField = 'fx' | 'fy' | 'scale'

interface CameraDiff {
  current: HeroCamera
  fields: CameraField[]
}

function diffHeroCamera(current: HeroCamera, baseline: HeroCamera): CameraDiff | null {
  const fields = (['fx', 'fy', 'scale'] as const).filter((key) => current[key] !== baseline[key])
  return fields.length ? { current, fields } : null
}

type OpacityField = 'light' | 'dark'

interface OpacityDiff {
  current: BackdropOpacity
  fields: OpacityField[]
}

function diffBackdropOpacity(current: BackdropOpacity, baseline: BackdropOpacity): OpacityDiff | null {
  const fields = (['light', 'dark'] as const).filter((key) => current[key] !== baseline[key])
  return fields.length ? { current, fields } : null
}

function diffSectionBackdrops(
  current: SectionBackdrops,
  baseline: SectionBackdrops,
): SectionBackdrops | null {
  const changed = Object.entries(current).filter(([id, enabled]) => baseline[id] !== enabled)
  return changed.length ? Object.fromEntries(changed) : null
}

interface CapabilitiesDiff {
  headerFields: string[]
  changedCards: Capabilities['cards']
  current: Capabilities
}

function diffCapabilities(current: Capabilities, baseline: Capabilities): CapabilitiesDiff | null {
  const headerFields = (['eyebrow', 'heading', 'sub'] as const).filter(
    (key) => current[key] !== baseline[key],
  )
  const changedCards = current.cards.filter((card) => {
    const base = baseline.cards.find((entry) => entry.id === card.id)
    return !base || !stableEqual(card, base)
  })

  if (!headerFields.length && !changedCards.length) return null
  return { headerFields, changedCards, current }
}

interface FaqDiff {
  changedItems: Faq['items']
}

function diffFaq(current: Faq, baseline: Faq): FaqDiff | null {
  const changedItems = current.items.filter((item) => {
    const base = baseline.items.find((entry) => entry.id === item.id)
    return !base || !stableEqual(item, base)
  })
  return changedItems.length ? { changedItems } : null
}

function formatCapabilitiesDiff(diff: CapabilitiesDiff): string {
  const lines = ['// DEFAULT_CAPABILITIES — changed fields only']
  for (const field of diff.headerFields) {
    lines.push(`${field}: ${jsString(diff.current[field as keyof Capabilities])},`)
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

function formatFaqDiff(diff: FaqDiff): string {
  return [
    '// DEFAULT_FAQ — changed items only',
    JSON.stringify({ items: diff.changedItems }, null, 2),
  ].join('\n')
}

function formatBackdropOpacityDiff(name: string, fileHint: string, diff: OpacityDiff): string {
  const lines = [`// ${name} — changed keys only in ${fileHint}`]
  for (const field of diff.fields) {
    lines.push(`${field}: ${diff.current[field]},`)
  }
  return lines.join('\n')
}

function formatSectionBackdropsDiff(changedBackdrops: SectionBackdrops): string {
  const lines = ['// DEFAULT_SECTION_BACKDROPS — changed keys only in src/pages/Home.jsx']
  for (const [id, enabled] of Object.entries(changedBackdrops)) {
    lines.push(`${id}: ${enabled},`)
  }
  return lines.join('\n')
}

export function formatHomepageContentDiff(
  currentSnapshot: RawHomepageSnapshot,
  baselineSnapshot: RawHomepageSnapshot,
  { baselineLabel }: { baselineLabel: string },
): string {
  const current = normalizeHomepageSnapshot(currentSnapshot)
  const baseline = normalizeHomepageSnapshot(baselineSnapshot)

  const sections: string[] = []
  const stopPatches = diffStops(current.stops, baseline.stops)
  const heroDiff = diffHero(current.hero, baseline.hero)
  const cameraDiff = diffHeroCamera(current.heroCamera, baseline.heroCamera)
  const mobileCameraDiff = diffHeroCamera(current.heroMobileCamera, baseline.heroMobileCamera)
  const tourBackdropDiff = diffBackdropOpacity(current.tourBackdropOpacity, baseline.tourBackdropOpacity)
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
    !mobileCameraDiff &&
    !tourBackdropDiff &&
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
        sections.push(formatStopFieldPatch(patch.stop, patch.fields!))
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

  if (mobileCameraDiff) {
    sections.push('// --- Mobile hero camera — DEFAULT_HERO_MOBILE_CAMERA in Homepage2HeroCameraControls.jsx ---')
    for (const field of mobileCameraDiff.fields) {
      sections.push(`${field}: ${mobileCameraDiff.current[field]},`)
    }
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

export interface CopyResult {
  text: string
  baselineLabel: string
  hadChanges: boolean
}

export async function copyHomepageContentForCode(
  currentSnapshot: RawHomepageSnapshot,
  { codeBaselineSnapshot }: { codeBaselineSnapshot: RawHomepageSnapshot },
): Promise<CopyResult> {
  const lastExport = loadLastExportBaseline()
  const baselineSnapshot = lastExport ?? codeBaselineSnapshot
  const baselineLabel = lastExport ? 'last copy' : 'loaded code defaults'

  const text = formatHomepageContentDiff(currentSnapshot, baselineSnapshot as RawHomepageSnapshot, { baselineLabel })
  await navigator.clipboard.writeText(text)

  if (!text.startsWith('// No homepage content changes')) {
    saveLastExportBaseline(currentSnapshot)
  }

  return { text, baselineLabel, hadChanges: !text.startsWith('// No homepage content changes') }
}
