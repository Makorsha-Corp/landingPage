import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import LandingNavBar from '../components/LandingNavBar'
import DevToolsPopover from '../components/DevToolsPopover'
import ThemeToggleButton from '../components/ThemeToggleButton'
import LandingPostTourSections from '../components/LandingPostTourSections'
import Homepage2HeroOverlay from '../components/Homepage2HeroOverlay'
import TourMobileCompactCard from '../components/tour/TourMobileCompactCard'
import TourMobileStopPanel from '../components/tour/TourMobileStopPanel'
import useReducedMotion from '../hooks/useReducedMotion'
import useIsMobileTour from '../hooks/useIsMobileTour'
import useSectionScroll from '../hooks/useSectionScroll'
import useTourCamera from '../hooks/useTourCamera'
import useTourFeaturesBackdrop from '../hooks/useTourFeaturesBackdrop'
import { DEFAULT_HERO_FACTORY_BLUR_PX, computeTourStageFadeProgress } from '../lib/tourScrollMath'
import {
  DEFAULT_CAPABILITIES,
  cloneCapabilities,
  normalizeCapabilitiesEyebrow,
} from '../lib/capabilitiesContent'
import {
  cloneFaq,
  mergeFaqFromSaved,
} from '../lib/faqContent'
import Homepage2FloatingCardLayoutControls from './Homepage2FloatingCardLayoutControls'
import Homepage2HeroCameraControls, {
  DEFAULT_HERO_CAMERA,
  normalizeHeroCamera,
  normalizeTourCamera,
  TOUR_CAMERA_LIMITS,
} from './Homepage2HeroCameraControls'
import {
  getLoginGradientStyle,
  getLoginRadialGradientStyle,
} from '../../shared/loginGradient.js'
import useLoginGradientFollow from '../hooks/useLoginGradientFollow'
import useStoryCardDrag from '../hooks/useStoryCardDrag'
import { DEFAULT_CARD, getCardStyle, normalizeCard } from './Homepage2CardControls'
import { getStoryCardStyles } from '../lib/storyCardStyles'
import {
  cycleHeroCardLayout,
  cycleHeroCardStyle,
  getHeroCardLayoutLabel,
  getHeroCardStyleLabel,
  normalizeHeroCardPrefs,
} from '../lib/heroCardStyles'
import { copyHomepageContentForCode, normalizeHomepageSnapshot } from '../lib/homepageContentExport'
import {
  applyRainbowColorPreset,
  clearRainbowColorPresetOverrides,
  DEFAULT_RAINBOW_COLOR_PRESET,
  getWaitlistShineColors,
  RAINBOW_COLOR_PRESET_LIST,
} from '../lib/rainbowColorPresets'
import {
  DEFAULT_SECTIONS_BACKDROP_OPACITY,
  DEFAULT_TOUR_BACKDROP_OPACITY,
  getBackgroundOverlayStyle,
  getBlendedBackgroundOverlayStyle,
  normalizeBackdropOpacity,
} from '../lib/homepageWash'

const DEFAULT_SECTION_BACKDROPS = {
  tour: true,
  features: true,
  proof: true,
  pricing: true,
  faq: true,
  waitlist: true,
}

const HOMEPAGE_BACKGROUNDS = {
  light: '/homepage-background.png',
  dark: '/homepage-background-dark.png',
}

const HOMEPAGE_BLUR_BACKGROUNDS = {
  light: '/homepage-background-blur.png',
  dark: '/homepage-background-blur-dark.png',
}

const BUILDING_IMAGE = '/building-compressed.png'

function getScrollHintPillStyles(theme) {
  if (theme === 'dark') {
    return 'rounded-full border border-white/10 bg-black/25 text-white backdrop-blur-md shadow-lg'
  }
  return 'rounded-full border border-white/60 bg-white/75 text-foreground backdrop-blur-md ring-1 ring-black/5 shadow-lg shadow-black/10'
}

function getRightBarStyles(theme) {
  const base =
    'absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto rounded-full px-2.5 py-3.5 backdrop-blur-md'

  if (theme === 'dark') {
    return {
      wrap: `${base} border border-white/10 bg-black/25`,
      counter:
        'text-xs font-semibold tabular-nums text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
      tickInactive: 'bg-white/40 hover:bg-white/70',
      track: 'bg-white/25',
      trackLine: 'bg-white/30',
      label: 'bg-black/55 text-white backdrop-blur-sm',
      nodeInactive: 'bg-black/40 text-white/70 hover:text-white',
      iconInactive: 'bg-black/40 text-white/70 hover:text-white hover:bg-black/55',
      fillTickInactive: 'bg-white/60 hover:bg-white',
      fillTickActiveRing: 'ring-white/70',
      dotInactive: 'bg-white/40 hover:bg-white/70',
      ringTrackStroke: 'rgba(255,255,255,0.25)',
      arrowBtn:
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25',
    }
  }

  return {
    wrap: `${base} border border-white/60 bg-white/75 ring-1 ring-black/5`,
    counter: 'text-xs font-semibold tabular-nums text-foreground',
    tickInactive: 'bg-black/25 hover:bg-black/40',
    track: 'bg-black/15',
    trackLine: 'bg-black/20',
    label:
      'bg-white/90 text-foreground backdrop-blur-sm border border-black/5 shadow-md',
    nodeInactive: 'bg-black/10 text-muted-foreground hover:text-foreground',
    iconInactive: 'bg-black/10 text-muted-foreground hover:text-foreground hover:bg-black/15',
    fillTickInactive: 'bg-black/30 hover:bg-black/45',
    fillTickActiveRing: 'ring-black/20',
    dotInactive: 'bg-black/25 hover:bg-black/40',
    ringTrackStroke: 'rgba(0,0,0,0.15)',
    arrowBtn:
      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-25',
  }
}

