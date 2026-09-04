import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import CapabilitiesSettings from './CapabilitiesSettings'
import FeatureCardDialog from './FeatureCardDialog'
import useInView from '../hooks/useInView'
import {
  getStoryCardArrowPillClasses,
  getStoryCardInteractiveClasses,
  getStoryCardStyles,
} from '../lib/storyCardStyles'

const CAPABILITY_CARD_CLASS = 'flex h-[219px] flex-col text-left'
const CAPABILITY_CARD_EDIT_CLASS = 'flex min-h-[219px] flex-col'
const MAX_CAPABILITY_CARDS = 6

function CapabilityIcon({ path }) {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

function CapabilityCardContent({ card, titleCls, descCls }) {
  return (
    <>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white group-active:bg-primary group-active:text-white">
        <CapabilityIcon path={card.icon} />
      </div>
      <h3 className={`text-base font-semibold ${titleCls}`}>{card.title}</h3>
      <p className={`mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed ${descCls}`}>
        {card.description}
      </p>
    </>
  )
}

function CapabilityCard({
  card,
  index,
  theme,
  reducedMotion,
  editMode,
  reveal,
  onCardChange,
  onOpen,
}) {
  const { card: cardCls, title: titleCls, desc: descCls } = getStoryCardStyles(theme)
  const showCard = reducedMotion || reveal

  const sharedCls = `group relative rounded-2xl border p-5 ${editMode ? CAPABILITY_CARD_EDIT_CLASS : CAPABILITY_CARD_CLASS} ${cardCls} ${
    editMode ? 'ring-2 ring-primary/50' : ''
  } ${showCard ? 'animate-fade-up' : 'opacity-0'} ${
    !editMode ? getStoryCardInteractiveClasses(theme) : ''
  }`

  const style = showCard && !reducedMotion ? { animationDelay: `${Math.min(index, 5) * 40}ms` } : undefined

  const badge = card.badge ? (
    <span className="absolute right-4 top-4 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {card.badge}
    </span>
  ) : null

  if (editMode) {
    return (
      <div className={sharedCls} style={style}>
        {badge}
        <CapabilitiesSettings card={card} onChange={onCardChange} />
      </div>
    )
  }

  return (
    <button
      type="button"
      className={sharedCls}
      style={style}
      aria-haspopup="dialog"
      aria-label={`Open ${card.title} details`}
      onClick={() => onOpen(card)}
    >
      {badge}
      {!card.badge ? (
        <span className={getStoryCardArrowPillClasses(theme)} aria-hidden="true">
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </span>
      ) : null}
      <CapabilityCardContent card={card} titleCls={titleCls} descCls={descCls} />
    </button>
  )
}

export default function CapabilitiesGrid({
  cards,
  theme,
  reducedMotion = false,
  editMode = false,
  scrollerRef,
  onOverlayOpenChange,
  onCardChange,
}) {
  const [selectedCard, setSelectedCard] = useState(null)
  const [gridRef, gridInView] = useInView({ enabled: !reducedMotion, threshold: 0.05 })
  const visibleCards = cards.slice(0, MAX_CAPABILITY_CARDS)
  const revealCards = reducedMotion || gridInView

  const openCard = (card) => {
    setSelectedCard(card)
    onOverlayOpenChange?.(true)
  }

  const closeCard = () => {
    setSelectedCard(null)
    onOverlayOpenChange?.(false)
  }

  return (
    <>
      <div
        ref={gridRef}
        className="grid auto-rows-fr grid-cols-1 gap-4 py-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        aria-label="Feature cards"
      >
        {visibleCards.map((card, index) => (
          <CapabilityCard
            key={card.id}
            card={card}
            index={index}
            theme={theme}
            reducedMotion={reducedMotion}
            editMode={editMode}
            reveal={revealCards}
            onCardChange={onCardChange}
            onOpen={openCard}
          />
        ))}
      </div>

      {!editMode && (
        <FeatureCardDialog
          card={selectedCard}
          scrollerRef={scrollerRef}
          reducedMotion={reducedMotion}
          onClose={closeCard}
        />
      )}
    </>
  )
}
