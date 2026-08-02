import { useState } from 'react'
import SectionEyebrow from './SectionEyebrow'
import FaqSettings from './FaqSettings'
import useInView from '../hooks/useInView'
import { isPublishableFaq } from '../lib/faqContent'
import {
  marketingCard,
  sectionHeaderWrap,
  sectionLead,
  sectionTitle,
} from '../lib/loginSurfaceStyles'

function FaqAccordionItem({
  item,
  index,
  openIndex,
  onToggle,
  reducedMotion,
  editMode,
  onItemChange,
}) {
  const panelId = `faq-panel-${item.id}`
  const buttonId = `faq-button-${item.id}`
  const isOpen = openIndex === index
  const [ref, inView] = useInView({ enabled: !reducedMotion })
  const reveal = reducedMotion || inView

  return (
    <div
      ref={ref}
      className={`overflow-hidden transition-all ${marketingCard} ${
        isOpen ? 'shadow-md ring-1 ring-border/60' : ''
      } ${editMode ? 'ring-2 ring-primary/50' : ''} ${
        reveal ? 'animate-fade-up' : 'opacity-0'
      }`}
      style={reveal && !reducedMotion ? { animationDelay: `${index * 80}ms` } : undefined}
    >
      {editMode ? (
        <div className="px-6 py-4">
          <FaqSettings
            item={item}
            index={index}
            onChange={onItemChange}
          />
        </div>
      ) : (
        <>
          <button
            id={buttonId}
            type="button"
            onClick={() => onToggle(index)}
            aria-expanded={isOpen}
            aria-controls={panelId}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="pr-4 font-semibold text-foreground">{item.question}</span>
            <svg
              className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className={`overflow-hidden transition-all duration-200 ${
              isOpen ? 'max-h-64' : 'max-h-0'
            }`}
          >
            <div className="px-5 pb-4 leading-relaxed text-muted-foreground">{item.answer}</div>
          </div>
        </>
      )}
    </div>
  )
}

export default function FAQ({
  faq,
  reducedMotion = false,
  editMode = false,
  onFaqChange,
}) {
  const [openIndex, setOpenIndex] = useState(null)
  const visibleItems = editMode ? faq.items : faq.items.filter(isPublishableFaq)

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section id="faq" className="flex h-full min-h-0 w-full flex-1 flex-col justify-center py-20">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className={`mb-8 ${sectionHeaderWrap}`}>
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 className={`mt-3 ${sectionTitle}`}>Frequently asked questions</h2>
          <p className={`mt-3 ${sectionLead}`}>
            Can&apos;t find what you&apos;re looking for? Contact our team when support details
            are published.
          </p>
        </div>

        <div className="space-y-3">
          {visibleItems.map((item) => {
            const sourceIndex = faq.items.findIndex((entry) => entry.id === item.id)
            return (
              <FaqAccordionItem
                key={item.id}
                item={item}
                index={sourceIndex}
                openIndex={openIndex}
                onToggle={handleToggle}
                reducedMotion={reducedMotion}
                editMode={editMode}
                onItemChange={(updated) => {
                  const nextItems = faq.items.map((entry) =>
                    entry.id === updated.id ? updated : entry,
                  )
                  onFaqChange?.({ items: nextItems })
                }}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