function RightBarStepArrow({ direction, onClick, className }) {
  const isUp = direction === 'up'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isUp ? 'Previous stop' : 'Next stop'}
      className={className}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={isUp ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
        />
      </svg>
    </button>
  )
}

function RightBarShell({ wrap, bar, gap, onStepPrev, onStepNext, children }) {
  return (
    <div className={`${wrap} ${gap}`}>
      <RightBarStepArrow direction="up" onClick={onStepPrev} className={bar.arrowBtn} />
      {children}
      <RightBarStepArrow direction="down" onClick={onStepNext} className={bar.arrowBtn} />
    </div>
  )
}

/**
 * Focus stops. fx/fy are the focus point as a fraction (0..1) of the
 * building image; scale is how far to zoom in at that stop. These are
 * tuned by eye against the building cutaway (4572x3712, aspect 1024:831).
 * Production uses BUILDING_IMAGE (compressed); full PNG kept in public/ for re-export.
 */
const DEFAULT_STOPS = [
  {
    id: 'overview',
    title: 'Your whole operation, one place.',
    desc: "We've built our system in collaboration with factory owners, so we understand your problems. Bad logging, scattered tracking and a lack of clear communication is the root cause of all inefficiencies in factory workflows. And so we've thought of a way to have every section track every decision.",
    desc2: 'Our connected system means no more juggling spreadsheets, disconnected tools, or guesswork between departments.',
    points: [
      'Single source of truth',
      'Every decision on the record',
      'Real-time across floors',
      'Full ledgers and event logs',
    ],
    fx: 0.5,
    fy: 0.5,
    scale: 1,
    card: { x: '53%', y: '86%', anchor: 'bottom-left', widthPx: 640, heightPx: null, maxWidthVw: 92 },
    mobileCamera: { fx: 0.5, fy: 0.56, scale: 0.7 },
  },
  {
    id: 'reports',
    title: 'Dashboard & Reports',
    desc: 'Everything that matters shows up the moment you log in: open orders, pending approvals, running machines, batches in progress, and your cash position.',
    desc2: "See your biggest costs by item, vendor, customer, and factory, broken down by expense category, so you already know what's going on without even having to schedule a meeting.",
    points: [
      'Live operational KPIs',
      'Net payables & receivables',
      'Top spend by vendor & item',
      'Cross-order approval queue',
    ],
    fx: 0.52,
    fy: 0.34,
    scale: 1.55,
    card: { x: '94%', y: '70%', anchor: 'bottom-right', widthPx: 640, heightPx: null, maxWidthVw: 92 },
    mobileCamera: { fx: 0.48, fy: 0.24, scale: 1.55 },
  },
  {
    id: 'orders',
    title: 'Orders & Workflows',
    desc: 'Plan and track purchase, transfer, and sales orders through multi-stage workflows. Every workspace has their own way of handling orders, and so we let you decide your way of operating.',
    desc2: "Every order carries its items and history, with configurable approval chains, so nothing slips through the cracks. Placing an order also shows you insights on prices of your previous purchases, allowing you to find the perfect seller. And if a purchase order ever needs undoing, voiding it reverses the inventory, clears the approvals, and unwinds the invoice with it.",
    points: [
      'Purchase / transfer / sales',
      'Multi-stage approvals',
      'Best price & supplier picks',
      'Full audit history',
    ],
    fx: 0.33,
    fy: 0.47,
    scale: 2.2,
    card: { x: '6%', y: '90%', anchor: 'bottom-left', widthPx: 640, heightPx: null, maxWidthVw: 92 },
    mobileCamera: { fx: 0.33, fy: 0.47, scale: 1.86 },
  },
  {
    id: 'accounts',
    title: 'Accounts & Invoices',
    desc: 'Manage suppliers, customers, invoices, and payments. Every payment is tracked against the invoice it belongs to.',
    desc2: 'Track payables and receivables, log payments, and watch every balance update the moment money moves.',
    points: [
      'Suppliers & customers',
      'Invoices & payments',
      'Auto-synced from orders',
      'Real-time reconciliation',
    ],
    fx: 0.64,
    fy: 0.50,
    scale: 2.2,
    card: { x: '10%', y: '90%', anchor: 'bottom-left', widthPx: 640, heightPx: null, maxWidthVw: 92 },
    mobileCamera: { fx: 0.68, fy: 0.54, scale: 1.52 },
  },
  {
    id: 'production',
    title: 'Production & Machines',
    desc: "Formula-driven manufacturing on the factory floor, with every stage tracked down to the exact machine and line it runs on. See every machine's status at a glance: running, in maintenance, or idle, with what's overdue across the whole factory in just one view.",
    desc2: "The day's machine checklist is one click to generate, not a spreadsheet you have to build by hand every morning. Raise a work order from the same screen, the moment something breaks or on a recurring schedule, with the parts it needs pulled straight from inventory.",
    points: [
      'Formula-driven batches',
      'Stage-level waste tracking',
      'Live machine status',
      'One-click daily checklist',
    ],
    fx: 0.27,
    fy: 0.76,
    scale: 2.4,
    card: { x: '92%', y: '92%', anchor: 'bottom-right', widthPx: 640, heightPx: null, maxWidthVw: 92 },
    mobileCamera: { fx: 0.25, fy: 0.74, scale: 1.9 },
  },
  {
    id: 'inventory',
    title: 'Inventory & Logistics',
    desc: "Real-time stock across storage, machines, and projects, right up to the loading dock and out the door. Finished goods are tracked separately from raw materials, so you always know what's still coming and what's ready to ship.",
    desc2: 'Immutable ledgers record every movement, with balances updating automatically as they happen. Nothing disappears untracked, even damage and waste are logged as their own category, so audits are painless.',
    points: [
      'Storage / machine / project',
      'Immutable ledgers',
      'Live balance updates',
      'Painless audits',
    ],
    fx: 0.73,
    fy: 0.78,
    scale: 2.4,
    card: { x: '50%', y: '90%', anchor: 'bottom-left', widthPx: 640, heightPx: null, maxWidthVw: 92 },
    mobileCamera: { fx: 0.65, fy: 0.8, scale: 1.88 },
  },
]

