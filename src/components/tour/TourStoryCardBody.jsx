import { memo } from 'react'
import TourStoryPointsList from './TourStoryPointsList'

function TourStoryCardBody({ stop, titleCls, descCls, className = '' }) {
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
      <TourStoryPointsList points={stop.points} descCls={descCls} />
    </div>
  )
}

export default memo(TourStoryCardBody)
