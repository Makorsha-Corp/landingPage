import { useRef, useState } from 'react'
import useFloatingPanelDrag from '../hooks/useFloatingPanelDrag'
import {
  CardPlacementDpad,
  CardSizeControls,
  normalizeCard,
} from './Homepage2CardControls'
import Homepage2StoryCardTextFields from './Homepage2StoryCardTextFields'

const sectionLabelCls =
  'text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60'

export default function Homepage2FloatingCardLayoutControls({
  boundsRef,
  stop,
  onChange,
}) {
  const panelRef = useRef(null)
  const [tab, setTab] = useState('layout')
  const { panelStyle, handleProps } = useFloatingPanelDrag({
    boundsRef,
    panelRef,
  })

  const card = normalizeCard(stop.card)

  const updateCard = (patch) => {
    onChange({ ...stop, card: { ...card, ...patch } })
  }

  return (
    <div
      ref={panelRef}
      className="pointer-events-auto absolute z-50 w-[min(18rem,calc(100vw-2rem))] max-h-[min(72vh,36rem)] overflow-y-auto rounded-2xl border border-white/20 bg-black/55 p-4 shadow-2xl backdrop-blur-md ring-2 ring-primary/40"
      style={panelStyle}
    >
      <div
        {...handleProps}
        className={`mb-3 flex items-start justify-between gap-2 border-b border-white/15 pb-3 ${handleProps.className}`}
      >
        <div className="min-w-0">
          <p className={sectionLabelCls}>Card editor</p>
          <p className="truncate text-sm font-medium text-white">{stop.title}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-white/50">
            Drag card header or this panel. D-pad syncs live.
          </p>
        </div>
        <span className="shrink-0 text-lg text-white/40" aria-hidden="true">
          ⠿
        </span>
      </div>

      <div className="mb-3 flex rounded-lg border border-white/15 p-0.5">
        {['layout', 'text'].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`flex-1 rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
              tab === value
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {tab === 'layout' ? (
        <div className="space-y-4">
          <div>
            <p className={sectionLabelCls}>Position</p>
            <div className="mt-2">
              <CardPlacementDpad card={card} onChange={updateCard} variant="overlay" />
            </div>
          </div>
          <div>
            <p className={sectionLabelCls}>Size</p>
            <div className="mt-2">
              <CardSizeControls card={card} onChange={updateCard} variant="overlay" />
            </div>
          </div>
        </div>
      ) : (
        <Homepage2StoryCardTextFields stop={stop} onChange={onChange} />
      )}
    </div>
  )
}
