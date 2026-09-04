import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import LandingNavBar from '../components/LandingNavBar'
import DevToolsPopover from '../components/DevToolsPopover'
import LandingPerfHud from '../components/LandingPerfHud'
import LandingPerfTourSync from '../components/LandingPerfTourSync'
import ShareFeedbackButton from '../components/ShareFeedbackButton'
import { useLandingPerfHudToggle } from '../context/LandingPerfContext'
import { runLandingPerfAudit, scrollScrollerTo } from '../lib/landingPerfAudit'
import {
  collectDeviceContext,
  formatLandingFeedbackReport,
  readVitalsSnapshot,
} from '../lib/landingPerfReport'
import ThemeToggleButton from '../components/ThemeToggleButton'
import Button from '../components/ui/Button'
import LandingPostTourSections from '../components/LandingPostTourSections'
import WaitlistFab from '../components/waitlist/WaitlistFab'
import WaitlistMobileNavSignUp from '../components/waitlist/WaitlistMobileNavSignUp'
import WaitlistModal from '../components/waitlist/WaitlistModal'
import { clearWaitlistMorphOrigin, getOriginChrome, markWaitlistMorphOrigin, resolveTravelBg } from '../lib/waitlistFabMorph'
import Homepage2HeroOverlay from '../components/Homepage2HeroOverlay'
import TourMobileStopDrawer from '../components/tour/TourMobileStopDrawer'
import TourStoryCardBody from '../components/tour/TourStoryCardBody'
import useLandingMotion from '../hooks/useLandingMotion'
import useIsMobileTour from '../hooks/useIsMobileTour'
import useSectionScroll from '../hooks/useSectionScroll'
import useTourCamera from '../hooks/useTourCamera'
import useTourFeaturesBackdrop from '../hooks/useTourFeaturesBackdrop'
import { DEFAULT_TOUR_TRANSITION_SPEED, DEFAULT_TOUR_CARD_CONTENT_SPEED, computeTourStageFadeProgress } from '../lib/tourScrollMath'
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
  DEFAULT_HERO_MOBILE_CAMERA,
  normalizeHeroCamera,
  normalizeHeroMobileCamera,
  normalizeTourCamera,
  TOUR_CAMERA_LIMITS,
} from './Homepage2HeroCameraControls'
import { getLoginGradientStyle } from '../../shared/loginGradient.js'
import useStoryCardDrag from '../hooks/useStoryCardDrag'
import { DEFAULT_CARD, getCardStyle, normalizeCard } from './Homepage2CardControls'
import { getStoryCardStyles } from '../lib/storyCardStyles'
import { copyHomepageContentForCode, normalizeHomepageSnapshot } from '../lib/homepageContentExport'
import {
  applyRainbowColorPreset,
  clearRainbowColorPresetOverrides,
  DEFAULT_RAINBOW_COLOR_PRESET,
  RAINBOW_COLOR_PRESET_LIST,
} from '../lib/rainbowColorPresets'
import {
  DEFAULT_SECTIONS_BACKDROP_OPACITY,
  DEFAULT_TOUR_BACKDROP_OPACITY,
  getBackgroundOverlayStyle,
  getBlendedBackgroundOverlayStyle,
  normalizeBackdropOpacity,
} from '../lib/homepageWash'
import {
  DEFAULT_HERO_OVERLAY_SCRIM_STRENGTH,
  DEFAULT_HERO_OVERLAY_SCRIM_STYLE,
  getHeroOverlayScrimLayer,
  getHeroOverlayScrimOpacity,
  HERO_OVERLAY_SCRIM_STYLE_LIST,
  normalizeHeroOverlayScrimStrength,
} from '../lib/heroScrimStyles'
import {
  DEFAULT_DARK_SIGN_UP_VARIANT,
  DEFAULT_LIGHT_SIGN_UP_VARIANT,
  getSignUpVariantForTheme,
  SIGN_UP_BUTTON_VARIANT_LIST,
} from '../lib/heroSignUpButtonVariants'
import {
  BUILDING_BLUR_SRC,
  BUILDING_BLUR_SRCSET,
  BUILDING_BLUR_RESPONSIVE_SIZES,
  BUILDING_RESPONSIVE_SIZES,
  BUILDING_SHARP_SRC,
  BUILDING_SHARP_SRCSET,
  HOMEPAGE_BACKGROUNDS,
  HOMEPAGE_BACKGROUND_SRCSETS,
  HOMEPAGE_BLUR_BACKGROUNDS,
  HOMEPAGE_BLUR_BACKGROUND_SRCSETS,
  HOMEPAGE_RESPONSIVE_SIZES,
} from '../lib/homepageImages'
import { SHOW_LANDING_DEV_TOOLS, SHOW_PERF_HUD, SHOW_PRICING_SECTION } from '../lib/landingFeatureFlags'
import {
  DEFAULT_WAITLIST_FAB_STYLE,
  getWaitlistFabMorphMeta,
  WAITLIST_FAB_STYLE_LIST,
} from '../lib/waitlistFabStyles'

