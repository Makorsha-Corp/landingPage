import { useEffect, useRef, useState } from 'react'
import {
  clamp,
  computeBackgroundTransforms,
  computeTourFrame,
  exponentialSmoothing,
  smoothstep,
} from '../lib/tourScrollMath'

const SETTLE_EPSILON = 0.05

export default function useTourCamera({
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
  rightBarRingRef,
  stops,
  heroCamera,
  reducedMotion,
  editMode,
  overlayPaused = false,
}) {
  const progressRef = useRef(0)
  const displayHeroExitTRef = useRef(0)
  const smoothedBlurOpacityRef = useRef(1)
  const smoothedRef = useRef({ tx: 0, ty: 0, scale: 1 })
  const dirtyRef = useRef(true)
  const activeIndexRef = useRef(0)
  const heroActiveRef = useRef(true)
  const snapCameraRef = useRef(false)
  const overlayPausedRef = useRef(overlayPaused)
  useEffect(() => {
    overlayPausedRef.current = overlayPaused
  }, [overlayPaused])
  const SNAP_PROGRESS_DELTA = 0.015

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
        displayHeroExitTRef.current = 0
        smoothedBlurOpacityRef.current = 1
        return
      }

      if (reducedMotion) {
        displayHeroExitTRef.current = 1
        smoothedBlurOpacityRef.current = 0
        return
      }

      displayHeroExitTRef.current = scrollExitT
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
      if (overlayPausedRef.current) return

      const dt = Math.min(now - lastTime, 48)
      lastTime = now

      const progress = progressRef.current
      updateHeroExit(progress)

      const frame = computeTourFrame({
        progress,
        stops,
        heroCamera,
        displayHeroExitT: displayHeroExitTRef.current,
        reducedMotion,
        editMode,
      })

      const targetBlurOpacity = frame.heroBlurOpacity
      if (reducedMotion || frame.heroActive) {
        smoothedBlurOpacityRef.current = targetBlurOpacity
      } else {
        smoothedBlurOpacityRef.current = exponentialSmoothing(
          smoothedBlurOpacityRef.current,
          targetBlurOpacity,
          dt,
          0.14,
        )
      }

      const smoothed = smoothedRef.current
      const targetTx = frame.tx
      const targetTy = frame.ty
      const targetScale = frame.camScale

      const leavingHero = heroActiveRef.current && !frame.heroActive
      if (snapCameraRef.current || leavingHero) {
        smoothed.tx = targetTx
        smoothed.ty = targetTy
        smoothed.scale = targetScale
        snapCameraRef.current = false
      } else if (reducedMotion) {
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
        Math.abs(smoothed.scale - targetScale) > 0.002

      const blurSettling = Math.abs(smoothedBlurOpacityRef.current - targetBlurOpacity) > 0.008
      const exitInProgress =
        displayHeroExitTRef.current > 0.001 && displayHeroExitTRef.current < 0.999

      if (
        (dirtyRef.current || settling || blurSettling || exitInProgress) &&
        !overlayPausedRef.current
      ) {
        dirtyRef.current = false
        raf = requestAnimationFrame(tick)
      }
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
    })
    smoothedRef.current = { tx: initial.tx, ty: initial.ty, scale: initial.camScale }
    smoothedBlurOpacityRef.current = initial.heroBlurOpacity
    dirtyRef.current = true
    if (!overlayPausedRef.current) raf = requestAnimationFrame(tick)

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
    heroFactoryBlurPxRef,
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
