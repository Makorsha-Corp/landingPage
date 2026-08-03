import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  cardAtAbsoluteRest,
  clamp,
  computeBackgroundTransforms,
  computeCardCopyPhase,
  computeTourFrame,
  DEFAULT_CARD_HEIGHT_PX,
  DEFAULT_TOUR_TRANSITION_SPEED,
  DEFAULT_TOUR_CARD_CONTENT_SPEED,
  TOUR_SCROLL_LOCK_SPEED,
  exponentialSmoothing,
  getStoryCardAbsoluteWrapperStyle,
  getStoryCardInnerSizeStyle,
  getTourSmoothRate,
  lerp,
  BASE_TOUR_BLUR_SMOOTH_RATE,
  BASE_TOUR_CAMERA_SMOOTH_RATE,
  BASE_TOUR_CARD_SMOOTH_RATE,
  BASE_TOUR_CONTENT_SMOOTH_RATE,
  BASE_TOUR_CARD_SIZE_SMOOTH_RATE,
  BASE_TOUR_HERO_EXIT_SMOOTH_RATE,
  smoothstep,
} from '../lib/tourScrollMath'

const SETTLE_EPSILON = 0.05
const CARD_SETTLE_EPSILON = 0.5
const CONTENT_POS_SETTLE_EPSILON = 0.008