const DEFAULT_SECTION_BACKDROPS = {
  tour: true,
  features: true,
  proof: true,
  pricing: true,
  faq: true,
}

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
      tickInactive: 'bg-white/40 hover:bg-white/70',
      arrowBtn:
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25',
    }
  }

  return {
    wrap: `${base} border border-white/60 bg-white/75 ring-1 ring-black/5`,
    tickInactive: 'bg-black/25 hover:bg-black/40',
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
 * Production assets: PRIMARY_BUILDING_IMAGE (sharp, tour) + BLURRED_BUILDING_IMAGE (hero only).
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
    card: { x: '53%', y: '58%', widthPx: 640, heightPx: null, maxWidthVw: 92 },
    mobileCamera: { fx: 0.5, fy: 0.56, scale: 1.08 },
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
    card: { x: '55%', y: '50%', widthPx: 640, heightPx: null, maxWidthVw: 92 },
    mobileCamera: { fx: 0.48, fy: 0.26, scale: 1.77 },
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
    card: { x: '4%', y: '49%', widthPx: 640, heightPx: null, maxWidthVw: 92 },
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
    card: { x: '51%', y: '56%', widthPx: 640, heightPx: null, maxWidthVw: 92 },
    mobileCamera: { fx: 0.68, fy: 0.54, scale: 1.72 },
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
    card: { x: '4%', y: '50%', widthPx: 640, heightPx: null, maxWidthVw: 92 },
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
    card: { x: '53%', y: '56%', widthPx: 640, heightPx: null, maxWidthVw: 92 },
    mobileCamera: { fx: 0.65, fy: 0.8, scale: 1.88 },
  },
]

const DEFAULT_HERO = {
  badge: 'Kolom ERP',
  title: 'Your factory at your fingertips.',
  subtitle: '',
  paragraph:
    "Manage your entire workspace from anywhere. Whether you're running solo, or collaborating with a massive team, or are an experienced manager working with multiple corporations, get detailed insights of how your operations are running.",
  paragraph2:
    "You won't know how much you're losing until you start tracking, at a price that won't break the bank but instead help you make some.",
}

function cloneStops(stops) {
  return stops.map((s, i) => ({
    ...s,
    points: [...(s.points || [])],
    card: normalizeCard(s.card, DEFAULT_STOPS[i]?.card || DEFAULT_CARD),
    mobileCamera: s.mobileCamera ? { ...s.mobileCamera } : undefined,
  }))
}

