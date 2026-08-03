import { useTheme } from '../context/ThemeContext'
import SectionEyebrow from './SectionEyebrow'
import CapabilitiesGrid from './CapabilitiesGrid'

const headerInputCls =
  'mt-2 w-full rounded-lg border border-border bg-background/90 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'

export default function Capabilities({
  capabilities,
  reducedMotion = false,
  editMode = false,
  scrollerRef,
  onOverlayOpenChange,
  onCapabilitiesChange,
}) {
  const { theme } = useTheme()
  const allCards = capabilities.cards

  const updateHeader = (field, value) => {
    onCapabilitiesChange?.({ ...capabilities, [field]: value })
  }

  return (
    <section className="relative w-full pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto mb-10 max-w-2xl shrink-0 text-center sm:mb-12 ${
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

        <CapabilitiesGrid
          cards={allCards}
          theme={theme}
          reducedMotion={reducedMotion}
          editMode={editMode}
          scrollerRef={scrollerRef}
          onOverlayOpenChange={onOverlayOpenChange}
          onCardChange={(updated) => {
            const nextCards = allCards.map((c) => (c.id === updated.id ? updated : c))
            onCapabilitiesChange?.({ ...capabilities, cards: nextCards })
          }}
        />
      </div>
    </section>
  )
}
