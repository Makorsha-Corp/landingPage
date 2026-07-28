import { useTheme } from '../context/ThemeContext'
import { getLoginRadialGradientStyle } from '../../shared/loginGradient.js'
import SectionEyebrow from './SectionEyebrow'
import CapabilitiesCarousel from './CapabilitiesCarousel'

const CAPABILITY_BACKGROUNDS = {
  light: '/homepage-background-blur.png',
  dark: '/homepage-background-blur-dark.png',
}

const headerInputCls =
  'mt-2 w-full rounded-lg border border-border bg-background/90 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'

export default function Capabilities({
  capabilities,
  reducedMotion = false,
  editMode = false,
  onCapabilitiesChange,
  onSave,
}) {
  const { theme } = useTheme()
  const allCards = capabilities.cards

  const updateHeader = (field, value) => {
    onCapabilitiesChange?.({ ...capabilities, [field]: value })
  }

  return (
    <section className="relative flex h-full min-h-0 w-full flex-1 flex-col justify-start pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src={CAPABILITY_BACKGROUNDS[theme]}
          alt=""
          className="h-full w-full scale-110 object-cover"
        />
        <div
          className={`absolute inset-0 ${
            theme === 'dark' ? 'bg-background/70' : 'bg-background/60'
          }`}
        />
        {!reducedMotion && (
          <div
            className="absolute inset-0 opacity-70 mix-blend-soft-light"
            style={getLoginRadialGradientStyle()}
          />
        )}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      </div>

      <div className="relative z-[1] mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto mb-6 max-w-2xl shrink-0 text-center sm:mb-8 ${
            editMode ? 'rounded-2xl p-4 ring-2 ring-primary/50' : ''
          }`}
        >
          {editMode ? (
            <div className="space-y-3 text-left">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Eyebrow
                </label>
                <input
                  className={headerInputCls}
                  value={capabilities.eyebrow}
                  onChange={(e) => updateHeader('eyebrow', e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Heading
                </label>
                <input
                  className={headerInputCls}
                  value={capabilities.heading}
                  onChange={(e) => updateHeader('heading', e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Subheading
                </label>
                <textarea
                  rows={3}
                  className={headerInputCls}
                  value={capabilities.sub}
                  onChange={(e) => updateHeader('sub', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <>
              <SectionEyebrow>{capabilities.eyebrow}</SectionEyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {capabilities.heading}
              </h2>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">{capabilities.sub}</p>
            </>
          )}
        </div>

        <CapabilitiesCarousel
          cards={allCards}
          theme={theme}
          reducedMotion={reducedMotion}
          editMode={editMode}
          onCardChange={(updated) => {
            const nextCards = allCards.map((c) => (c.id === updated.id ? updated : c))
            onCapabilitiesChange?.({ ...capabilities, cards: nextCards })
          }}
          onSave={onSave}
        />
      </div>
    </section>
  )
}