const DEFAULT_HERO = {
  badge: 'Kolom ERP',
  title: 'Your factory at your fingertips.',
  subtitle:
    "Kolom aims to help you manage your entire workspace from anywhere. Whether you're running solo, or collaborating with a massive team, or are an experienced manager working with multiple corporations, get detailed insights of how your operations are running at a price that won't break the bank, but instead help you make some. You won't know how much you're losing until you start tracking.",
}

function cloneStops(stops) {
  return stops.map((s, i) => ({
    ...s,
    points: [...(s.points || [])],
    card: normalizeCard(s.card, DEFAULT_STOPS[i]?.card || DEFAULT_CARD),
    mobileCamera: s.mobileCamera ? { ...s.mobileCamera } : undefined,
  }))
}

const ANCHOR_TRANSLATE = {
  'top-left': '0, 0',
  'top-right': '-100%, 0',
  'bottom-left': '0, -100%',
  'bottom-right': '-100%, -100%',
}

const BAR_VARIANTS = ['A', 'B', 'C', 'D', 'E', 'F']

const LANDING_SECTIONS = [
  { id: 'tour', label: 'Tour' },
  { id: 'features', label: 'Features' },
  { id: 'proof', label: 'Proof' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
  { id: 'waitlist', label: 'Join waitlist' },
]

// Inline icon paths keyed by stop id (variant E).
const STOP_ICON_PATHS = {
  overview: 'M4 6h16M4 12h16M4 18h16',
  reports: 'M3 3v18h18M7 14l3-3 3 3 5-5',
  orders: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  accounts: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z',
  production: 'M10.34 3.94c.09-.54.56-.94 1.11-.94h1.09c.55 0 1.02.4 1.11.94l.15.89c.41.16.78.38 1.11.65l.84-.32c.51-.2 1.09.01 1.35.49l.55.94c.26.48.16 1.08-.24 1.45l-.68.6c.05.43.05.87 0 1.3l.68.6c.4.37.5.97.24 1.45l-.55.94c-.26.48-.84.69-1.35.49l-.84-.32c-.33.27-.7.49-1.11.65l-.15.89c-.09.54-.56.94-1.11.94h-1.09c-.55 0-1.02-.4-1.11-.94l-.15-.89a5.5 5.5 0 01-1.11-.65l-.84.32c-.51.2-1.09-.01-1.35-.49l-.55-.94c-.26-.48-.16-1.08.24-1.45l.68-.6a5.5 5.5 0 010-1.3l-.68-.6c-.4-.37-.5-.97-.24-1.45l.55-.94c.26-.48.84-.69 1.35-.49l.84.32c.33-.27.7-.49 1.11-.65l.15-.89zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  inventory: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
}

function RightBar({
  theme,
  variant,
  stops,
  activeIndex,
  progress,
  onJump,
  onStepPrev,
  onStepNext,
  progressFillRef,
  progressRingRef,
}) {
  const total = stops.length
  const counter = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
  const bar = getRightBarStyles(theme)
  const wrap = bar.wrap
  const shellProps = { wrap, bar, onStepPrev, onStepNext }

  // A — Ticks
  if (variant === 'A') {
    return (
      <RightBarShell {...shellProps} gap="gap-2">
        <div className="flex flex-col items-center gap-2">
          {stops.map((stop, idx) => (
            <button
              key={stop.id}
              onClick={() => onJump(idx)}
              aria-label={stop.title}
              aria-current={idx === activeIndex}
              className={`h-3 w-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'bg-primary' : bar.tickInactive
              }`}
            />
          ))}
        </div>
      </RightBarShell>
    )
  }

  // B — Rail with section labels
  if (variant === 'B') {
    return (
      <RightBarShell {...shellProps} gap="gap-2">
        <div className="relative flex flex-col items-center gap-4 py-2">
          <span className={`absolute -top-7 left-1/2 -translate-x-1/2 w-px h-5 ${bar.trackLine}`} />
          {stops.map((stop, idx) => {
            const active = idx === activeIndex
            return (
              <button
                key={stop.id}
                onClick={() => onJump(idx)}
                aria-label={stop.title}
                aria-current={active}
                className="group relative flex items-center"
              >
                <span
                  className={`absolute right-full mr-3 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition-opacity duration-200 ${bar.label} ${
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {stop.title}
                </span>
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    active
                      ? 'h-3 w-3 bg-primary scale-125'
                      : `h-2 w-2 ${bar.dotInactive}`
                  }`}
                />
              </button>
            )
          })}
        </div>
      </RightBarShell>
    )
  }

  // C — Numbered nodes + progress line
  if (variant === 'C') {
    return (
      <RightBarShell {...shellProps} gap="gap-4">
        <span className={bar.counter}>{counter}</span>
        <div className="relative flex flex-col items-center gap-3">
          <span className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px ${bar.track}`} />
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 w-px bg-primary transition-all duration-300"
            style={{ height: `${(activeIndex / (total - 1)) * 100}%` }}
          />
          {stops.map((stop, idx) => {
            const active = idx === activeIndex
            const done = idx < activeIndex
            return (
              <button
                key={stop.id}
                onClick={() => onJump(idx)}
                aria-label={stop.title}
                aria-current={active}
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                  active
                    ? 'bg-primary text-white scale-110'
                    : done
                      ? 'bg-primary/70 text-white'
                      : bar.nodeInactive
                }`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      </RightBarShell>
    )
  }

  // D — Fill track (real scrollbar feel) + tick marks
  if (variant === 'D') {
    return (
      <RightBarShell {...shellProps} gap="gap-4">
        <span className={bar.counter}>{counter}</span>
        <div className={`relative h-48 w-1.5 rounded-full ${bar.track}`}>
          <div
            ref={progressFillRef}
            className="absolute top-0 left-0 w-full rounded-full bg-primary transition-all duration-300"
            style={progressFillRef ? undefined : { height: `${progress * 100}%` }}
          />
          {stops.map((stop, idx) => (
            <button
              key={stop.id}
              onClick={() => onJump(idx)}
              aria-label={stop.title}
              aria-current={idx === activeIndex}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full"
              style={{ top: `${(idx / (total - 1)) * 100}%` }}
            >
              <span
                className={`block h-full w-full rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? `bg-primary ring-2 ${bar.fillTickActiveRing} scale-110`
                    : bar.fillTickInactive
                }`}
              />
            </button>
          ))}
        </div>
      </RightBarShell>
    )
  }

  // E — Per-section icon dots
  if (variant === 'E') {
    return (
      <RightBarShell {...shellProps} gap="gap-3">
        {stops.map((stop, idx) => {
          const active = idx === activeIndex
          return (
            <button
              key={stop.id}
              onClick={() => onJump(idx)}
              aria-label={stop.title}
              aria-current={active}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                active
                  ? 'bg-primary text-white scale-110'
                  : bar.iconInactive
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={STOP_ICON_PATHS[stop.id] || STOP_ICON_PATHS.overview} />
              </svg>
            </button>
          )
        })}
      </RightBarShell>
    )
  }

  // F — Progress ring + dots
  const R = 16
  const C = 2 * Math.PI * R
  return (
    <RightBarShell {...shellProps} gap="gap-4">
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={R} fill="none" stroke={bar.ringTrackStroke} strokeWidth="3" />
          <circle
            ref={progressRingRef}
            cx="20"
            cy="20"
            r={R}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={progressRingRef ? C : C * (1 - progress)}
            style={progressRingRef ? { transition: 'stroke-dashoffset 0.3s ease' } : { transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center ${bar.counter}`}>
          {String(activeIndex + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        {stops.map((stop, idx) => (
          <button
            key={stop.id}
            onClick={() => onJump(idx)}
            aria-label={stop.title}
            aria-current={idx === activeIndex}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              idx === activeIndex ? 'bg-primary scale-150' : bar.dotInactive
            }`}
          />
        ))}
      </div>
    </RightBarShell>
  )
}

