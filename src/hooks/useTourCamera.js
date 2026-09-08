import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  cardAtAbsoluteRest,
  clamp,
  computeBackgroundTransforms,
  computeCardCopyPhase,
  computeHeroExitCopyPhase,
  computeHeroCenterCard,
  computeHeroExitState,
  computeTourFrame,
  fitCardLayoutToStage,
  HERO_REST_PROGRESS_EPSILON,
  layoutHeroCardFromDomRect,
  DEFAULT_CARD_HEIGHT_PX,
  DEFAULT_TOUR_TRANSITION_SPEED,
  DEFAULT_TOUR_CARD_CONTENT_SPEED,
  TOUR_SCROLL_LOCK_SPEED,
  exponentialSmoothing,
  getStoryCardAbsoluteWrapperStyle,
  getStoryCardInnerSizeStyle,
  getTourSmoothRate,
  CARD_INNER_PADDING_Y_PX,
  lerp,
  smoothstep,
  BASE_TOUR_CAMERA_SMOOTH_RATE,
  BASE_TOUR_HERO_EXIT_SMOOTH_RATE,
  BASE_TOUR_HERO_SCRIM_SMOOTH_RATE,
  BASE_TOUR_CARD_SMOOTH_RATE,
  BASE_TOUR_CONTENT_SMOOTH_RATE,
  BASE_TOUR_CARD_SIZE_SMOOTH_RATE,
} from '../lib/tourScrollMath'

const SETTLE_EPSILON = 0.05
const CARD_SETTLE_EPSILON = 0.5
const CONTENT_POS_SETTLE_EPSILON = 0.008
const EXIT_T_SETTLE_EPSILON = 0.01
const SCROLL_IDLE_MS = 80
// Smoothing is exponential in dt, so letting a stalled frame report its true
// gap makes the blend catch up in one step. Refuse to bill more than ~1 frame.
const MAX_SMOOTH_DT = 20
const HERO_EXIT_ADVANCE_ON = 0.5
const HERO_EXIT_ADVANCE_OFF = 0.45
// Below this opacity the outgoing hero glass reads the same with or without blur, so its
// backdrop-filter is dropped rather than kept alive over the moving building.
const HERO_GLASS_BLUR_CUTOFF = 0.5

