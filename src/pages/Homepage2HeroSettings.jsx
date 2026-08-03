const inputCls =
  'w-full rounded-lg border border-white/20 bg-black/30 px-2.5 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/40'
const labelCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-wide text-white/60'

export default function Homepage2HeroSettings({ hero, onChange }) {
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
        {[hero.paragraph, hero.paragraph2].filter(Boolean).map((text, index) => (
          <p
            key={index}
            className="mx-auto mt-2 max-w-xl text-base font-medium leading-relaxed text-white/95"
          >
            {text}
          </p>
        ))}
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
            rows={2}
            className={inputCls}
            value={hero.subtitle}
            onChange={(e) => update('subtitle', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="hero-paragraph">Paragraph 1</label>
          <textarea
            id="hero-paragraph"
            rows={3}
            className={inputCls}
            value={hero.paragraph ?? ''}
            onChange={(e) => update('paragraph', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="hero-paragraph-2">Paragraph 2</label>
          <textarea
            id="hero-paragraph-2"
            rows={3}
            className={inputCls}
            value={hero.paragraph2 ?? ''}
            onChange={(e) => update('paragraph2', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
