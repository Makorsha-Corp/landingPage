import { useEffect } from 'react'

/**
 * Viewport cursor-tracking for login-style radial gradients.
 * Sets --login-grad-x / --login-grad-y on ref.current (no React re-renders per move).
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {boolean} enabled
 */
export default function useLoginGradientFollow(ref, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const root = ref.current
    if (!root) return

    const setOrigin = (clientX, clientY) => {
      const x = (clientX / Math.max(window.innerWidth, 1)) * 100
      const y = (clientY / Math.max(window.innerHeight, 1)) * 100
      root.style.setProperty('--login-grad-x', `${x}%`)
      root.style.setProperty('--login-grad-y', `${y}%`)
    }

    const onMouseMove = (e) => setOrigin(e.clientX, e.clientY)
    const onTouchMove = (e) => {
      const t = e.touches[0]
      if (t) setOrigin(t.clientX, t.clientY)
    }

    setOrigin(window.innerWidth * 0.72, window.innerHeight * 0.65)

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [ref, enabled])
}
