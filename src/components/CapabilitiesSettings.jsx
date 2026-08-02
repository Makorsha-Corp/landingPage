const inputCls =
  'w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
const labelCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'

export default function CapabilitiesSettings({ card, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...card, [field]: value })
  }

  return (
    <div className="space-y-2.5">
      <div>
        <label className={labelCls} htmlFor={`cap-title-${card.id}`}>
          Title
        </label>
        <input
          id={`cap-title-${card.id}`}
          className={inputCls}
          value={card.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor={`cap-desc-${card.id}`}>
          Description
        </label>
        <textarea
          id={`cap-desc-${card.id}`}
          rows={3}
          className={inputCls}
          value={card.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor={`cap-screenshot-${card.id}`}>
          Screenshot URL
        </label>
        <input
          id={`cap-screenshot-${card.id}`}
          className={inputCls}
          placeholder={`/features/${card.id}.png`}
          value={card.screenshotSrc ?? ''}
          onChange={(e) => updateField('screenshotSrc', e.target.value || null)}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor={`cap-badge-${card.id}`}>
          Badge
        </label>
        <select
          id={`cap-badge-${card.id}`}
          className={inputCls}
          value={card.badge ?? ''}
          onChange={(e) => updateField('badge', e.target.value || null)}
        >
          <option value="">None</option>
          <option value="Coming soon">Coming soon</option>
        </select>
      </div>
    </div>
  )
}
