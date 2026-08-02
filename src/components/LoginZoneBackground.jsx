import {
  getLoginGradientStyle,
  getLoginRadialGradientStyle,
} from '../../shared/loginGradient.js'

export default function LoginZoneBackground({ theme = 'light', reducedMotion = false, backdropStyle, washStyle }) {
  const style = reducedMotion
    ? getLoginGradientStyle(theme)
    : getLoginRadialGradientStyle()
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
