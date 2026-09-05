export default function TourMobileCondensedBody({
  stop,
  descCls,
  chipCls = '',
  stagger = false,
}) {
  if (!stop) return null

  const delayStyle = (step) =>
    stagger ? { animationDelay: `${step * 60}ms` } : undefined

  return (
    <>
      {stop.desc ? (
        <p
          className={`text-sm leading-relaxed ${descCls} ${
            stagger ? 'animate-tour-mobile-copy-in' : ''
          }`}
          style={stagger ? delayStyle(1) : undefined}
        >
          {stop.desc}
        </p>
      ) : null}
      {stop.desc2 ? (
        <p
          className={`mt-2 text-sm leading-relaxed ${descCls} ${
            stagger ? 'animate-tour-mobile-copy-in' : ''
          }`}
          style={stagger ? delayStyle(2) : undefined}
        >
          {stop.desc2}
        </p>
      ) : null}
      {stop.points?.length ? (
        <ul
          className={`mt-3 flex flex-wrap gap-1.5 ${
            stagger ? 'animate-tour-mobile-copy-in' : ''
          }`}
          style={stagger ? delayStyle(3) : undefined}
        >
          {stop.points.map((point) => (
            <li
              key={point}
              className={`rounded-full border px-2.5 py-1 text-[11px] leading-snug ${descCls} ${chipCls}`}
            >
              {point}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}
