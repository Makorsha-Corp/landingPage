export default function SectionEyebrow({ children, className = '' }) {
  return (
    <span
      className={`text-sm font-semibold uppercase tracking-widest text-primary ${className}`}
    >
      {children}
    </span>
  )
}
