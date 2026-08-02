const inputCls =
  'w-full rounded-lg border border-white/20 bg-black/30 px-2.5 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/40'
const labelCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-wide text-white/60'

export default function Homepage2StoryCardTextFields({ stop, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...stop, [field]: value })
  }

  return (
    <div className="space-y-2.5">
      <div>
        <label className={labelCls} htmlFor="float-inline-title">
          Title
        </label>
        <input
          id="float-inline-title"
          className={inputCls}
          value={stop.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="float-inline-desc">
          Description
        </label>
        <textarea
          id="float-inline-desc"
          rows={2}
          className={inputCls}
          value={stop.desc}
          onChange={(e) => updateField('desc', e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="float-inline-desc2">
          Second paragraph
        </label>
        <textarea
          id="float-inline-desc2"
          rows={2}
          className={inputCls}
          value={stop.desc2 || ''}
          onChange={(e) => updateField('desc2', e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="float-inline-points">
          Bullets (one per line)
        </label>
        <textarea
          id="float-inline-points"
          rows={3}
          className={inputCls}
          value={(stop.points || []).join('\n')}
          onChange={(e) => updateField('points', e.target.value.split('\n'))}
        />
      </div>
    </div>
  )
}
