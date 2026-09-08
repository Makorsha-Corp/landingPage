function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function TourStoryPointsList({
  points,
  descCls,
  className = 'mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5',
  itemClassName = 'text-sm',
  style,
}) {
  if (!points?.length) return null

  return (
    <ul className={className} style={style}>
      {points.map((point) => (
        <li key={point} className={`flex items-start gap-2 ${itemClassName} ${descCls}`}>
          <CheckIcon />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  )
}