export default function useTourCamera({
  scrollerRef,
  tourRef,
  stageRef,
  cardBoundsRef,
  backgroundWrapperRef,
  backgroundImgRef,
  heroBlurRef,
  buildingSharpRef,
  heroTextRef,
  heroOverlayScrimRef,
  heroContentRef,
  heroCardShellRef,
  heroScrollHintRef,
  heroOverlayScrimOpacityRef,
  storyCardInnerRef,
  storyCardWrapperRef,
  storyCardContentShellRef,
  storyCardHeroCopyRef,
  storyCardCopyRef,
  mobileCardRef,
  tourTransitionSpeedRef,
  tourCardContentSpeedRef,
  stops,
  heroCamera,
  heroMobileCamera = null,
  reducedMotion,
  editMode,
  isMobile = false,
  mobileCameraPanMode = false,
  overlayPaused = false,
}) {
  const progressRef = useRef(0)
  const displayHeroExitTRef = useRef(0)
  const displayScrimExitTRef = useRef(0)
  const heroExitTargetRef = useRef(0)
  const smoothedBlurOpacityRef = useRef(1)
  const smoothedRef = useRef({ tx: 0, ty: 0, scale: 1 })
  const smoothedCardRef = useRef({
    leftPx: 0,
    topPx: 0,
    widthPx: 640,
    minHeightPx: DEFAULT_CARD_HEIGHT_PX,
  })
  const smoothedContentPosRef = useRef(0)
  const contentHeightsByStopIdRef = useRef(new Map())
  const heroContentHeightRef = useRef(DEFAULT_CARD_HEIGHT_PX)
  const renderedStopIndexRef = useRef(0)
  const dirtyRef = useRef(true)
  const activeIndexRef = useRef(0)
  const contentStopIndexRef = useRef(0)
  const heroExitOriginLayoutRef = useRef(null)
  const heroExitShellHeightRef = useRef(0)
  const heroHandoffLatchedRef = useRef(false)
  const heroActiveRef = useRef(true)
  const snapCameraRef = useRef(false)
  const lastScrollAtRef = useRef(0)
  const overlayPausedRef = useRef(overlayPaused)
  const kickRafRef = useRef(null)
  const syncTourDomRef = useRef(() => {})
  const lastDomRef = useRef({})
  const tourMetricsRef = useRef({ displayHeroExitT: 0 })

  useEffect(() => {
    overlayPausedRef.current = overlayPaused
  }, [overlayPaused])

  const SNAP_PROGRESS_DELTA = 0.015

  const [activeIndex, setActiveIndex] = useState(0)
  const [contentStopIndex, setContentStopIndex] = useState(0)
  const [heroActive, setHeroActive] = useState(true)
  const [heroExitAdvanced, setHeroExitAdvanced] = useState(false)
  const [heroExiting, setHeroExiting] = useState(false)
  const heroExitAdvancedRef = useRef(false)
  const heroExitingRef = useRef(false)

  const getSegments = () => Math.max(stops.length - 1, 0)

  const resolveContentHeight = (stopIndex) => {
    const stop = stops[stopIndex]
    const id = stop?.id
    if (id && contentHeightsByStopIdRef.current.has(id)) {
      return contentHeightsByStopIdRef.current.get(id)
    }
    return DEFAULT_CARD_HEIGHT_PX
  }

  const deriveContentState = (contentPos) => {
    const segments = getSegments()
    if (segments <= 0) {
      return { segIdx: 0, t: 0, wantedStopIndex: 0 }
    }
    const clampedPos = clamp(contentPos, 0, segments)
    const segIdx = clamp(Math.floor(clampedPos), 0, segments - 1)
    const t = clampedPos - segIdx
    const phase = computeCardCopyPhase(t)
    const wantedStopIndex = clamp(
      phase.useNextStop ? segIdx + 1 : segIdx,
      0,
      stops.length - 1,
    )
    return { segIdx, t, wantedStopIndex, phase }
  }

  useLayoutEffect(() => {
    renderedStopIndexRef.current = contentStopIndex

    const copyEl = storyCardCopyRef?.current
    const stop = stops[contentStopIndex]
    if (!copyEl || !stop?.id) {
      dirtyRef.current = true
      if (kickRafRef.current) kickRafRef.current()
      return undefined
    }

    if (contentHeightsByStopIdRef.current.has(stop.id)) {
      dirtyRef.current = true
      if (kickRafRef.current) kickRafRef.current()
      return undefined
    }

    const measureRaf = requestAnimationFrame(() => {
      const height = copyEl.scrollHeight
      if (height > 0) {
        contentHeightsByStopIdRef.current.set(stop.id, height)
        dirtyRef.current = true
        if (kickRafRef.current) kickRafRef.current()
      }
    })

    return () => cancelAnimationFrame(measureRaf)
  }, [contentStopIndex, stops, storyCardCopyRef])

  useLayoutEffect(() => {
    const shell = heroCardShellRef?.current
    if (!shell) return undefined

    const measureShell = () => {
      if (heroHandoffLatchedRef.current) return
      const shell = heroCardShellRef?.current
      if (!shell) return
      const height = shell.getBoundingClientRect().height
      const contentEl = heroContentRef?.current
      if (height > 0) {
        heroExitShellHeightRef.current = height
      }
      if (contentEl?.scrollHeight > 0) {
        heroContentHeightRef.current = contentEl.scrollHeight
      }
    }

    measureShell()
    const ro = new ResizeObserver(measureShell)
    ro.observe(shell)
    return () => ro.disconnect()
  }, [heroCardShellRef, heroContentRef, stops])

  useLayoutEffect(() => {
    const heroEl = storyCardHeroCopyRef?.current
    if (!heroEl) return undefined

    const measureHero = () => {
      const height = heroEl.scrollHeight
      if (height > 0) {
        heroContentHeightRef.current = height
        dirtyRef.current = true
        if (kickRafRef.current) kickRafRef.current()
      }
    }

    measureHero()
    const ro = new ResizeObserver(measureHero)
    ro.observe(heroEl)
    return () => ro.disconnect()
  }, [storyCardHeroCopyRef, stops])

  useEffect(() => {
    const scroller = scrollerRef.current
    const tour = tourRef.current
    if (!scroller || !tour) return

    let raf = 0
    let lastTime = performance.now()
    lastScrollAtRef.current = lastTime

    const readProgress = () => {
      const scrollable = tour.offsetHeight - scroller.clientHeight
      return scrollable > 0 ? clamp(scroller.scrollTop / scrollable, 0, 1) : 0
    }

    const getCardBoundsEl = () => cardBoundsRef?.current ?? stageRef.current

    const getStageWidthPx = () => {
      const measured = getCardBoundsEl()?.clientWidth ?? 0
      if (measured > 0) return measured
      return typeof window !== 'undefined' ? window.innerWidth : 0
    }

    const getStageHeightPx = () => {
      const measured = getCardBoundsEl()?.clientHeight ?? 0
      if (measured > 0) return measured
      return typeof window !== 'undefined' ? window.innerHeight : 0
    }

    const updateHeroExit = (progress) => {
      const { heroActive: heroActiveNow, scrollHeroExitT } = computeHeroExitState(
        progress,
        stops.length,
      )

      if (heroActiveNow && progress < HERO_REST_PROGRESS_EPSILON) {
        heroExitTargetRef.current = 0
        // Snap at hero scroll rest — don't wait for smoothed exit T to catch up (scroll-back jump).
        displayHeroExitTRef.current = 0
        displayScrimExitTRef.current = 0
        heroExitOriginLayoutRef.current = null
        heroHandoffLatchedRef.current = false
        smoothedBlurOpacityRef.current = 1
        return
      }

      if (heroActiveNow) {
        return
      }

      if (!heroHandoffLatchedRef.current) {
        heroHandoffLatchedRef.current = true
        const shell = heroCardShellRef?.current
        const bounds = getCardBoundsEl()
        if (shell && bounds) {
          const shellRect = shell.getBoundingClientRect()
          const contentEl = heroContentRef?.current
          heroExitShellHeightRef.current = shellRect.height
          if (contentEl?.scrollHeight > 0) {
            heroContentHeightRef.current = contentEl.scrollHeight
          } else {
            heroContentHeightRef.current = Math.max(
              0,
              shellRect.height - CARD_INNER_PADDING_Y_PX,
            )
          }
          const origin = layoutHeroCardFromDomRect(
            shellRect,
            bounds.getBoundingClientRect(),
            stops[0]?.card,
          )
          const fitted = fitCardLayoutToStage(
            origin,
            getStageWidthPx(),
            getStageHeightPx(),
          )
          heroExitOriginLayoutRef.current = fitted
          smoothedCardRef.current.leftPx = fitted.leftPx
          smoothedCardRef.current.topPx = fitted.topPx
          smoothedCardRef.current.widthPx = fitted.widthPx
        }
      }

      if (reducedMotion) {
        heroExitTargetRef.current = 1
        displayScrimExitTRef.current = 1
        smoothedBlurOpacityRef.current = 0
        return
      }

      heroExitTargetRef.current = scrollHeroExitT
    }

    const getRestCardForStop = (stopIndex) => {
      const stop = stops[stopIndex]
      if (!stop?.card) return null
      return cardAtAbsoluteRest(stop, stop.card, getStageWidthPx(), getStageHeightPx())
    }

    const setStyleIfChanged = (keyPrefix, el, prop, nextValue) => {
      if (!el) return
      const key = `${keyPrefix}:${prop}`
      if (lastDomRef.current[key] === nextValue) return
      lastDomRef.current[key] = nextValue
      el.style[prop] = nextValue
    }

    const setOpacityIfChanged = (el, keyPrefix, opacity) => {
      const next = String(opacity)
      const key = `${keyPrefix}:opacity`
      if (lastDomRef.current[key] === next) return
      lastDomRef.current[key] = next
      el.style.opacity = next
    }

    const setVisibilityIfChanged = (el, keyPrefix, visible) => {
      if (!el) return
      const next = visible ? 'visible' : 'hidden'
      const key = `${keyPrefix}:visibility`
      if (lastDomRef.current[key] === next) return
      lastDomRef.current[key] = next
      el.style.visibility = next
    }

    // Reads the live class instead of a memo: React also writes this class on the hero
    // shell via className, so a cached value here would silently go stale.
    const setCompositorHiddenIfChanged = (el, _keyPrefix, hidden) => {
      if (!el) return
      if (el.classList.contains('is-compositor-hidden') === hidden) return
      el.classList.toggle('is-compositor-hidden', hidden)
    }

    const setGlassBlurOffIfChanged = (el, off) => {
      if (!el) return
      if (el.classList.contains('tour-glass-blur-off') === off) return
      el.classList.toggle('tour-glass-blur-off', off)
    }

    const applyDomFrame = (frame, stageTransform, background, smoothedCard, contentState, effectiveCard, reversingToHero = false) => {
      if (stageRef.current) {
        setStyleIfChanged('stage', stageRef.current, 'transform', stageTransform)
      }
      if (backgroundWrapperRef.current) {
        setStyleIfChanged(
          'bgWrap',
          backgroundWrapperRef.current,
          'transform',
          background.wrapperTransform,
        )
      }
      if (backgroundImgRef.current) {
        setStyleIfChanged(
          'bgImg',
          backgroundImgRef.current,
          'transform',
          background.imgTransform || '',
        )
        setOpacityIfChanged(backgroundImgRef.current, 'bgImg', frame.sharpBgOpacity)
        setStyleIfChanged('bgImg', backgroundImgRef.current, 'objectFit', background.imgObjectFit)
        setStyleIfChanged(
          'bgImg',
          backgroundImgRef.current,
          'objectPosition',
          background.imgObjectPosition,
        )
      }
      if (buildingSharpRef.current) {
        setOpacityIfChanged(
          buildingSharpRef.current,
          'buildingSharp',
          1 - smoothedBlurOpacityRef.current,
        )
      }
      if (heroBlurRef.current) {
        setOpacityIfChanged(heroBlurRef.current, 'heroBlur', smoothedBlurOpacityRef.current)
      }
      // Glass shells (backdrop-blur) stay at opacity 1 — fading them breaks live blur compositing.
      // Hero: fade scrim + inner copy only. Story: fade content shell during hero exit, not cardInner.
      const heroExitComplete = frame.displayHeroExitT >= 0.999
      const exitCrossfade = !frame.heroActive && !heroExitComplete
      const handoffActive = heroHandoffLatchedRef.current && !heroExitComplete
      const showHeroOverlay = frame.heroActive || !heroExitComplete
      if (heroTextRef.current) {
        setOpacityIfChanged(heroTextRef.current, 'heroText', 1)
        setCompositorHiddenIfChanged(heroTextRef.current, 'heroOverlay', !showHeroOverlay)
      }
      const scrimBase = heroOverlayScrimOpacityRef?.current ?? 1
      if (heroOverlayScrimRef?.current) {
        setOpacityIfChanged(
          heroOverlayScrimRef.current,
          'heroScrim',
          scrimBase * frame.heroScrimOpacity,
        )
      }
      if (heroContentRef?.current) {
        if (frame.heroActive) {
          setOpacityIfChanged(heroContentRef.current, 'heroContent', frame.heroTextOpacity)
          setCompositorHiddenIfChanged(heroContentRef.current, 'heroContentShell', false)
          setStyleIfChanged('heroContent', heroContentRef.current, 'transform', '')
        } else if (isMobile && exitCrossfade) {
          const copyPhase = computeHeroExitCopyPhase(frame.displayHeroExitT)
          setOpacityIfChanged(heroContentRef.current, 'heroContent', copyPhase.heroOpacity)
          setCompositorHiddenIfChanged(
            heroContentRef.current,
            'heroContentShell',
            copyPhase.heroOpacity <= 0.01,
          )
          setStyleIfChanged(
            'heroContent',
            heroContentRef.current,
            'transform',
            `translate3d(0, ${copyPhase.heroOffsetY}px, 0)`,
          )
        } else {
          setCompositorHiddenIfChanged(heroContentRef.current, 'heroContentShell', true)
        }
      }
      if (heroCardShellRef?.current) {
        if (frame.heroActive && !handoffActive) {
          setOpacityIfChanged(heroCardShellRef.current, 'heroCardShellOp', 1)
          setCompositorHiddenIfChanged(heroCardShellRef.current, 'heroCardShell', false)
          setGlassBlurOffIfChanged(heroCardShellRef.current, false)
        } else if (isMobile && exitCrossfade) {
          const copyPhase = computeHeroExitCopyPhase(frame.displayHeroExitT)
          setOpacityIfChanged(
            heroCardShellRef.current,
            'heroCardShellOp',
            copyPhase.heroOpacity,
          )
          setCompositorHiddenIfChanged(
            heroCardShellRef.current,
            'heroCardShell',
            copyPhase.heroOpacity <= 0.01,
          )
          setGlassBlurOffIfChanged(
            heroCardShellRef.current,
            copyPhase.heroOpacity <= HERO_GLASS_BLUR_CUTOFF,
          )
        } else if (!isMobile && exitCrossfade && reversingToHero) {
          // Scroll-back: real hero shell (flex center) replaces story-card hero copy near rest.
          const copyPhase = computeHeroExitCopyPhase(frame.displayHeroExitT)
          setOpacityIfChanged(
            heroCardShellRef.current,
            'heroCardShellOp',
            copyPhase.heroOpacity,
          )
          setCompositorHiddenIfChanged(
            heroCardShellRef.current,
            'heroCardShell',
            copyPhase.heroOpacity <= 0.01,
          )
          setGlassBlurOffIfChanged(heroCardShellRef.current, false)
        } else {
          setCompositorHiddenIfChanged(heroCardShellRef.current, 'heroCardShell', true)
          setGlassBlurOffIfChanged(heroCardShellRef.current, true)
        }
      }
      if (heroScrollHintRef?.current) {
        setVisibilityIfChanged(
          heroScrollHintRef.current,
          'heroHint',
          frame.heroActive && frame.heroTextOpacity > 0.05,
        )
      }
      if (storyCardInnerRef.current) {
        setOpacityIfChanged(storyCardInnerRef.current, 'cardInner', 1)
      }
      if (storyCardWrapperRef?.current) {
        setCompositorHiddenIfChanged(
          storyCardWrapperRef.current,
          'cardWrap',
          frame.heroActive && !handoffActive,
        )
      }
      if (storyCardContentShellRef?.current) {
        const contentShellOpacity = editMode || !frame.heroActive || handoffActive ? 1 : 0
        setOpacityIfChanged(
          storyCardContentShellRef.current,
          'cardShellContent',
          contentShellOpacity,
        )
      }
      if (editMode && storyCardInnerRef.current) {
        const transformKey = 'cardInner:transform'
        if (lastDomRef.current[transformKey] != null) {
          lastDomRef.current[transformKey] = null
          storyCardInnerRef.current.style.removeProperty('transform')
        }
      }
      if (!editMode && effectiveCard && storyCardWrapperRef?.current && smoothedCard) {
        const stageWidthPx = getStageWidthPx()
        const displayCard = {
          ...effectiveCard,
          leftPx: Math.round(smoothedCard.leftPx),
          topPx: Math.round(smoothedCard.topPx),
          widthPx: Math.round(smoothedCard.widthPx),
        }
        const wrapperStyle = getStoryCardAbsoluteWrapperStyle(displayCard)
        setStyleIfChanged('cardWrap', storyCardWrapperRef.current, 'left', '0px')
        setStyleIfChanged('cardWrap', storyCardWrapperRef.current, 'top', '0px')
        setStyleIfChanged('cardWrap', storyCardWrapperRef.current, 'transform', '')
        if (storyCardInnerRef.current) {
          setStyleIfChanged(
            'cardInner',
            storyCardInnerRef.current,
            'transform',
            wrapperStyle.transform,
          )
          const sizeStyle = getStoryCardInnerSizeStyle(displayCard, stageWidthPx)
          setStyleIfChanged('cardInner', storyCardInnerRef.current, 'width', sizeStyle.width)
          setStyleIfChanged('cardInner', storyCardInnerRef.current, 'maxWidth', sizeStyle.maxWidth)
          if (sizeStyle.height) {
            setStyleIfChanged('cardInner', storyCardInnerRef.current, 'height', sizeStyle.height)
            setStyleIfChanged(
              'cardInner',
              storyCardInnerRef.current,
              'overflowY',
              sizeStyle.overflowY,
            )
            const maxHeightKey = 'cardInner:maxHeight'
            if (lastDomRef.current[maxHeightKey] !== null) {
              lastDomRef.current[maxHeightKey] = null
              storyCardInnerRef.current.style.removeProperty('max-height')
            }
          } else if (sizeStyle.maxHeight) {
            setStyleIfChanged(
              'cardInner',
              storyCardInnerRef.current,
              'maxHeight',
              sizeStyle.maxHeight,
            )
            setStyleIfChanged(
              'cardInner',
              storyCardInnerRef.current,
              'overflowY',
              sizeStyle.overflowY,
            )
            const heightKey = 'cardInner:height'
            if (lastDomRef.current[heightKey] !== null) {
              lastDomRef.current[heightKey] = null
              storyCardInnerRef.current.style.removeProperty('height')
            }
          } else {
            const heightKey = 'cardInner:height'
            const maxHeightKey = 'cardInner:maxHeight'
            const overflowKey = 'cardInner:overflowY'
            if (lastDomRef.current[heightKey] !== null) {
              lastDomRef.current[heightKey] = null
              storyCardInnerRef.current.style.removeProperty('height')
            }
            if (lastDomRef.current[maxHeightKey] !== null) {
              lastDomRef.current[maxHeightKey] = null
              storyCardInnerRef.current.style.removeProperty('max-height')
            }
            if (lastDomRef.current[overflowKey] !== null) {
              lastDomRef.current[overflowKey] = null
              storyCardInnerRef.current.style.removeProperty('overflow-y')
            }
          }
        }
        if (storyCardContentShellRef?.current) {
          if (exitCrossfade) {
            const heroH = heroContentHeightRef.current
            const storyH = smoothedCard.minHeightPx
            const exitT = frame.displayHeroExitT
            let shellMinPx = Math.round(lerp(heroH, storyH, smoothstep(exitT)))
            if (displayCard.maxHeightPx) {
              const maxShellMin = Math.max(
                0,
                displayCard.maxHeightPx - CARD_INNER_PADDING_Y_PX,
              )
              shellMinPx = Math.min(shellMinPx, maxShellMin)
            }
            const minHeight = `${shellMinPx}px`
            setStyleIfChanged('cardShell', storyCardContentShellRef.current, 'minHeight', minHeight)
            setStyleIfChanged(
              'cardShell',
              storyCardContentShellRef.current,
              'overflow',
              'hidden',
            )
          } else {
            setStyleIfChanged('cardShell', storyCardContentShellRef.current, 'overflow', '')
            let shellMinPx = Math.round(smoothedCard.minHeightPx)
            if (displayCard.maxHeightPx) {
              const maxShellMin = Math.max(
                0,
                displayCard.maxHeightPx - CARD_INNER_PADDING_Y_PX,
              )
              shellMinPx = Math.min(shellMinPx, maxShellMin)
            }
            const minHeight = `${shellMinPx}px`
            setStyleIfChanged('cardShell', storyCardContentShellRef.current, 'minHeight', minHeight)
          }
        }
        const committed = renderedStopIndexRef.current === contentState.wantedStopIndex

        if (exitCrossfade) {
          const copyPhase = computeHeroExitCopyPhase(frame.displayHeroExitT)
          const heroCopyTransform = `translate3d(0, ${copyPhase.heroOffsetY}px, 0)`
          const storyCopyTransform = `translate3d(0, ${copyPhase.storyOffsetY}px, 0)`

          if (storyCardHeroCopyRef?.current) {
            const heroCopyOpacity =
              !isMobile && reversingToHero ? 0 : copyPhase.heroOpacity
            setOpacityIfChanged(
              storyCardHeroCopyRef.current,
              'heroCardCopy',
              heroCopyOpacity,
            )
            setVisibilityIfChanged(
              storyCardHeroCopyRef.current,
              'heroCardCopyVis',
              heroCopyOpacity > 0.01,
            )
            storyCardHeroCopyRef.current.style.pointerEvents =
              heroCopyOpacity > 0.01 ? 'auto' : 'none'
            setStyleIfChanged(
              'heroCardCopy',
              storyCardHeroCopyRef.current,
              'transform',
              heroCopyTransform,
            )
          }

          if (storyCardCopyRef?.current) {
            setOpacityIfChanged(storyCardCopyRef.current, 'cardCopy', copyPhase.storyOpacity)
            setStyleIfChanged('cardCopy', storyCardCopyRef.current, 'transform', storyCopyTransform)
          }
        } else {
          if (storyCardHeroCopyRef?.current) {
            setOpacityIfChanged(storyCardHeroCopyRef.current, 'heroCardCopy', 0)
            setVisibilityIfChanged(storyCardHeroCopyRef.current, 'heroCardCopyVis', false)
            storyCardHeroCopyRef.current.style.pointerEvents = 'none'
            setStyleIfChanged(
              'heroCardCopy',
              storyCardHeroCopyRef.current,
              'transform',
              'translate3d(0, 0px, 0)',
            )
          }

          if (storyCardCopyRef?.current) {
            const opacity = committed ? contentState.phase.opacity : 0
            const offsetY = committed ? contentState.phase.offsetY : 0
            setOpacityIfChanged(storyCardCopyRef.current, 'cardCopy', opacity)
            const copyTransform = `translate3d(0, ${offsetY}px, 0)`
            setStyleIfChanged('cardCopy', storyCardCopyRef.current, 'transform', copyTransform)
          }
        }
      }

      if (mobileCardRef?.current) {
        if (isMobile && exitCrossfade) {
          const copyPhase = computeHeroExitCopyPhase(frame.displayHeroExitT)
          setOpacityIfChanged(mobileCardRef.current, 'mobileCard', copyPhase.storyOpacity)
          setStyleIfChanged(
            'mobileCard',
            mobileCardRef.current,
            'transform',
            `translate3d(0, ${copyPhase.storyOffsetY}px, 0)`,
          )
        } else if (isMobile && !frame.heroActive && heroExitComplete) {
          const committed = renderedStopIndexRef.current === contentState.wantedStopIndex
          const opacity = committed ? contentState.phase.opacity : 0
          const offsetY = committed ? contentState.phase.offsetY : 0
          setOpacityIfChanged(mobileCardRef.current, 'mobileCard', opacity)
          setStyleIfChanged(
            'mobileCard',
            mobileCardRef.current,
            'transform',
            `translate3d(0, ${offsetY}px, 0)`,
          )
        } else if (isMobile && frame.heroActive && !handoffActive) {
          setOpacityIfChanged(mobileCardRef.current, 'mobileCard', 0)
          setStyleIfChanged('mobileCard', mobileCardRef.current, 'transform', 'translate3d(0, 8px, 0)')
        }
      }
    }

    const syncReactState = (frame, wantedStopIndex) => {
      if (frame.activeIndex !== activeIndexRef.current) {
        activeIndexRef.current = frame.activeIndex
        setActiveIndex(frame.activeIndex)
      }
      if (wantedStopIndex !== contentStopIndexRef.current) {
        contentStopIndexRef.current = wantedStopIndex
        setContentStopIndex(wantedStopIndex)
      }
      if (frame.heroActive !== heroActiveRef.current) {
        heroActiveRef.current = frame.heroActive
        setHeroActive(frame.heroActive)
      }
      const exitT = heroExitTargetRef.current
      let nextAdvanced = heroExitAdvancedRef.current
      if (nextAdvanced) {
        if (exitT < HERO_EXIT_ADVANCE_OFF) nextAdvanced = false
      } else if (exitT >= HERO_EXIT_ADVANCE_ON) {
        nextAdvanced = true
      }
      if (nextAdvanced !== heroExitAdvancedRef.current) {
        heroExitAdvancedRef.current = nextAdvanced
        setHeroExitAdvanced(nextAdvanced)
      }
      const nextExiting = heroHandoffLatchedRef.current && displayHeroExitTRef.current < 0.999
      if (nextExiting !== heroExitingRef.current) {
        heroExitingRef.current = nextExiting
        setHeroExiting(nextExiting)
      }
    }

    const tick = (now) => {
      raf = 0
      if (overlayPausedRef.current) return

      const dt = Math.min(now - lastTime, MAX_SMOOTH_DT)
      lastTime = now

      const progress = progressRef.current
      updateHeroExit(progress)

      const transitionSpeed = tourTransitionSpeedRef?.current ?? DEFAULT_TOUR_TRANSITION_SPEED
      const cardContentSpeed = tourCardContentSpeedRef?.current ?? DEFAULT_TOUR_CARD_CONTENT_SPEED
      const heroExitTarget = heroExitTargetRef.current
      const heroExitRate = getTourSmoothRate(BASE_TOUR_HERO_EXIT_SMOOTH_RATE, transitionSpeed)
      const scrimExitRate = getTourSmoothRate(BASE_TOUR_HERO_SCRIM_SMOOTH_RATE, transitionSpeed)
      const reversingToHero =
        !reducedMotion && heroExitTarget + 0.002 < displayHeroExitTRef.current

      if (reducedMotion) {
        displayHeroExitTRef.current = heroExitTarget
        displayScrimExitTRef.current = heroExitTarget
      } else if (reversingToHero) {
        // Scroll-back: morph/camera follow scroll directly instead of lagging then snapping.
        displayHeroExitTRef.current = heroExitTarget
        displayScrimExitTRef.current = heroExitTarget
      } else {
        displayHeroExitTRef.current = exponentialSmoothing(
          displayHeroExitTRef.current,
          heroExitTarget,
          dt,
          heroExitRate,
        )
        displayScrimExitTRef.current = exponentialSmoothing(
          displayScrimExitTRef.current,
          heroExitTarget,
          dt,
          scrimExitRate,
        )
      }
      tourMetricsRef.current.displayHeroExitT = displayHeroExitTRef.current

      const frame = computeTourFrame({
        progress,
        stops,
        heroCamera,
        heroMobileCamera,
        displayHeroExitT: displayHeroExitTRef.current,
        displayScrimExitT: displayScrimExitTRef.current,
        scrollHeroExitT: heroExitTarget,
        reducedMotion,
        editMode,
        isMobile,
        mobileCameraPanMode,
        stageWidthPx: getStageWidthPx(),
        stageHeightPx: getStageHeightPx(),
        heroExitOriginLayout: heroExitOriginLayoutRef.current,
        heroHandoffLatched: heroHandoffLatchedRef.current,
      })

      const segments = getSegments()
      const targetContentPos = frame.heroActive || segments <= 0 ? 0 : clamp(frame.scaled, 0, segments)

      const heroCardSeed =
        frame.heroActive && !editMode
          ? computeHeroCenterCard(
              getStageWidthPx(),
              getStageHeightPx(),
              stops[0]?.card,
            )
          : null
      const effectiveCard = frame.interpolatedCard ?? heroCardSeed

      const targetLeftPx = effectiveCard?.leftPx ?? smoothedCardRef.current.leftPx
      const targetTopPx = effectiveCard?.topPx ?? smoothedCardRef.current.topPx
      const targetWidthPx = effectiveCard?.widthPx ?? smoothedCardRef.current.widthPx

      const targetBlurOpacity = frame.heroBlurOpacity
      const cameraRate = getTourSmoothRate(BASE_TOUR_CAMERA_SMOOTH_RATE, transitionSpeed)
      const cardRate = getTourSmoothRate(BASE_TOUR_CARD_SMOOTH_RATE, transitionSpeed)
      const cardContentRate = getTourSmoothRate(BASE_TOUR_CONTENT_SMOOTH_RATE, cardContentSpeed)
      const cardSizeRate = getTourSmoothRate(BASE_TOUR_CARD_SIZE_SMOOTH_RATE, cardContentSpeed)
      const preferSmoothMotion = transitionSpeed < TOUR_SCROLL_LOCK_SPEED - 0.01
      const scrollIdle = now - lastScrollAtRef.current > SCROLL_IDLE_MS

      // Blur crossfade is scroll-driven (opacity only — no animated backdrop-filter).
      smoothedBlurOpacityRef.current = targetBlurOpacity

      const smoothed = smoothedRef.current
      const targetTx = frame.tx
      const targetTy = frame.ty
      const targetScale = frame.camScale

      const snapNow = snapCameraRef.current && !preferSmoothMotion
      if (snapNow) {
        smoothed.tx = targetTx
        smoothed.ty = targetTy
        smoothed.scale = targetScale
        snapCameraRef.current = false
      } else if (reducedMotion) {
        smoothed.tx = targetTx
        smoothed.ty = targetTy
        smoothed.scale = targetScale
      } else {
        smoothed.tx = exponentialSmoothing(smoothed.tx, targetTx, dt, cameraRate)
        smoothed.ty = exponentialSmoothing(smoothed.ty, targetTy, dt, cameraRate)
        smoothed.scale = exponentialSmoothing(smoothed.scale, targetScale, dt, cameraRate)
      }

      const smoothedCard = smoothedCardRef.current
      if (snapNow) {
        smoothedCard.leftPx = targetLeftPx
        smoothedCard.topPx = targetTopPx
        smoothedCard.widthPx = targetWidthPx
        smoothedContentPosRef.current = targetContentPos
      } else if (reducedMotion || editMode || !effectiveCard) {
        smoothedCard.leftPx = targetLeftPx
        smoothedCard.topPx = targetTopPx
        smoothedCard.widthPx = targetWidthPx
        smoothedContentPosRef.current = targetContentPos
      } else {
        smoothedCard.leftPx = exponentialSmoothing(
          smoothedCard.leftPx,
          targetLeftPx,
          dt,
          cardRate,
        )
        smoothedCard.topPx = exponentialSmoothing(smoothedCard.topPx, targetTopPx, dt, cardRate)
        smoothedCard.widthPx = exponentialSmoothing(
          smoothedCard.widthPx,
          targetWidthPx,
          dt,
          cardRate,
        )
        smoothedContentPosRef.current = exponentialSmoothing(
          smoothedContentPosRef.current,
          targetContentPos,
          dt,
          cardContentRate,
        )
      }

      const contentState = deriveContentState(smoothedContentPosRef.current)
      const fromHeight = resolveContentHeight(contentState.segIdx)
      const toHeight = resolveContentHeight(
        clamp(contentState.segIdx + 1, 0, stops.length - 1),
      )
      const targetMinHeightPx = lerp(fromHeight, toHeight, contentState.t)

      if (snapNow) {
        smoothedCard.minHeightPx = targetMinHeightPx
      } else if (reducedMotion || editMode || !effectiveCard) {
        smoothedCard.minHeightPx = targetMinHeightPx
      } else {
        smoothedCard.minHeightPx = exponentialSmoothing(
          smoothedCard.minHeightPx,
          targetMinHeightPx,
          dt,
          cardSizeRate,
        )
      }

      if (scrollIdle && !reducedMotion) {
        if (Math.abs(displayHeroExitTRef.current - heroExitTarget) <= EXIT_T_SETTLE_EPSILON) {
          displayHeroExitTRef.current = heroExitTarget
        }
        if (Math.abs(smoothed.tx - targetTx) <= SETTLE_EPSILON) {
          smoothed.tx = targetTx
        }
        if (Math.abs(smoothed.ty - targetTy) <= SETTLE_EPSILON) {
          smoothed.ty = targetTy
        }
        if (Math.abs(smoothed.scale - targetScale) <= 0.002) {
          smoothed.scale = targetScale
        }
        if (Math.abs(smoothedCard.leftPx - targetLeftPx) <= CARD_SETTLE_EPSILON) {
          smoothedCard.leftPx = targetLeftPx
        }
        if (Math.abs(smoothedCard.topPx - targetTopPx) <= CARD_SETTLE_EPSILON) {
          smoothedCard.topPx = targetTopPx
        }
        if (Math.abs(smoothedCard.widthPx - targetWidthPx) <= CARD_SETTLE_EPSILON) {
          smoothedCard.widthPx = targetWidthPx
        }
        if (Math.abs(smoothedCard.minHeightPx - targetMinHeightPx) <= CARD_SETTLE_EPSILON) {
          smoothedCard.minHeightPx = targetMinHeightPx
        }
        if (Math.abs(smoothedContentPosRef.current - targetContentPos) <= CONTENT_POS_SETTLE_EPSILON) {
          smoothedContentPosRef.current = targetContentPos
        }
      }

      const stageTransform = `translate(${smoothed.tx}%, ${smoothed.ty}%) scale(${smoothed.scale})`
      const background = computeBackgroundTransforms(
        smoothed.tx,
        smoothed.ty,
        smoothed.scale,
        frame.heroBlend,
      )

      applyDomFrame(
        frame,
        stageTransform,
        background,
        smoothedCard,
        contentState,
        effectiveCard,
        reversingToHero,
      )
      syncReactState(frame, contentState.wantedStopIndex)

      const settling =
        Math.abs(smoothed.tx - targetTx) > SETTLE_EPSILON ||
        Math.abs(smoothed.ty - targetTy) > SETTLE_EPSILON ||
        Math.abs(smoothed.scale - targetScale) > 0.002

      const cardSettling =
        !editMode &&
        effectiveCard &&
        (Math.abs(smoothedCard.leftPx - targetLeftPx) > CARD_SETTLE_EPSILON ||
          Math.abs(smoothedCard.topPx - targetTopPx) > CARD_SETTLE_EPSILON ||
          Math.abs(smoothedCard.widthPx - targetWidthPx) > CARD_SETTLE_EPSILON ||
          Math.abs(smoothedCard.minHeightPx - targetMinHeightPx) > CARD_SETTLE_EPSILON)

      const contentSettling =
        !editMode &&
        effectiveCard &&
        Math.abs(smoothedContentPosRef.current - targetContentPos) > CONTENT_POS_SETTLE_EPSILON

      const exitSettling =
        !reducedMotion &&
        Math.abs(displayHeroExitTRef.current - heroExitTarget) > EXIT_T_SETTLE_EPSILON

      if (
        (dirtyRef.current ||
          settling ||
          cardSettling ||
          contentSettling ||
          exitSettling) &&
        !overlayPausedRef.current
      ) {
        dirtyRef.current = false
        raf = requestAnimationFrame(tick)
      }
    }

    kickRafRef.current = () => {
      dirtyRef.current = true
      if (!raf && !overlayPausedRef.current) raf = requestAnimationFrame(tick)
    }
    syncTourDomRef.current = () => {
      lastDomRef.current = {}
      dirtyRef.current = true
      kickRafRef.current?.()
    }

    const onScroll = () => {
      if (overlayPausedRef.current) return
      lastScrollAtRef.current = performance.now()
      const prevProgress = progressRef.current
      const nextProgress = readProgress()
      if (Math.abs(nextProgress - prevProgress) > SNAP_PROGRESS_DELTA) {
        snapCameraRef.current = true
      }
      progressRef.current = nextProgress
      dirtyRef.current = true
      if (!raf && !overlayPausedRef.current) raf = requestAnimationFrame(tick)
    }

    progressRef.current = readProgress()
    updateHeroExit(progressRef.current)
    const initialExitT = heroExitTargetRef.current
    displayHeroExitTRef.current = initialExitT
    displayScrimExitTRef.current = initialExitT
    const initial = computeTourFrame({
      progress: progressRef.current,
      stops,
      heroCamera,
      heroMobileCamera,
      displayHeroExitT: initialExitT,
      displayScrimExitT: initialExitT,
      scrollHeroExitT: initialExitT,
      reducedMotion,
      editMode,
      isMobile,
      mobileCameraPanMode,
      stageWidthPx: getStageWidthPx(),
      stageHeightPx: getStageHeightPx(),
    })
    smoothedRef.current = { tx: initial.tx, ty: initial.ty, scale: initial.camScale }
    smoothedBlurOpacityRef.current = initial.heroBlurOpacity
    const overviewCard = getRestCardForStop(0)
    const heroCenterCard = computeHeroCenterCard(
      getStageWidthPx(),
      getStageHeightPx(),
      stops[0]?.card,
    )
    if (initial.interpolatedCard) {
      smoothedCardRef.current = {
        leftPx: initial.interpolatedCard.leftPx,
        topPx: initial.interpolatedCard.topPx,
        widthPx: initial.interpolatedCard.widthPx,
        minHeightPx: DEFAULT_CARD_HEIGHT_PX,
      }
    } else if (initial.heroActive && heroCenterCard) {
      smoothedCardRef.current = {
        leftPx: heroCenterCard.leftPx,
        topPx: heroCenterCard.topPx,
        widthPx: heroCenterCard.widthPx,
        minHeightPx: DEFAULT_CARD_HEIGHT_PX,
      }
    } else if (overviewCard) {
      smoothedCardRef.current = {
        leftPx: overviewCard.leftPx,
        topPx: overviewCard.topPx,
        widthPx: overviewCard.widthPx,
        minHeightPx: DEFAULT_CARD_HEIGHT_PX,
      }
    }
    const segments = getSegments()
    smoothedContentPosRef.current =
      initial.heroActive || segments <= 0 ? 0 : clamp(initial.scaled, 0, segments)
    dirtyRef.current = true
    if (!overlayPausedRef.current) raf = requestAnimationFrame(tick)

    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      kickRafRef.current = null
      syncTourDomRef.current = () => {}
    }
  }, [
    backgroundImgRef,
    backgroundWrapperRef,
    cardBoundsRef,
    editMode,
    heroBlurRef,
    buildingSharpRef,
    heroCamera,
    heroMobileCamera,
    heroTextRef,
    heroOverlayScrimRef,
    heroContentRef,
    heroCardShellRef,
    heroScrollHintRef,
    heroOverlayScrimOpacityRef,
    isMobile,
    mobileCameraPanMode,
    reducedMotion,
    scrollerRef,
    stageRef,
    stops,
    mobileCardRef,
    storyCardContentShellRef,
    storyCardHeroCopyRef,
    storyCardCopyRef,
    storyCardInnerRef,
    storyCardWrapperRef,
    tourTransitionSpeedRef,
    tourCardContentSpeedRef,
    tourRef,
  ])

  return {
    activeIndex,
    heroActive,
    contentStopIndex,
    heroExitAdvanced,
    heroExiting,
    tourMetricsRef,
    syncTourDomRef,
  }
}
