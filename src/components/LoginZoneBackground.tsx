import type { CSSProperties } from 'react'
import { getLoginGradientStyle } from '../../shared/loginGradient.js'

interface LoginZoneBackgroundProps {
  theme?: string
  backdropStyle?: CSSProperties
  washStyle?: CSSProperties
}

export default function LoginZoneBackground({ theme = 'light', backdropStyle, washStyle }: LoginZoneBackgroundProps) {
  const style = getLoginGradientStyle(theme)
  const overlayStyle = backdropStyle ?? washStyle

  return (
    <div
      className="pointer-events-none absolute inset-0 transition-[background] duration-500 ease-out"
      style={style}
      aria-hidden="true"
    >
      {overlayStyle ? (
        <div
          className="absolute inset-0 transition-[background-color] duration-500"
          style={overlayStyle}
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
}
