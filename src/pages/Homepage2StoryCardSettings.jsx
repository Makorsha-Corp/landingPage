import { useState } from 'react'
import Button from '../components/ui/Button'
import { CardPlacementDpad, CardSizeControls, normalizeCard } from './Homepage2CardControls'

const inputCls =
  'w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
const labelCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'

export default function Homepage2StoryCardSettings({ stop, onChange, onSave }) {
  const [tab, setTab] = useState('text')
  const card = normalizeCard(stop.card)

  const updateField = (field, value) => {
    onChange({ ...stop, [field]: value })
  }

  const updateCard = (patch) => {
    onChange({ ...stop, card: { ...card, ...patch } })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
        <span className="text-xs font-semibold text-primary">Editing card</span>
        <div className="flex rounded-lg border border-border p-0.5">
          {['text', 'layout'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                tab === t
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'text' && (
        <div className="space-y-2.5">
          <div>
            <label className={labelCls} htmlFor="inline-title">Title</label>
            <input
              id="inline-title"
              className={inputCls}
              value={stop.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="inline-desc">Description</label>
            <textarea
              id="inline-desc"
              rows={2}
              className={inputCls}
              value={stop.desc}
              onChange={(e) => updateField('desc', e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="inline-desc2">Second paragraph</label>
            <textarea
              id="inline-desc2"
              rows={2}
              className={inputCls}
              value={stop.desc2 || ''}
              onChange={(e) => updateField('desc2', e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="inline-points">Bullets (one per line)</label>
            <textarea
              id="inline-points"
              rows={3}
              className={inputCls}
              value={(stop.points || []).join('\n')}
              onChange={(e) =>
                updateField(
                  'points',
                  e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                )
              }
            />
          </div>
        </div>
      )}

      {tab === 'layout' && (
        <div className="space-y-4">
          <CardPlacementDpad card={card} onChange={updateCard} compact />
          <CardSizeControls card={card} onChange={updateCard} compact />
        </div>
      )}

      <Button type="button" onClick={onSave} size="xs" className="w-full">
        Save section
      </Button>
    </div>
  )
}
