import { useEffect, useRef, useState } from 'react'
import {
  HERO_EXIT_DURATION_MS,
  clamp,
  computeBackgroundTransforms,
  computeTourFrame,
  exponentialSmoothing,
  heroExitEase,
} from '../lib/tourScrollMath'

const SETTLE_EPSILON = 0.05

export default function useTourCamera({
  scrollerRef,
  tourRef,
  stageRef,
  backgroundWrapperRef,
  backgroundImgRef,
  heroBlurRef,
  heroTextRef,
  storyCardInnerRef,
  rightBarProgressFillRef,
  rightBarRingRef,
  stops,
  heroCamera,
  reducedMotion,
  editMode,
}) {
  const progressRef = useRef(0)
  const displayHeroExitTRef = useRef(0)
  const exitAnimatingRef = useRef(false)
  const exitStartRef = useRef(0)
  const smoothedRef = useRef({ tx: 0, ty: 0, scale: 1 })
  const dirtyRef = useRef(true)
  const activeIndexRef = useRef(0)
  const heroActiveRef = useRef(true)

  const [activeIndex, setActiveIndex] = useState(0)
  const [heroActive, setHeroActive] = useState(true)

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

    const updateHeroExit = (progress, now) => {
      const heroPanelCount = 1
      const totalPanels = heroPanelCount + stops.length
      const heroSegment = 1 / (totalPanels - 1)
      const heroActiveNow = progress < heroSegment * 0.5

      if (reducedMotion) {
        displayHeroExitTRef.current = heroActiveNow ? 0 : 1
        exitAnimatingRef.current = false
        return
      }

      if (progress < 0.005) {
        displayHeroExitTRef.current = 0
        exitAnimatingRef.current = false
        return
      }

      if (heroActiveNow) {
        displayHeroExitTRef.current = 0
        exitAnimatingRef.current = false
        return
      }

      if (progress >= 0.008 && displayHeroExitTRef.current < 1 && !exitAnimatingRef.current) {
        exitAnimatingRef.current = true
        exitStartRef.current = now
      }

      if (exitAnimatingRef.current) {
        const t = clamp((now - exitStartRef.current) / HERO_EXIT_DURATION_MS, 0, 1)
        displayHeroExitTRef.current = heroExitEase(t)
        if (t >= 1) {
          exitAnimatingRef.current = false
        }
      }
    }

    const applyDomFrame = (frame, stageTransform, background) => {
      if (stageRef.current) {
        stageRef.current.style.transform = stageTransform
      }
      if (backgroundWrapperRef.current) {
        backgroundWrapperRef.current.style.transform = background.wrapperTransform
      }
      if (backgroundImgRef.current) {
        backgroundImgRef.current.style.transform = background.imgTransform || ''
        backgroundImgRef.current.style.objectFit = background.imgObjectFit
        backgroundImgRef.current.style.objectPosition = background.imgObjectPosition
      }
      if (heroBlurRef.current) {
        heroBlurRef.current.style.opacity = String(frame.heroBlurOpacity)
      }
      if (heroTextRef.current) {
        heroTextRef.current.style.opacity = String(frame.heroTextOpacity)
      }
      if (storyCardInnerRef.current) {
        storyCardInnerRef.current.style.opacity = String(frame.storyCardOpacity)
      }
      if (rightBarProgressFillRef?.current) {
        rightBarProgressFillRef.current.style.height = `${frame.stopProgress * 100}%`
      }
      if (rightBarRingRef?.current) {
        const circumference = 2 * Math.PI * 16
        rightBarRingRef.current.style.strokeDashoffset = String(
          circumference * (1 - frame.stopProgress),
        )
      }
    }

    const syncReactState = (frame) => {
      if (frame.activeIndex !== activeIndexRef.current) {
        activeIndexRef.current = frame.activeIndex
        setActiveIndex(frame.activeIndex)
      }
      if (frame.heroActive !== heroActiveRef.current) {
        heroActiveRef.current = frame.heroActive
        setHeroActive(frame.heroActive)
      }
    }

    const tick = (now) => {
      raf = 0
      const dt = Math.min(now - lastTime, 48)
      lastTime = now

      const progress = progressRef.current
      updateHeroExit(progress, now)

      const frame = computeTourFrame({
        progress,
        stops,
        heroCamera,
        displayHeroExitT: displayHeroExitTRef.current,
        reducedMotion,
        editMode,
      })

      const smoothed = smoothedRef.current
      const targetTx = frame.tx
      const targetTy = frame.ty
      const targetScale = frame.camScale

      if (reducedMotion) {
        smoothed.tx = targetTx
        smoothed.ty = targetTy
        smoothed.scale = targetScale
      } else {
        smoothed.tx = exponentialSmoothing(smoothed.tx, targetTx, dt)
        smoothed.ty = exponentialSmoothing(smoothed.ty, targetTy, dt)
        smoothed.scale = exponentialSmoothing(smoothed.scale, targetScale, dt)
      }

      const stageTransform = `translate(${smoothed.tx}%, ${smoothed.ty}%) scale(${smoothed.scale})`
      const background = computeBackgroundTransforms(
        smoothed.tx,
        smoothed.ty,
        smoothed.scale,
        frame.heroBlend,
      )

      applyDomFrame(frame, stageTransform, background)
      syncReactState(frame)

      const settling =
        Math.abs(smoothed.tx - targetTx) > SETTLE_EPSILON ||
        Math.abs(smoothed.ty - targetTy) > SETTLE_EPSILON ||
        Math.abs(smoothed.scale - targetScale) > 0.002 ||
        exitAnimatingRef.current

      if (dirtyRef.current || settling) {
        dirtyRef.current = false
        raf = requestAnimationFrame(tick)
      }
    }

    const onScroll = () => {
      progressRef.current = readProgress()
      dirtyRef.current = true
      if (!raf) raf = requestAnimationFrame(tick)
    }

    progressRef.current = readProgress()
    const initial = computeTourFrame({
      progress: progressRef.current,
      stops,
      heroCamera,
      displayHeroExitT: displayHeroExitTRef.current,
      reducedMotion,
      editMode,
    })
    smoothedRef.current = { tx: initial.tx, ty: initial.ty, scale: initial.camScale }
    dirtyRef.current = true
    raf = requestAnimationFrame(tick)

    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [
    backgroundImgRef,
    backgroundWrapperRef,
    editMode,
    heroBlurRef,
    heroCamera,
    heroTextRef,
    reducedMotion,
    rightBarProgressFillRef,
    rightBarRingRef,
    scrollerRef,
    stageRef,
    stops,
    storyCardInnerRef,
    tourRef,
  ])

  return { activeIndex, heroActive }
}
