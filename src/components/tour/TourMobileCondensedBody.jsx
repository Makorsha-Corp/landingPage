import TourStoryPointsList from './TourStoryPointsList'

export default function TourMobileCondensedBody({
  stop,
  descCls,
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
      <TourStoryPointsList
        points={stop.points}
        descCls={descCls}
        className={`mt-3 grid grid-cols-2 gap-x-3 gap-y-2 ${
          stagger ? 'animate-tour-mobile-copy-in' : ''
        }`}
        itemClassName="text-xs leading-snug"
        style={stagger ? delayStyle(3) : undefined}
      />
    </>
  )
}
