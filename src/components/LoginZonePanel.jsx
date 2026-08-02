import LoginZoneBackground from './LoginZoneBackground'

/**
 * Post-tour snap panel with login-style gradient wash behind content.
 */
export default function LoginZonePanel({
  panelRef,
  id,
  theme,
  reducedMotion,
  showGradientBackdrop = true,
  washStyle,
  backdropStyle,
  children,
}) {
  const overlayStyle = backdropStyle ?? washStyle
  return (
    <div ref={panelRef} id={id} className="deck-panel relative">
      {showGradientBackdrop ? (
        <LoginZoneBackground theme={theme} reducedMotion={reducedMotion} backdropStyle={overlayStyle} />
      ) : null}
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