export default function useTourCamera({
  scrollerRef,
  tourRef,
  stageRef,
  cardBoundsRef,
  backgroundWrapperRef,
  backgroundImgRef,
  heroBlurRef,
  heroFactoryBlurPxRef,
  heroTextRef,
  storyCardInnerRef,
  storyCardWrapperRef,
  storyCardContentShellRef,
  storyCardCopyRef,
  tourTransitionSpeedRef,
  tourCardContentSpeedRef,
  stops,
  heroCamera,
  reducedMotion,
  editMode,
  isMobile = false,
  mobileCameraPanMode = false,
  overlayPaused = false,
}) {
  const progressRef = useRef(0)
  const displayHeroExitTRef = useRef(0)
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
  const renderedStopIndexRef = useRef(0)
  const dirtyRef = useRef(true)
  const activeIndexRef = useRef(0)
  const contentStopIndexRef = useRef(0)
  const heroActiveRef = useRef(true)
  const snapCameraRef = useRef(false)
  const overlayPausedRef = useRef(overlayPaused)
  const kickRafRef = useRef(null)

  useEffect(() => {
    overlayPausedRef.current = overlayPaused
  }, [overlayPaused])

  const SNAP_PROGRESS_DELTA = 0.015

  const [activeIndex, setActiveIndex] = useState(0)
  const [contentStopIndex, setContentStopIndex] = useState(0)
  const [heroActive, setHeroActive] = useState(true)

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
    if (copyEl && stop?.id) {
      const height = copyEl.scrollHeight
      if (height > 0) {
        contentHeightsByStopIdRef.current.set(stop.id, height)
      }
    }

    dirtyRef.current = true
    if (kickRafRef.current) kickRafRef.current()
  }, [contentStopIndex, stops, storyCardCopyRef])

  useEffect(() => {
    const scroller = scrollerRef.current
    const tour = tourRef.current
    if (!scroller || !tour) return

    let raf = 0
    let lastTime = performance.now()

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
      const heroPanelCount = 1
      const totalPanels = heroPanelCount + stops.length
      const heroSegment = 1 / (totalPanels - 1)
      const heroActiveNow = progress < heroSegment * 0.5
      const exitStart = heroSegment * 0.5
      const exitEnd = heroSegment
      const scrollExitT = smoothstep(
        clamp((progress - exitStart) / (exitEnd - exitStart), 0, 1),
      )

      if (heroActiveNow || progress < 0.005) {
        heroExitTargetRef.current = 0
        smoothedBlurOpacityRef.current = 1
        return
      }

      if (reducedMotion) {
        heroExitTargetRef.current = 1
        smoothedBlurOpacityRef.current = 0
        return
      }

      heroExitTargetRef.current = scrollExitT
    }

    const getRestCardForStop = (stopIndex) => {
      const stop = stops[stopIndex]
      if (!stop?.card) return null
      return cardAtAbsoluteRest(stop, stop.card, getStageWidthPx(), getStageHeightPx())
    }

    const applyDomFrame = (frame, stageTransform, background, smoothedCard, contentState, effectiveCard) => {
      if (stageRef.current) {
        stageRef.current.style.transform = stageTransform
      }
      if (backgroundWrapperRef.current) {
        backgroundWrapperRef.current.style.transform = background.wrapperTransform
      }
      if (backgroundImgRef.current) {
        backgroundImgRef.current.style.transform = background.imgTransform || ''
        backgroundImgRef.current.style.opacity = String(frame.sharpBgOpacity)
        backgroundImgRef.current.style.objectFit = background.imgObjectFit
        backgroundImgRef.current.style.objectPosition = background.imgObjectPosition
      }
      if (heroBlurRef.current) {
        const baseBlurPx = heroFactoryBlurPxRef?.current ?? 0
        const blurPx = baseBlurPx * smoothedBlurOpacityRef.current
        heroBlurRef.current.style.opacity = blurPx > 0.05 ? '1' : '0'
        const filter = blurPx > 0.05 ? `blur(${blurPx}px)` : 'none'
        heroBlurRef.current.style.backdropFilter = filter
        heroBlurRef.current.style.webkitBackdropFilter = filter
      }
      if (heroTextRef.current) {
        heroTextRef.current.style.opacity = String(frame.heroTextOpacity)
      }
      if (storyCardInnerRef.current) {
        storyCardInnerRef.current.style.opacity = String(frame.storyCardOpacity)
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
        storyCardWrapperRef.current.style.left = wrapperStyle.left
        storyCardWrapperRef.current.style.top = wrapperStyle.top
        storyCardWrapperRef.current.style.transform = wrapperStyle.transform
        if (storyCardInnerRef.current) {
          const sizeStyle = getStoryCardInnerSizeStyle(displayCard, stageWidthPx)
          storyCardInnerRef.current.style.width = sizeStyle.width
          storyCardInnerRef.current.style.maxWidth = sizeStyle.maxWidth
          if (sizeStyle.height) {
            storyCardInnerRef.current.style.height = sizeStyle.height
            storyCardInnerRef.current.style.overflowY = sizeStyle.overflowY
          } else {
            storyCardInnerRef.current.style.removeProperty('height')
            storyCardInnerRef.current.style.removeProperty('overflow-y')
          }
        }
        if (storyCardContentShellRef?.current) {
          storyCardContentShellRef.current.style.minHeight = `${Math.round(smoothedCard.minHeightPx)}px`
        }
        const committed = renderedStopIndexRef.current === contentState.wantedStopIndex
        const opacity = committed ? contentState.phase.opacity : 0
        const offsetY = committed ? contentState.phase.offsetY : 0
        if (storyCardCopyRef?.current) {
          storyCardCopyRef.current.style.opacity = String(opacity)
          storyCardCopyRef.current.style.transform = `translate3d(0, ${offsetY}px, 0)`
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
    }

    const tick = (now) => {
      raf = 0
      if (overlayPausedRef.current) return

      const dt = Math.min(now - lastTime, 48)
      lastTime = now

      const progress = progressRef.current
      updateHeroExit(progress)

      const transitionSpeed = tourTransitionSpeedRef?.current ?? DEFAULT_TOUR_TRANSITION_SPEED
      const cardContentSpeed = tourCardContentSpeedRef?.current ?? DEFAULT_TOUR_CARD_CONTENT_SPEED
      const useSmoothedHeroExit =
        !reducedMotion && Math.abs(transitionSpeed - TOUR_SCROLL_LOCK_SPEED) > 0.01
      if (useSmoothedHeroExit) {
        displayHeroExitTRef.current = exponentialSmoothing(
          displayHeroExitTRef.current,
          heroExitTargetRef.current,
          dt,
          getTourSmoothRate(BASE_TOUR_HERO_EXIT_SMOOTH_RATE, transitionSpeed),
        )
      } else {
        displayHeroExitTRef.current = heroExitTargetRef.current
      }

      const frame = computeTourFrame({
        progress,
        stops,
        heroCamera,
        displayHeroExitT: displayHeroExitTRef.current,
        reducedMotion,
        editMode,
        isMobile,
        mobileCameraPanMode,
        stageWidthPx: getStageWidthPx(),
        stageHeightPx: getStageHeightPx(),
      })

      const segments = getSegments()
      const targetContentPos = frame.heroActive || segments <= 0 ? 0 : clamp(frame.scaled, 0, segments)

      const heroCardSeed = frame.heroActive && !editMode ? getRestCardForStop(0) : null
      const effectiveCard = frame.interpolatedCard ?? heroCardSeed

      const targetLeftPx = effectiveCard?.leftPx ?? smoothedCardRef.current.leftPx
      const targetTopPx = effectiveCard?.topPx ?? smoothedCardRef.current.topPx
      const targetWidthPx = effectiveCard?.widthPx ?? smoothedCardRef.current.widthPx

      const targetBlurOpacity = frame.heroBlurOpacity
      const blurRate = getTourSmoothRate(BASE_TOUR_BLUR_SMOOTH_RATE, transitionSpeed)
      const cameraRate = getTourSmoothRate(BASE_TOUR_CAMERA_SMOOTH_RATE, transitionSpeed)
      const cardRate = getTourSmoothRate(BASE_TOUR_CARD_SMOOTH_RATE, transitionSpeed)
      const cardContentRate = getTourSmoothRate(BASE_TOUR_CONTENT_SMOOTH_RATE, cardContentSpeed)
      const cardSizeRate = getTourSmoothRate(BASE_TOUR_CARD_SIZE_SMOOTH_RATE, cardContentSpeed)
      const preferSmoothMotion = transitionSpeed < TOUR_SCROLL_LOCK_SPEED - 0.01

      if (reducedMotion || frame.heroActive) {
        smoothedBlurOpacityRef.current = targetBlurOpacity
      } else {
        smoothedBlurOpacityRef.current = exponentialSmoothing(
          smoothedBlurOpacityRef.current,
          targetBlurOpacity,
          dt,
          blurRate,
        )
      }

      const smoothed = smoothedRef.current
      const targetTx = frame.tx
      const targetTy = frame.ty
      const targetScale = frame.camScale

      const leavingHero = heroActiveRef.current && !frame.heroActive
      const snapNow = snapCameraRef.current && !preferSmoothMotion
      if (snapNow || (leavingHero && !preferSmoothMotion)) {
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
      if (snapNow || leavingHero) {
        smoothedCard.leftPx = targetLeftPx
        smoothedCard.topPx = targetTopPx
        smoothedCard.widthPx = targetWidthPx
        smoothedContentPosRef.current = targetContentPos
      } else if (reducedMotion || frame.heroActive || editMode || !effectiveCard) {
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

      if (snapNow || leavingHero) {
        smoothedCard.minHeightPx = targetMinHeightPx
      } else if (reducedMotion || frame.heroActive || editMode || !effectiveCard) {
        smoothedCard.minHeightPx = targetMinHeightPx
      } else {
        smoothedCard.minHeightPx = exponentialSmoothing(
          smoothedCard.minHeightPx,
          targetMinHeightPx,
          dt,
          cardSizeRate,
        )
      }

      const stageTransform = `translate(${smoothed.tx}%, ${smoothed.ty}%) scale(${smoothed.scale})`
      const background = computeBackgroundTransforms(
        smoothed.tx,
        smoothed.ty,
        smoothed.scale,
        frame.heroBlend,
      )

      applyDomFrame(frame, stageTransform, background, smoothedCard, contentState, effectiveCard)
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

      const blurSettling = Math.abs(smoothedBlurOpacityRef.current - targetBlurOpacity) > 0.008
      const heroExitSettling =
        Math.abs(displayHeroExitTRef.current - heroExitTargetRef.current) > 0.008
      const exitInProgress =
        displayHeroExitTRef.current > 0.001 && displayHeroExitTRef.current < 0.999

      if (
        (dirtyRef.current ||
          settling ||
          cardSettling ||
          contentSettling ||
          blurSettling ||
          heroExitSettling ||
          exitInProgress) &&
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

    const onScroll = () => {
      if (overlayPausedRef.current) return
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
    const initial = computeTourFrame({
      progress: progressRef.current,
      stops,
      heroCamera,
      displayHeroExitT: displayHeroExitTRef.current,
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
    if (initial.interpolatedCard) {
      smoothedCardRef.current = {
        leftPx: initial.interpolatedCard.leftPx,
        topPx: initial.interpolatedCard.topPx,
        widthPx: initial.interpolatedCard.widthPx,
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
    }
  }, [
    backgroundImgRef,
    backgroundWrapperRef,
    cardBoundsRef,
    editMode,
    heroBlurRef,
    heroFactoryBlurPxRef,
    heroCamera,
    heroTextRef,
    isMobile,
    mobileCameraPanMode,
    reducedMotion,
    scrollerRef,
    stageRef,
    stops,
    storyCardContentShellRef,
    storyCardCopyRef,
    storyCardInnerRef,
    storyCardWrapperRef,
    tourTransitionSpeedRef,
    tourCardContentSpeedRef,
    tourRef,
  ])

  return { activeIndex, heroActive, contentStopIndex }
}
