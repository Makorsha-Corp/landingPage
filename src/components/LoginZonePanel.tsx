import type { ReactNode, RefObject, CSSProperties } from 'react'
import LoginZoneBackground from './LoginZoneBackground'

interface LoginZonePanelProps {
  panelRef?: RefObject<HTMLDivElement | null>
  id?: string
  theme?: string
  reducedMotion?: boolean
  showGradientBackdrop?: boolean
  flow?: boolean
  washStyle?: CSSProperties
  backdropStyle?: CSSProperties
  children?: ReactNode
}

/**
 * Post-tour snap panel with login-style gradient wash behind content.
 */
export default function LoginZonePanel({
  panelRef,
  id,
  theme,
  showGradientBackdrop = true,
  flow = false,
  washStyle,
  backdropStyle,
  children,
}: LoginZonePanelProps) {
  const overlayStyle = backdropStyle ?? washStyle
  return (
    <div
      ref={panelRef}
      id={id}
      className={`deck-panel relative${flow ? ' deck-panel--flow' : ''}`}
    >
      {showGradientBackdrop ? (
        <LoginZoneBackground theme={theme} backdropStyle={overlayStyle} />
      ) : null}
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
