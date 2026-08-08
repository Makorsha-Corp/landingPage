import { useLayoutEffect, useRef, useState } from 'react'

export const HERO_TRAVEL_DURATION_MS = 560
export const HERO_TRAVEL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** @deprecated Settle is merged into HERO_TRAVEL_DURATION_MS */
export const HERO_SETTLE_DURATION_MS = 0

/**
 * Single-beat FLIP: hero rect → bottom-right FAB (translate + scale in one motion).
 */
export default function useWaitlistFabHeroTravel({
  heroSignUpRef,
  wrapRef,
  reducedMotion,
  enabled = true,
  freezeTravel = false,
}) {
  const [wrapStyle, setWrapStyle] = useState(undefined)
  const [travelPhase, setTravelPhase] = useState('idle')
  const didTravelRef = useRef(false)
  const generationRef = useRef(0)

  useLayoutEffect(() => {
    if (!enabled) {
      if (!freezeTravel) {
        didTravelRef.current = false
      }
      setWrapStyle(undefined)
      setTravelPhase('idle')
      return undefined
    }

    if (reducedMotion || didTravelRef.current) return undefined

    const fromEl = heroSignUpRef?.current
    const wrapEl = wrapRef?.current
    if (!fromEl || !wrapEl) return undefined

    const from = fromEl.getBoundingClientRect()
    const to = wrapEl.getBoundingClientRect()
    if (from.width <= 0 || to.width <= 0) return undefined

    didTravelRef.current = true
    const generation = generationRef.current + 1
    generationRef.current = generation

    const dx = from.left - to.left
    const dy = from.top - to.top
    const sx = from.width / to.width
    const sy = from.height / to.height

    const onTransitionEnd = (event) => {
      if (event.target !== wrapEl || event.propertyName !== 'transform') return
      if (generationRef.current !== generation) return
      setTravelPhase('idle')
      setWrapStyle(undefined)
    }

    setTravelPhase('traveling')
    setWrapStyle({
      transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`,
      transformOrigin: 'top left',
      transition: 'none',
    })

    wrapEl.addEventListener('transitionend', onTransitionEnd)

    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (generationRef.current !== generation) return
        setWrapStyle({
          transform: 'translate3d(0, 0, 0) scale(1, 1)',
          transformOrigin: 'top left',
          transition: `transform ${HERO_TRAVEL_DURATION_MS}ms ${HERO_TRAVEL_EASING}`,
        })
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
      wrapEl.removeEventListener('transitionend', onTransitionEnd)
    }
  }, [enabled, freezeTravel, heroSignUpRef, wrapRef, reducedMotion])

  return { wrapStyle, travelPhase }
}
