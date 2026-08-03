export default function TourStoryCardBody({ stop, titleCls, descCls, className = '' }) {
  if (!stop) return null

  return (
    <div className={className}>
      <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${titleCls}`}>
        {stop.title}
      </h2>
      <p className={`mt-3 text-sm sm:text-base leading-relaxed ${descCls}`}>{stop.desc}</p>
      {stop.desc2 && (
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${descCls}`}>{stop.desc2}</p>
      )}
      {stop.points && (
        <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5">
          {stop.points.map((p) => (
            <li key={p} className={`flex items-start gap-2 text-sm ${descCls}`}>
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