const ALL_LANDING_SECTIONS = [
  { id: 'tour', label: 'Tour' },
  { id: 'features', label: 'Features' },
  { id: 'proof', label: 'Proof' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
]

const LANDING_SECTIONS = ALL_LANDING_SECTIONS.filter(
  (section) => SHOW_PRICING_SECTION || section.id !== 'pricing',
)

function RightBar({ theme, stops, activeIndex, onJump, onStepPrev, onStepNext }) {
  const bar = getRightBarStyles(theme)

  return (
    <RightBarShell wrap={bar.wrap} bar={bar} gap="gap-2" onStepPrev={onStepPrev} onStepNext={onStepNext}>
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

const WAITLIST_RAINBOW_META = { label: 'Sign Up', variant: 'brand', face: 'rainbow' }

export default function Home() {
  const { theme } = useTheme()
  const scrollerRef = useRef(null)
  const tourRef = useRef(null)
  const capabilitiesRef = useRef(null)
  const testimonialsRef = useRef(null)
  const pricingRef = useRef(null)
  const faqRef = useRef(null)
  const waitlistFabRef = useRef(null)
  const waitlistMobileNavRef = useRef(null)
  const heroSignUpRef = useRef(null)
  const waitlistReturnFocusRef = useRef(null)
  const stageRef = useRef(null)
  const backgroundWrapperRef = useRef(null)
  const backgroundImgRef = useRef(null)
  const heroBlurRef = useRef(null)
  const buildingSharpRef = useRef(null)
  const tourTransitionSpeedRef = useRef(DEFAULT_TOUR_TRANSITION_SPEED)
  const tourCardContentSpeedRef = useRef(DEFAULT_TOUR_CARD_CONTENT_SPEED)
  const heroTextRef = useRef(null)
  const storyCardInnerRef = useRef(null)
  const storyCardWrapperRef = useRef(null)
  const storyCardContentShellRef = useRef(null)
  const storyCardCopyRef = useRef(null)
  const tourStageRef = useRef(null)
  const tourPanelRefs = useRef([])
  const { reducedMotion } = useLandingMotion()
  const isMobileTour = useIsMobileTour()
  const [editMode, setEditMode] = useState(false)
  const [factoryPanMode, setFactoryPanMode] = useState(false)
  const [mobileCameraPanMode, setMobileCameraPanMode] = useState(false)
  const [stops, setStops] = useState(() => cloneStops(DEFAULT_STOPS))
  const [hero, setHero] = useState(() => ({ ...DEFAULT_HERO }))
  const [heroCamera, setHeroCamera] = useState(() => ({ ...DEFAULT_HERO_CAMERA }))
  const [heroMobileCamera, setHeroMobileCamera] = useState(() => ({ ...DEFAULT_HERO_MOBILE_CAMERA }))
  const [tourTransitionSpeed, setTourTransitionSpeed] = useState(DEFAULT_TOUR_TRANSITION_SPEED)
  const [tourCardContentSpeed, setTourCardContentSpeed] = useState(DEFAULT_TOUR_CARD_CONTENT_SPEED)
  const [tourBackdropOpacity, setTourBackdropOpacity] = useState(() => ({ ...DEFAULT_TOUR_BACKDROP_OPACITY }))
  const [sectionsBackdropOpacity, setSectionsBackdropOpacity] = useState(() => ({ ...DEFAULT_SECTIONS_BACKDROP_OPACITY }))
  const [sectionBackdrops, setSectionBackdrops] = useState(() => ({ ...DEFAULT_SECTION_BACKDROPS }))
  const [capabilities, setCapabilities] = useState(() => cloneCapabilities(DEFAULT_CAPABILITIES))
  const [faq, setFaq] = useState(() => cloneFaq(mergeFaqFromSaved()))
  const [waitlistSource, setWaitlistSource] = useState('waitlist_section')
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false)
  const [waitlistOriginRect, setWaitlistOriginRect] = useState(null)
  const [waitlistMorphMeta, setWaitlistMorphMeta] = useState(null)
  const [featureOverlayOpen, setFeatureOverlayOpen] = useState(false)
  const [mobileStopPanelStopId, setMobileStopPanelStopId] = useState(null)
  const [rainbowColorPreset, setRainbowColorPreset] = useState(DEFAULT_RAINBOW_COLOR_PRESET)
  const [heroOverlayScrimStrength, setHeroOverlayScrimStrength] = useState(
    () => ({ ...DEFAULT_HERO_OVERLAY_SCRIM_STRENGTH }),
  )
  const [heroOverlayScrimStyle, setHeroOverlayScrimStyle] = useState(
    DEFAULT_HERO_OVERLAY_SCRIM_STYLE,
  )
  const [lightSignUpVariant, setLightSignUpVariant] = useState(DEFAULT_LIGHT_SIGN_UP_VARIANT)
  const [darkSignUpVariant, setDarkSignUpVariant] = useState(DEFAULT_DARK_SIGN_UP_VARIANT)
  const [waitlistFabStyle, setWaitlistFabStyle] = useState(DEFAULT_WAITLIST_FAB_STYLE)
  const [perfHudEnabled, setPerfHudEnabled] = useState(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).has('perf')
  })
  const signUpButtonVariant = getSignUpVariantForTheme(theme, lightSignUpVariant, darkSignUpVariant)
  const exportCodeBaseline = useMemo(
    () =>
      normalizeHomepageSnapshot({
        stops: cloneStops(DEFAULT_STOPS),
        hero: { ...DEFAULT_HERO },
        heroCamera: { ...DEFAULT_HERO_CAMERA },
        heroMobileCamera: { ...DEFAULT_HERO_MOBILE_CAMERA },
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
    tourTransitionSpeedRef.current = tourTransitionSpeed
  }, [tourTransitionSpeed])

  useEffect(() => {
    tourCardContentSpeedRef.current = tourCardContentSpeed
  }, [tourCardContentSpeed])

  useEffect(() => {
    applyRainbowColorPreset(rainbowColorPreset)
    return () => clearRainbowColorPresetOverrides()
  }, [rainbowColorPreset])

  const heroOverlayScrimLayer = useMemo(
    () => getHeroOverlayScrimLayer(theme, heroOverlayScrimStyle),
    [theme, heroOverlayScrimStyle],
  )

  const heroOverlayScrimOpacity = useMemo(
    () =>
      getHeroOverlayScrimOpacity(heroOverlayScrimStrength, theme, heroOverlayScrimStyle),
    [heroOverlayScrimStrength, theme, heroOverlayScrimStyle],
  )


  const sectionRefMap = useMemo(
    () => ({
      tour: tourRef,
      features: capabilitiesRef,
      proof: testimonialsRef,
      ...(SHOW_PRICING_SECTION ? { pricing: pricingRef } : {}),
      faq: faqRef,
    }),
    [],
  )

  const observedTargets = useMemo(
    () =>
      [
        { id: 'tour', ref: tourRef },
        { id: 'features', ref: capabilitiesRef },
        { id: 'proof', ref: testimonialsRef },
        SHOW_PRICING_SECTION ? { id: 'pricing', ref: pricingRef } : null,
        { id: 'faq', ref: faqRef },
      ].filter(Boolean),
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

  const { activeIndex, heroActive, contentStopIndex, heroExitAdvanced, tourMetricsRef } = useTourCamera({
    scrollerRef,
    tourRef,
    stageRef,
    cardBoundsRef: tourStageRef,
    backgroundWrapperRef,
    backgroundImgRef,
    heroBlurRef,
    buildingSharpRef,
    heroTextRef,
    storyCardInnerRef,
    storyCardWrapperRef,
    storyCardContentShellRef,
    storyCardCopyRef,
    tourTransitionSpeedRef,
    tourCardContentSpeedRef,
    stops,
    heroCamera,
    heroMobileCamera,
    reducedMotion,
    editMode,
    isMobile: isMobileTour,
    mobileCameraPanMode,
    overlayPaused: featureOverlayOpen,
  })

  const waitlistFabVisible =
    !editMode && !featureOverlayOpen && !heroActive && !isMobileTour

  const heroPanelCount = 1
  const totalPanels = heroPanelCount + stops.length
  const lastTourPanelIndex = totalPanels - 1
  const TOUR_END_THRESHOLD = 32

  const activeStop = stops[activeIndex]
  const contentStop = stops[contentStopIndex]
  const mobilePanelStop = mobileStopPanelStopId
    ? stops.find((s) => s.id === mobileStopPanelStopId) ?? null
    : null
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
      const speed = tourTransitionSpeedRef.current ?? DEFAULT_TOUR_TRANSITION_SPEED
      window.setTimeout(finish, reducedMotion ? 0 : Math.round(600 / speed))
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

  const openWaitlist = useCallback((source = 'waitlist_section', rect = null, meta = null, triggerEl = null) => {
    clearWaitlistMorphOrigin()

    const baseMeta = meta ?? WAITLIST_RAINBOW_META
    const originChrome = triggerEl ? getOriginChrome(triggerEl) : {}
    const resolvedMeta = {
      ...baseMeta,
      borderRadius: originChrome.borderRadius ?? baseMeta.borderRadius,
      travelBg: baseMeta.travelBg ?? resolveTravelBg(baseMeta),
    }
    const focusTarget =
      triggerEl ?? waitlistFabRef.current ?? waitlistMobileNavRef.current ?? document.activeElement

    if (triggerEl) {
      markWaitlistMorphOrigin(triggerEl)
    }

    waitlistReturnFocusRef.current = focusTarget
    setWaitlistSource(source)
    setWaitlistOriginRect(rect)
    setWaitlistMorphMeta(resolvedMeta)
    setWaitlistModalOpen(true)
  }, [])

  const handleWaitlistModalClose = () => {
    clearWaitlistMorphOrigin()
    setWaitlistModalOpen(false)
    setWaitlistOriginRect(null)
    setWaitlistMorphMeta(null)
    waitlistReturnFocusRef.current = null
  }

  const handleSectionNavigate = (sectionId) => {
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

  const updateHeroOverlayScrimStrength = (themeKey, value) => {
    setHeroOverlayScrimStrength((current) =>
      normalizeHeroOverlayScrimStrength(
        {
          ...current,
          [themeKey]: value,
        },
        DEFAULT_HERO_OVERLAY_SCRIM_STRENGTH,
      ),
    )
  }

  const toggleSectionBackdrop = (sectionId) => {
    setSectionBackdrops((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }))
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

  const resetHeroMobileCamera = () => {
    setHeroMobileCamera({ ...DEFAULT_HERO_MOBILE_CAMERA })
  }

  const handleCopyForCode = () =>
    copyHomepageContentForCode(
      {
        stops,
        hero,
        heroCamera,
        heroMobileCamera,
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
  const pageGradientStyle = getLoginGradientStyle(theme)
  const pageGradientLayerCls = 'opacity-70 mix-blend-soft-light'
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

  const mobileTourDrawerVisible =
    !heroActive &&
    Boolean(activeStop) &&
    activeSection === 'tour' &&
    (reducedMotion || featuresBackdropProgress < 0.12)

  const perfMonitorEnabled = SHOW_PERF_HUD && perfHudEnabled
  useLandingPerfHudToggle(perfMonitorEnabled)

  const feedbackTourContext = useMemo(
    () => ({
      theme,
      isMobileTour,
      heroActive,
      activeIndex,
      activeSection,
      mobileTourDrawerVisible,
      featuresBackdropProgress,
    }),
    [
      theme,
      isMobileTour,
      heroActive,
      activeIndex,
      activeSection,
      mobileTourDrawerVisible,
      featuresBackdropProgress,
    ],
  )

  const feedbackTourContextRef = useRef(feedbackTourContext)
  feedbackTourContextRef.current = feedbackTourContext

  const getSectionScrollTop = useCallback(
    (targetRef) => {
      const scroller = scrollerRef.current
      const target = targetRef?.current
      if (!scroller || !target) return null
      return (
        scroller.scrollTop +
        target.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top
      )
    },
    [],
  )

  const collectFeedbackReport = useCallback(async () => {
    const scroller = scrollerRef.current
    const getTourContext = () => feedbackTourContextRef.current

    if (!scroller) {
      return formatLandingFeedbackReport({
        device: collectDeviceContext(),
        tour: getTourContext(),
        vitals: readVitalsSnapshot(),
        burst: null,
        perfSession: null,
      })
    }

    const steps = []

    for (let panelIndex = 0; panelIndex <= lastTourPanelIndex; panelIndex += 1) {
      steps.push(async () => {
        const dest = getTourPanelScrollTop(panelIndex)
        if (dest == null) return
        const maxDest = getLastTourPanelScrollTop()
        const clampedDest = maxDest != null ? Math.min(dest, maxDest) : dest
        await scrollScrollerTo(scroller, Math.max(0, clampedDest), { reducedMotion })
      })
    }

    for (const { id, ref } of observedTargets) {
      if (id === 'tour') continue
      steps.push(async () => {
        const dest = getSectionScrollTop(ref)
        if (dest == null) return
        await scrollScrollerTo(scroller, dest, { reducedMotion })
      })
    }

    const { snapshot, burst } = await runLandingPerfAudit({
      steps,
      getTourContext,
      reducedMotion,
    })

    return formatLandingFeedbackReport({
      device: collectDeviceContext(),
      tour: getTourContext(),
      vitals: readVitalsSnapshot(),
      burst,
      perfSession: snapshot,
    })
  }, [
    getSectionScrollTop,
    getTourPanelScrollTop,
    getLastTourPanelScrollTop,
    lastTourPanelIndex,
    observedTargets,
    reducedMotion,
  ])

  const landingDevToolsProps = SHOW_LANDING_DEV_TOOLS
    ? {
        editMode,
        onToggleEditMode: toggleEditMode,
        factoryPanMode,
        onToggleFactoryPanMode: toggleFactoryPanMode,
        mobileCameraPanMode,
        onToggleMobileCameraPanMode: () => setMobileCameraPanMode((value) => !value),
        isMobileTour,
        tourTransitionSpeed,
        onTourTransitionSpeedChange: setTourTransitionSpeed,
        tourCardContentSpeed,
        onTourCardContentSpeedChange: setTourCardContentSpeed,
        heroOverlayScrimStrength,
        onHeroOverlayScrimStrengthChange: updateHeroOverlayScrimStrength,
        heroOverlayScrimStyle,
        onHeroOverlayScrimStyleChange: setHeroOverlayScrimStyle,
        heroOverlayScrimStyles: HERO_OVERLAY_SCRIM_STYLE_LIST,
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
        lightSignUpVariant,
        onLightSignUpVariantChange: setLightSignUpVariant,
        darkSignUpVariant,
        onDarkSignUpVariantChange: setDarkSignUpVariant,
        signUpButtonVariants: SIGN_UP_BUTTON_VARIANT_LIST,
        waitlistFabStyle,
        onWaitlistFabStyleChange: setWaitlistFabStyle,
        waitlistFabStyles: WAITLIST_FAB_STYLE_LIST,
        perfHudEnabled,
        onTogglePerfHud: () => setPerfHudEnabled((value) => !value),
        showPerfHudToggle: SHOW_PERF_HUD,
      }
    : undefined

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
          srcSet={HOMEPAGE_BLUR_BACKGROUND_SRCSETS[theme]}
          sizes={HOMEPAGE_RESPONSIVE_SIZES}
          alt=""
          decoding="async"
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
        mobileActions={
          <div className="flex items-center gap-1.5">
            <ShareFeedbackButton collectReport={collectFeedbackReport} />
            <WaitlistMobileNavSignUp
              ref={waitlistMobileNavRef}
              visible={isMobileTour && !heroActive && !editMode && !featureOverlayOpen}
              morphing={waitlistModalOpen}
              variant={signUpButtonVariant}
              onClick={(rect, triggerEl) =>
                openWaitlist(
                  'nav',
                  rect,
                  { ...WAITLIST_RAINBOW_META, variant: signUpButtonVariant },
                  triggerEl,
                )
              }
            />
          </div>
        }
        desktopActions={
          <div className="hidden items-center gap-2 sm:gap-3 md:flex">
            {landingDevToolsProps ? <DevToolsPopover {...landingDevToolsProps} /> : null}
            <ShareFeedbackButton collectReport={collectFeedbackReport} />
            <WaitlistFab
              ref={waitlistFabRef}
              placement="inline"
              visible={waitlistFabVisible}
              morphing={waitlistModalOpen}
              enterFromHero
              fabStyle={waitlistFabStyle}
              variant={signUpButtonVariant}
              onClick={(rect, triggerEl) =>
                openWaitlist(
                  'waitlist_section',
                  rect,
                  { ...getWaitlistFabMorphMeta(waitlistFabStyle), variant: signUpButtonVariant },
                  triggerEl,
                )
              }
            />
            <ThemeToggleButton variant="nav" />
          </div>
        }
        devToolsProps={landingDevToolsProps}
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
              srcSet={HOMEPAGE_BACKGROUND_SRCSETS[theme]}
              sizes={HOMEPAGE_RESPONSIVE_SIZES}
              alt=""
              aria-hidden="true"
              decoding="async"
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
            className="homepage-tour-stage relative z-[1] will-change-transform overflow-hidden"
          >
            <img
              ref={buildingSharpRef}
              src={BUILDING_SHARP_SRC}
              srcSet={BUILDING_SHARP_SRCSET}
              sizes={BUILDING_RESPONSIVE_SIZES}
              alt="Kolom headquarters cutaway"
              className="homepage-tour-building-img homepage-tour-building-sharp h-full w-full select-none"
              fetchPriority="high"
              draggable={false}
              style={{ opacity: 0 }}
            />
            <img
              ref={heroBlurRef}
              src={BUILDING_BLUR_SRC}
              srcSet={BUILDING_BLUR_SRCSET}
              sizes={BUILDING_BLUR_RESPONSIVE_SIZES}
              alt=""
              aria-hidden="true"
              decoding="async"
              className="homepage-tour-building-img homepage-tour-building-blur absolute inset-0 h-full w-full select-none pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Hero overlay — first screen before scroll */}
          <div
            ref={heroTextRef}
            className={`absolute inset-0 pt-[calc(env(safe-area-inset-top,0px)+4.5rem)] md:pt-0 ${
              heroActive ? '' : 'pointer-events-none homepage-hero-overlay--inactive'
            } ${editMode && heroActive ? 'z-40 pointer-events-auto' : 'z-30'}`}
            style={{ opacity: 1 }}
          >
            <div
              aria-hidden="true"
              className={heroOverlayScrimLayer.className}
              style={{
                ...heroOverlayScrimLayer.style,
                opacity: heroOverlayScrimOpacity,
              }}
            />
            <div className="relative flex h-full items-center justify-center">
              <Homepage2HeroOverlay
                hero={hero}
                editMode={editMode}
                heroActive={heroActive}
                heroSignUpRef={heroSignUpRef}
                onGoWaitlist={(rect, triggerEl) =>
                  openWaitlist(
                    'hero',
                    rect,
                    { label: 'Sign Up', variant: signUpButtonVariant, face: 'rainbow' },
                    triggerEl,
                  )
                }
                onGoExplore={goExplore}
                onHeroChange={setHero}
                heroSignUpButtonVariant={signUpButtonVariant}
              />
            </div>

            {!editMode && !factoryPanMode && !mobileCameraPanMode && (
              <div className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom,0px)+2rem)] sm:bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center">
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
            <div
              className={`pointer-events-auto absolute z-50 ${
                isMobileTour
                  ? 'left-4 top-[calc(env(safe-area-inset-top,0px)+4.75rem)]'
                  : 'bottom-6 left-4 sm:bottom-8 sm:left-6'
              }`}
            >
              <Homepage2HeroCameraControls
                title={isMobileTour ? 'Mobile hero factory' : 'Factory pan'}
                description={
                  isMobileTour
                    ? 'Hero framing on mobile — wider zoom-out so isometric sides stay visible.'
                    : 'Move the factory on the hero screen. Story stops keep their normal framing.'
                }
                camera={isMobileTour ? heroMobileCamera : heroCamera}
                onChange={(nextCamera) =>
                  isMobileTour
                    ? setHeroMobileCamera(normalizeHeroMobileCamera(nextCamera))
                    : setHeroCamera(normalizeHeroCamera(nextCamera))
                }
                onReset={isMobileTour ? resetHeroMobileCamera : resetHeroCamera}
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
            ref={storyCardWrapperRef}
            className={`pointer-events-none absolute ${isMobileTour ? 'hidden' : 'block'} ${editMode ? 'z-40' : 'z-10'}`}
            style={
              editMode
                ? {
                    left: activeCard.x,
                    top: activeCard.y,
                    transform: 'none',
                  }
                : undefined
            }
          >
            <div
              ref={storyCardInnerRef}
              className={`pointer-events-auto isolate rounded-2xl border shadow-2xl ${cardCls} ${
                editMode ? 'ring-2 ring-primary/50' : ''
              } ${editMode ? 'overflow-hidden' : 'p-6'}`}
              style={
                editMode
                  ? {
                      ...getCardStyle(activeCard, DEFAULT_STOPS[activeIndex]?.card),
                      transition: 'none',
                    }
                  : { transition: 'none' }
              }
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
              {editMode && activeStop ? (
                <TourStoryCardBody
                  stop={activeStop}
                  titleCls={titleCls}
                  descCls={descCls}
                  className="p-6 pt-4"
                />
              ) : null}
              {!editMode && contentStop ? (
                <div ref={storyCardContentShellRef} className="relative">
                  <div ref={storyCardCopyRef} style={{ willChange: 'opacity, transform' }}>
                    <TourStoryCardBody
                      stop={contentStop}
                      titleCls={titleCls}
                      descCls={descCls}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {isMobileTour ? (
            <TourMobileStopDrawer
              peekStop={activeStop}
              expandedStop={mobilePanelStop}
              theme={theme}
              scrollerRef={scrollerRef}
              reducedMotion={reducedMotion}
              peekVisible={mobileTourDrawerVisible}
              isOpen={Boolean(mobilePanelStop)}
              onOpen={() => activeStop?.id && setMobileStopPanelStopId(activeStop.id)}
              onClose={() => setMobileStopPanelStopId(null)}
            />
          ) : null}

          {!heroActive && !isMobileTour && heroExitAdvanced && (
            <RightBar
              theme={theme}
              stops={stops}
              activeIndex={activeIndex}
              onJump={scrollToStop}
              onStepPrev={stepTourPrev}
              onStepNext={stepTourNext}
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

      <LandingPostTourSections
        capabilitiesRef={capabilitiesRef}
        testimonialsRef={testimonialsRef}
        pricingRef={pricingRef}
        faqRef={faqRef}
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
        onJoinWaitlist={(source, rect, meta, triggerEl) =>
          openWaitlist(source, rect, meta, triggerEl)
        }
      />

      <WaitlistModal
        open={waitlistModalOpen}
        originRect={waitlistOriginRect}
        morphMeta={waitlistMorphMeta}
        source={waitlistSource}
        onClose={handleWaitlistModalClose}
        onFaqClick={goFaq}
        scrollerRef={scrollerRef}
        returnFocusRef={waitlistReturnFocusRef}
      />

      <LandingPerfTourSync
        theme={theme}
        isMobileTour={isMobileTour}
        activeSection={activeSection}
        heroActive={heroActive}
        heroExitAdvanced={heroExitAdvanced}
        activeIndex={activeIndex}
        mobileTourDrawerVisible={mobileTourDrawerVisible}
        featuresBackdropProgress={featuresBackdropProgress}
        tourMetricsRef={tourMetricsRef}
      />

      <LandingPerfHud
        enabled={perfMonitorEnabled}
        tourMetricsRef={tourMetricsRef}
        heroActive={heroActive}
        heroExitAdvanced={heroExitAdvanced}
        activeIndex={activeIndex}
        mobileTourDrawerVisible={mobileTourDrawerVisible}
        featuresBackdropProgress={featuresBackdropProgress}
      />
      </div>
    </div>
  )
}
