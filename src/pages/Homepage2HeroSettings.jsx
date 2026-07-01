const inputCls =
  'w-full rounded-lg border border-white/20 bg-black/30 px-2.5 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/40'
const labelCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-wide text-white/60'

export default function Homepage2HeroSettings({ hero, onChange, onSave }) {
  const update = (field, value) => {
    onChange({ ...hero, [field]: value })
  }

  return (
    <div className="space-y-4 text-left">
      <div className="border-b border-white/20 pb-3 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          {hero.badge}
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
          {hero.title}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-base font-medium leading-relaxed text-white/95">
          {hero.subtitle}
        </p>
      </div>

      <div className="space-y-2.5">
        <div>
          <label className={labelCls} htmlFor="hero-badge">Badge</label>
          <input
            id="hero-badge"
            className={inputCls}
            value={hero.badge}
            onChange={(e) => update('badge', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="hero-title">Title</label>
          <input
            id="hero-title"
            className={inputCls}
            value={hero.title}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="hero-subtitle">Subtitle</label>
          <textarea
            id="hero-subtitle"
            rows={3}
            className={inputCls}
            value={hero.subtitle}
            onChange={(e) => update('subtitle', e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onSave}
        className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Save hero
      </button>
    </div>
  )
}