export default function Home() {
  const { theme } = useTheme()
  const scrollerRef = useRef(null)
  const tourRef = useRef(null)
  const capabilitiesRef = useRef(null)
  const testimonialsRef = useRef(null)
  const pricingRef = useRef(null)
  const faqRef = useRef(null)
  const signupRef = useRef(null)
  const stageRef = useRef(null)
  const backgroundWrapperRef = useRef(null)
  const backgroundImgRef = useRef(null)
  const heroBlurRef = useRef(null)
  const heroFactoryBlurPxRef = useRef(DEFAULT_HERO_FACTORY_BLUR_PX)
  const heroTextRef = useRef(null)
  const storyCardInnerRef = useRef(null)
  const tourStageRef = useRef(null)
  const rightBarProgressFillRef = useRef(null)
  const rightBarProgressRingRef = useRef(null)
  const tourPanelRefs = useRef([])
  const reducedMotion = useReducedMotion()
  const isMobileTour = useIsMobileTour()
  const [barVariant, setBarVariant] = useState('A')
  const [editMode, setEditMode] = useState(false)
  const [factoryPanMode, setFactoryPanMode] = useState(false)
  const [mobileCameraPanMode, setMobileCameraPanMode] = useState(false)
  const [stops, setStops] = useState(() => cloneStops(DEFAULT_STOPS))
  const [hero, setHero] = useState(() => ({ ...DEFAULT_HERO }))
  const [heroCamera, setHeroCamera] = useState(() => ({ ...DEFAULT_HERO_CAMERA }))
  const [heroCard, setHeroCard] = useState(() => normalizeHeroCardPrefs())
  const [heroFactoryBlurPx, setHeroFactoryBlurPx] = useState(DEFAULT_HERO_FACTORY_BLUR_PX)
  const [tourBackdropOpacity, setTourBackdropOpacity] = useState(() => ({ ...DEFAULT_TOUR_BACKDROP_OPACITY }))
  const [sectionsBackdropOpacity, setSectionsBackdropOpacity] = useState(() => ({ ...DEFAULT_SECTIONS_BACKDROP_OPACITY }))
  const [sectionBackdrops, setSectionBackdrops] = useState(() => ({ ...DEFAULT_SECTION_BACKDROPS }))
  const [capabilities, setCapabilities] = useState(() => cloneCapabilities(DEFAULT_CAPABILITIES))
  const [faq, setFaq] = useState(() => cloneFaq(mergeFaqFromSaved()))
  const [waitlistSource, setWaitlistSource] = useState('waitlist_section')
  const [featureOverlayOpen, setFeatureOverlayOpen] = useState(false)
  const [mobileStopPanelStopId, setMobileStopPanelStopId] = useState(null)
  const [rainbowColorPreset, setRainbowColorPreset] = useState(DEFAULT_RAINBOW_COLOR_PRESET)
  const exportCodeBaseline = useMemo(
    () =>
      normalizeHomepageSnapshot({
        stops: cloneStops(DEFAULT_STOPS),
        hero: { ...DEFAULT_HERO },
        heroCamera: { ...DEFAULT_HERO_CAMERA },
        heroFactoryBlurPx: DEFAULT_HERO_FACTORY_BLUR_PX,
        tourBackdropOpacity: { ...DEFAULT_TOUR_BACKDROP_OPACITY },
        sectionsBackdropOpacity: { ...DEFAULT_SECTIONS_BACKDROP_OPACITY },
        sectionBackdrops: { ...DEFAULT_SECTION_BACKDROPS },
        capabilities: cloneCapabilities(DEFAULT_CAPABILITIES),
        faq: cloneFaq(mergeFaqFromSaved()),
      }),
    [],
  )

  useEffect(() => {
    document.documentElement.classList.add('homepage2-page')
    return () => document.documentElement.classList.remove('homepage2-page')
  }, [])

  useEffect(() => {
    heroFactoryBlurPxRef.current = heroFactoryBlurPx
  }, [heroFactoryBlurPx])

  useEffect(() => {
    applyRainbowColorPreset(rainbowColorPreset)
    return () => clearRainbowColorPresetOverrides()
  }, [rainbowColorPreset])

  const waitlistShineColors = useMemo(
    () => getWaitlistShineColors(rainbowColorPreset),
    [rainbowColorPreset],
  )

  // Tracked on the scroller so every section inherits --login-grad-x/y.
  useLoginGradientFollow(scrollerRef, !reducedMotion)

  const sectionRefMap = useMemo(
    () => ({
      tour: tourRef,
      features: capabilitiesRef,
      proof: testimonialsRef,
      pricing: pricingRef,
      faq: faqRef,
      waitlist: signupRef,
    }),
    [],
  )

  const observedTargets = useMemo(
    () => [
      { id: 'tour', ref: tourRef },
      { id: 'features', ref: capabilitiesRef },
      { id: 'proof', ref: testimonialsRef },
      { id: 'pricing', ref: pricingRef },
      { id: 'faq', ref: faqRef },
      { id: 'waitlist', ref: signupRef },
    ],
    [],
  )

  const { activeSection, glideTo, navigateToSection } = useSectionScroll({
    scrollerRef,
    sectionRefMap,
    observedTargets,
    reducedMotion,
  })

  const featuresBackdropProgress = useTourFeaturesBackdrop({
    scrollerRef,
    featuresRef: capabilitiesRef,
    enabled: !reducedMotion,
  })

  const { activeIndex, heroActive } = useTourCamera({
    scrollerRef,
    tourRef,
    stageRef,
    backgroundWrapperRef,
    backgroundImgRef,
    heroBlurRef,
    heroFactoryBlurPxRef,
    heroTextRef,
    storyCardInnerRef,
    rightBarProgressFillRef,
    rightBarRingRef: rightBarProgressRingRef,
    stops,
    heroCamera,
    reducedMotion,
    editMode,
    isMobile: isMobileTour,
    mobileCameraPanMode,
    overlayPaused: featureOverlayOpen,
  })

  const mobilePanelStop =
    mobileStopPanelStopId && activeStop?.id === mobileStopPanelStopId ? activeStop : null

  const heroPanelCount = 1
  const totalPanels = heroPanelCount + stops.length
  const lastTourPanelIndex = totalPanels - 1
  const TOUR_END_THRESHOLD = 32

  const activeStop = stops[activeIndex]
  const activeCard = normalizeCard(activeStop?.card, DEFAULT_STOPS[activeIndex]?.card)

  const handleCardPositionChange = useCallback(
    (patch) => {
      setStops((prev) =>
        prev.map((s, i) =>
          i === activeIndex
            ? {
                ...s,
                card: { ...normalizeCard(s.card, DEFAULT_STOPS[i]?.card), ...patch },
              }
            : s,
        ),
      )
    },
    [activeIndex],
  )

  const { handleProps: storyCardDragHandleProps } = useStoryCardDrag({
    boundsRef: tourStageRef,
    card: activeCard,
    onCardChange: handleCardPositionChange,
    enabled: editMode && !heroActive && Boolean(activeStop) && !isMobileTour,
  })

  const getTourPanelScrollTop = (panelIndex) => {
    const scroller = scrollerRef.current
    const panel = tourPanelRefs.current[panelIndex]
    if (!scroller || !panel) return null
    return (
      scroller.scrollTop +
      panel.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top
    )
  }

  const getLastTourPanelScrollTop = () => getTourPanelScrollTop(lastTourPanelIndex)

  const readAtLastTourPanel = () => {
    const scroller = scrollerRef.current
    const maxDest = getLastTourPanelScrollTop()
    if (!scroller || maxDest == null) return false
    return scroller.scrollTop >= maxDest - TOUR_END_THRESHOLD
  }

  const scrollToTourPanel = (panelIndex) => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const dest = getTourPanelScrollTop(panelIndex)
    if (dest == null) return

    const maxDest = getLastTourPanelScrollTop()
    const clampedDest = maxDest != null ? Math.min(dest, maxDest) : dest

    scroller.style.scrollSnapType = 'none'
    scroller.scrollTo({
      top: Math.max(0, clampedDest),
      behavior: reducedMotion ? 'auto' : 'smooth',
    })

    const finish = () => {
      if (maxDest != null) {
        scroller.scrollTop = Math.min(scroller.scrollTop, maxDest)
      }
      scroller.style.removeProperty('scroll-snap-type')
    }

    if ('onscrollend' in scroller) {
      scroller.addEventListener('scrollend', finish, { once: true })
    } else {
      window.setTimeout(finish, reducedMotion ? 0 : 600)
    }
  }

  const scrollToStop = (idx) => {
    scrollToTourPanel(idx + heroPanelCount)
  }

  const stepTourPrev = () => {
    if (activeIndex > 0) scrollToStop(activeIndex - 1)
    else scrollToTourPanel(0)
  }

  const stepTourNext = () => {
    const onLastStop = activeIndex >= stops.length - 1 || readAtLastTourPanel()
    if (onLastStop) {
      glideTo(capabilitiesRef)
      return
    }
    scrollToStop(activeIndex + 1)
  }

  const goFaq = () => glideTo(faqRef)

  const goWaitlist = (source = 'waitlist_section') => {
    setWaitlistSource(source)
    navigateToSection('waitlist')
  }

  const handleSectionNavigate = (sectionId) => {
    if (sectionId === 'waitlist') {
      setWaitlistSource('nav')
    }
    navigateToSection(sectionId)
  }

  const goExplore = () => {
    scrollToStop(0)
  }

  useEffect(() => {
    // One-time mount normalization of legacy eyebrow copy.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCapabilities((current) => {
      const eyebrow = normalizeCapabilitiesEyebrow(current.eyebrow)
      if (eyebrow === current.eyebrow) return current
      return { ...current, eyebrow }
    })
  }, [])

  const updateTourBackdropOpacity = (themeKey, value) => {
    setTourBackdropOpacity((current) =>
      normalizeBackdropOpacity(
        {
          ...current,
          [themeKey]: value,
        },
        DEFAULT_TOUR_BACKDROP_OPACITY,
      ),
    )
  }

  const updateSectionsBackdropOpacity = (themeKey, value) => {
    setSectionsBackdropOpacity((current) =>
      normalizeBackdropOpacity(
        {
          ...current,
          [themeKey]: value,
        },
        DEFAULT_SECTIONS_BACKDROP_OPACITY,
      ),
    )
  }

  const toggleSectionBackdrop = (sectionId) => {
    setSectionBackdrops((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }))
  }

  const handleCycleHeroCardLayout = () => {
    setHeroCard((current) => ({
      ...current,
      layout: cycleHeroCardLayout(current.layout),
    }))
  }

  const handleCycleHeroCardStyle = () => {
    setHeroCard((current) => {
      if (current.layout === 'none') return current
      return {
        ...current,
        style: cycleHeroCardStyle(current.style),
      }
    })
  }

  const toggleEditMode = () => {
    setEditMode((prev) => !prev)
  }

  const toggleFactoryPanMode = () => {
    setFactoryPanMode((prev) => {
      if (!prev) {
        const scroller = scrollerRef.current
        if (scroller) {
          scroller.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
      return !prev
    })
  }

  const updateStop = (updatedStop) => {
    setStops((prev) => prev.map((s) => (s.id === updatedStop.id ? updatedStop : s)))
  }

  const handleMobileTourCameraChange = (nextCamera) => {
    if (!activeStop) return
    updateStop({
      ...activeStop,
      mobileCamera: normalizeTourCamera(nextCamera, activeStop),
    })
  }

  const resetMobileTourCamera = () => {
    if (!activeStop?.mobileCamera) return
    const nextStop = { ...activeStop }
    delete nextStop.mobileCamera
    updateStop(nextStop)
  }

  const handleCapabilitiesChange = (nextCapabilities) => {
    setCapabilities(cloneCapabilities(nextCapabilities))
  }

  const handleFaqChange = (patch) => {
    setFaq((prev) => ({ ...prev, ...patch }))
  }

  const resetHeroCamera = () => {
    setHeroCamera({ ...DEFAULT_HERO_CAMERA })
  }

  const handleCopyForCode = () =>
    copyHomepageContentForCode(
      {
        stops,
        hero,
        heroCamera,
        heroFactoryBlurPx,
        tourBackdropOpacity,
        sectionsBackdropOpacity,
        sectionBackdrops,
        capabilities,
        faq,
      },
      { codeBaselineSnapshot: exportCodeBaseline },
    )

  const { card: cardCls, title: titleCls, desc: descCls } = getStoryCardStyles(theme)
  const scrollHintPillCls = getScrollHintPillStyles(theme)
  const lightHeroRadialSoft = theme === 'light' && heroActive && !reducedMotion
  const pageGradientStyle = reducedMotion
    ? getLoginGradientStyle(theme)
    : getLoginRadialGradientStyle(lightHeroRadialSoft ? 'hero-light' : 'default')
  const pageGradientLayerCls = lightHeroRadialSoft
    ? 'opacity-40 mix-blend-normal'
    : 'opacity-70 mix-blend-soft-light'
  const tourBackdropStyle = getBackgroundOverlayStyle(theme, tourBackdropOpacity)
  const sectionsBackdropStyle = getBackgroundOverlayStyle(theme, sectionsBackdropOpacity)
  const showCampusBackdrop = Boolean(sectionBackdrops[activeSection])
  const scrollLinkedFeaturesWash = !reducedMotion
  const sectionsBackdropT = scrollLinkedFeaturesWash
    ? featuresBackdropProgress
    : activeSection !== 'tour'
      ? 1
      : 0
  const tourStageOpacity = scrollLinkedFeaturesWash
    ? Math.max(1 - computeTourStageFadeProgress(featuresBackdropProgress), 0)
    : 1
  const campusSectionsOverlayStyle = scrollLinkedFeaturesWash
    ? getBlendedBackgroundOverlayStyle(
        theme,
        tourBackdropOpacity,
        sectionsBackdropOpacity,
        sectionsBackdropT,
      )
    : sectionsBackdropStyle

  return (
    <div
      ref={scrollerRef}
      className="homepage2-scroller relative h-full min-h-0 overflow-y-auto snap-y snap-mandatory bg-transparent text-foreground"
    >
      <div
        className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-500 ${
          showCampusBackdrop ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        <img
          src={HOMEPAGE_BLUR_BACKGROUNDS[theme]}
          alt=""
          className="homepage-bg-photo transition-opacity duration-500"
        />
        {showCampusBackdrop && sectionsBackdropT > 0 ? (
          <div
            className="absolute inset-0"
            style={
              scrollLinkedFeaturesWash
                ? campusSectionsOverlayStyle
                : { ...sectionsBackdropStyle, opacity: sectionsBackdropT }
            }
            aria-hidden="true"
          />
        ) : null}
        <div
          className={`absolute inset-0 transition-[background,opacity] duration-500 ease-out ${pageGradientLayerCls}`}
          style={pageGradientStyle}
        />
      </div>
      <div className="relative z-[1]">
      <LandingNavBar
        sections={LANDING_SECTIONS}
        activeSection={activeSection}
        onSectionNavigate={handleSectionNavigate}
        desktopActions={
          <div className="hidden items-center gap-2 sm:gap-3 md:flex">
            <DevToolsPopover
              editMode={editMode}
              onToggleEditMode={toggleEditMode}
              factoryPanMode={factoryPanMode}
              onToggleFactoryPanMode={toggleFactoryPanMode}
              mobileCameraPanMode={mobileCameraPanMode}
              onToggleMobileCameraPanMode={() => setMobileCameraPanMode((value) => !value)}
              isMobileTour={isMobileTour}
              barVariant={barVariant}
              onCycleBarVariant={() =>
                setBarVariant(
                  (value) => BAR_VARIANTS[(BAR_VARIANTS.indexOf(value) + 1) % BAR_VARIANTS.length],
                )
              }
              heroCardLayout={getHeroCardLayoutLabel(heroCard.layout)}
              heroCardStyle={getHeroCardStyleLabel(heroCard.style)}
              onCycleHeroCardLayout={handleCycleHeroCardLayout}
              onCycleHeroCardStyle={handleCycleHeroCardStyle}
              heroFactoryBlurPx={heroFactoryBlurPx}
              onHeroFactoryBlurPxChange={setHeroFactoryBlurPx}
              theme={theme}
              tourBackdropOpacity={tourBackdropOpacity}
              onTourBackdropOpacityChange={updateTourBackdropOpacity}
              sectionsBackdropOpacity={sectionsBackdropOpacity}
              onSectionsBackdropOpacityChange={updateSectionsBackdropOpacity}
              sectionBackdrops={sectionBackdrops}
              backdropSections={LANDING_SECTIONS}
              onToggleSectionBackdrop={toggleSectionBackdrop}
              onCopyForCode={handleCopyForCode}
              rainbowColorPreset={rainbowColorPreset}
              onRainbowColorPresetChange={setRainbowColorPreset}
              rainbowColorPresets={RAINBOW_COLOR_PRESET_LIST}
            />
            <ThemeToggleButton variant="nav" />
          </div>
        }
        devToolsProps={{
          editMode,
          onToggleEditMode: toggleEditMode,
          factoryPanMode,
          onToggleFactoryPanMode: toggleFactoryPanMode,
          mobileCameraPanMode,
          onToggleMobileCameraPanMode: () => setMobileCameraPanMode((value) => !value),
          isMobileTour,
          barVariant,
          onCycleBarVariant: () =>
            setBarVariant((value) => BAR_VARIANTS[(BAR_VARIANTS.indexOf(value) + 1) % BAR_VARIANTS.length]),
          heroCardLayout: getHeroCardLayoutLabel(heroCard.layout),
          heroCardStyle: getHeroCardStyleLabel(heroCard.style),
          onCycleHeroCardLayout: handleCycleHeroCardLayout,
          onCycleHeroCardStyle: handleCycleHeroCardStyle,
          heroFactoryBlurPx,
          onHeroFactoryBlurPxChange: setHeroFactoryBlurPx,
          theme,
          tourBackdropOpacity,
          onTourBackdropOpacityChange: updateTourBackdropOpacity,
          sectionsBackdropOpacity,
          onSectionsBackdropOpacityChange: updateSectionsBackdropOpacity,
          sectionBackdrops,
          backdropSections: LANDING_SECTIONS,
          onToggleSectionBackdrop: toggleSectionBackdrop,
          onCopyForCode: handleCopyForCode,
          rainbowColorPreset,
          onRainbowColorPresetChange: setRainbowColorPreset,
          rainbowColorPresets: RAINBOW_COLOR_PRESET_LIST,
        }}
      />

      {/* Scroll-driven building experience */}
      <section ref={tourRef} className="relative">
        {/* Building stage pinned over the snap panels */}
        <div
          ref={tourStageRef}
          className="homepage-tour-dvh sticky top-0 w-full overflow-hidden flex items-center justify-center"
          style={scrollLinkedFeaturesWash ? { opacity: tourStageOpacity } : undefined}
        >
          {/* Campus backdrop — parallax under the scroll-driven factory cutaway */}
          <div
            ref={backgroundWrapperRef}
            className="homepage-tour-bg-wrapper pointer-events-none will-change-transform"
          >
            <img
              ref={backgroundImgRef}
              src={HOMEPAGE_BACKGROUNDS[theme]}
              alt=""
              aria-hidden="true"
              className="homepage-tour-bg-photo select-none"
              style={{ opacity: 0 }}
              draggable={false}
            />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={tourBackdropStyle}
          />

          <div
            ref={stageRef}
            className="relative z-[1] homepage-tour-dvh aspect-[1024/831] will-change-transform"
          >
            <img
              src={BUILDING_IMAGE}
              alt="Marker headquarters cutaway"
              className="h-full w-full object-cover select-none"
              draggable={false}
            />
          </div>

          <div
            ref={heroBlurRef}
            aria-hidden="true"
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ opacity: 1 }}
          />

          {/* Hero overlay — first screen before scroll */}
          <div
            ref={heroTextRef}
            className={`absolute inset-0 pt-[calc(env(safe-area-inset-top,0px)+4.5rem)] md:pt-0 ${
              heroActive ? '' : 'pointer-events-none'
            } ${editMode && heroActive ? 'z-40 pointer-events-auto' : 'z-30'}`}
            style={{ opacity: 1 }}
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${
                theme === 'light'
                  ? 'from-black/18 via-black/8 to-transparent'
                  : 'from-black/60 via-black/35 to-black/10'
              }`}
            />
            <div className="relative flex h-full items-center justify-center">
              <Homepage2HeroOverlay
                hero={hero}
                theme={theme}
                layout={heroCard.layout}
                style={heroCard.style}
                editMode={editMode}
                heroActive={heroActive}
                onGoWaitlist={() => goWaitlist('hero')}
                onGoExplore={goExplore}
                onHeroChange={setHero}
              />
            </div>

            {!editMode && !factoryPanMode && !mobileCameraPanMode && (
              <div className="pointer-events-none absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${scrollHintPillCls}`}>
                  <span>Scroll to explore</span>
                  <svg className="h-4 w-4 animate-bounce text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {factoryPanMode && heroActive && (
            <div className="pointer-events-auto absolute bottom-6 left-4 sm:bottom-8 sm:left-6 z-50">
              <Homepage2HeroCameraControls
                camera={heroCamera}
                onChange={(nextCamera) => setHeroCamera(normalizeHeroCamera(nextCamera))}
                onReset={resetHeroCamera}
              />
            </div>
          )}

          {isMobileTour && mobileCameraPanMode && !heroActive && activeStop && (
            <div className="pointer-events-auto absolute left-4 top-[calc(env(safe-area-inset-top,0px)+4.75rem)] z-50 md:hidden">
              <Homepage2HeroCameraControls
                title="Mobile tour camera"
                description={`Pan/zoom “${activeStop.title}”. Saves per-stop override this session.`}
                limits={TOUR_CAMERA_LIMITS}
                camera={normalizeTourCamera(activeStop.mobileCamera, activeStop)}
                onChange={handleMobileTourCameraChange}
                onReset={resetMobileTourCamera}
              />
            </div>
          )}

          {editMode && !heroActive && activeStop && !isMobileTour ? (
            <Homepage2FloatingCardLayoutControls
              boundsRef={tourStageRef}
              stop={activeStop}
              onChange={updateStop}
            />
          ) : null}

          {/* Feature story card — desktop only; mobile uses compact bottom card */}
          <div
            className={`pointer-events-none absolute hidden md:block ${editMode ? 'z-40' : 'z-10'}`}
            style={{
              left: activeCard.x,
              top: activeCard.y,
              transform: `translate(${ANCHOR_TRANSLATE[activeCard.anchor]})`,
            }}
          >
            <div
              ref={storyCardInnerRef}
              className={`pointer-events-auto isolate rounded-2xl border shadow-2xl ${cardCls} ${
                editMode ? 'ring-2 ring-primary/50' : ''
              } ${editMode ? 'overflow-hidden' : 'p-6'}`}
              style={{
                ...getCardStyle(activeCard, DEFAULT_STOPS[activeIndex]?.card),
                transition: 'none',
              }}
            >
              {editMode ? (
                <div
                  {...storyCardDragHandleProps}
                  className={`flex items-center justify-between gap-3 border-b border-primary/25 bg-primary/10 px-4 py-2.5 ${storyCardDragHandleProps.className}`}
                >
                  <span className="text-[11px] font-medium uppercase tracking-wide text-primary/90">
                    Drag to move
                  </span>
                  <span className="text-base text-primary/50" aria-hidden="true">
                    ⠿
                  </span>
                </div>
              ) : null}
              {activeStop ? (
                <div className={editMode ? 'p-6 pt-4' : ''}>
                  <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${titleCls}`}>
                    {activeStop.title}
                  </h2>
                  <p className={`mt-3 text-sm sm:text-base leading-relaxed ${descCls}`}>
                    {activeStop.desc}
                  </p>
                  {activeStop.desc2 && (
                    <p className={`mt-3 text-sm sm:text-base leading-relaxed ${descCls}`}>
                      {activeStop.desc2}
                    </p>
                  )}
                  {activeStop.points && (
                    <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5">
                      {activeStop.points.map((p) => (
                        <li key={p} className={`flex items-start gap-2 text-sm ${descCls}`}>
                          <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <TourMobileCompactCard
            stop={activeStop}
            theme={theme}
            visible={!heroActive && Boolean(activeStop)}
            onOpen={() => activeStop?.id && setMobileStopPanelStopId(activeStop.id)}
          />

          {!heroActive && !isMobileTour && (
            <RightBar
              theme={theme}
              variant={barVariant}
              stops={stops}
              activeIndex={activeIndex}
              progress={0}
              onJump={scrollToStop}
              onStepPrev={stepTourPrev}
              onStepNext={stepTourNext}
              progressFillRef={rightBarProgressFillRef}
              progressRingRef={rightBarProgressRingRef}
            />
          )}

        </div>

        {/* Snap panels — one per stop. Pulled up under the sticky stage so the
            first panel aligns with progress 0. Each is a scroll-snap target. */}
        <div className="homepage-tour-panels-offset">
          <div
            ref={(el) => {
              tourPanelRefs.current[0] = el
            }}
            key="hero"
            className="homepage-tour-dvh snap-start"
            aria-hidden="true"
          />
          {stops.map((stop, idx) => (
            <div
              ref={(el) => {
                tourPanelRefs.current[idx + 1] = el
              }}
              key={stop.id}
              className={`homepage-tour-dvh snap-start${idx === stops.length - 1 ? ' snap-always' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </section>

      <TourMobileStopPanel
        stop={mobilePanelStop}
        theme={theme}
        scrollerRef={scrollerRef}
        reducedMotion={reducedMotion}
        onClose={() => setMobileStopPanelStopId(null)}
      />

      <LandingPostTourSections
        capabilitiesRef={capabilitiesRef}
        testimonialsRef={testimonialsRef}
        pricingRef={pricingRef}
        faqRef={faqRef}
        signupRef={signupRef}
        waitlistSource={waitlistSource}
        displayCapabilities={capabilities}
        reducedMotion={reducedMotion}
        editMode={editMode}
        scrollerRef={scrollerRef}
        theme={theme}
        sectionBackdrops={sectionBackdrops}
        sectionsBackdropStyle={sectionsBackdropStyle}
        onFeatureOverlayOpenChange={setFeatureOverlayOpen}
        onCapabilitiesChange={handleCapabilitiesChange}
        displayFaq={faq}
        onFaqChange={handleFaqChange}
        onFaqClick={goFaq}
        onJoinWaitlist={(source) => goWaitlist(source)}
        waitlistShineColors={waitlistShineColors}
      />
      </div>
    </div>
  )
}
