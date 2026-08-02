export default function SectionEyebrow({ children, className = '' }) {
  return (
    <span
      className={`text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground ${className}`}
    >
      {children}
    </span>
  )
}
