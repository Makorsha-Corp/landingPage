import { useState } from 'react'
import SectionEyebrow from './SectionEyebrow'
import FaqSettings from './FaqSettings'
import useInView from '../hooks/useInView'
import { useTheme } from '../context/ThemeContext'
import { isPublishableFaq } from '../lib/faqContent'
import { getStoryCardInteractiveClasses, getStoryCardStyles } from '../lib/storyCardStyles'
import {
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
  theme,
}) {
  const panelId = `faq-panel-${item.id}`
  const buttonId = `faq-button-${item.id}`
  const isOpen = openIndex === index
  const isDark = theme === 'dark'
  const { card: cardCls } = getStoryCardStyles(theme)
  const [ref, inView] = useInView({ enabled: !reducedMotion })
  const reveal = reducedMotion || inView

  const questionCls = isDark ? 'pr-4 font-semibold text-white' : 'pr-4 font-semibold text-foreground'
  const answerCls = isDark ? 'leading-relaxed text-white/75' : 'leading-relaxed text-muted-foreground'
  const chevronCls = isDark ? 'text-white/60 group-hover:text-primary' : 'text-muted-foreground group-hover:text-primary'

  const shellCls = editMode
    ? `relative overflow-hidden rounded-2xl border p-0 ${cardCls} shadow-[0_12px_32px_-14px_rgba(0,0,0,0.55)] ring-2 ring-primary/50`
    : `group relative overflow-hidden rounded-2xl border p-0 text-left ${cardCls} ${getStoryCardInteractiveClasses(theme)}`

  return (
    <div
      ref={ref}
      role={editMode ? undefined : 'button'}
      tabIndex={editMode ? undefined : 0}
      id={editMode ? undefined : buttonId}
      aria-expanded={editMode ? undefined : isOpen}
      aria-controls={editMode ? undefined : panelId}
      onClick={editMode ? undefined : () => onToggle(index)}
      onKeyDown={
        editMode
          ? undefined
          : (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onToggle(index)
              }
            }
      }
      className={`${shellCls} ${
        isOpen && !editMode ? (isDark ? 'ring-primary/40' : 'ring-primary/25') : ''
      } ${reveal ? 'animate-fade-up' : 'opacity-0'}`}
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
          <div className="flex w-full items-center justify-between px-5 py-4 text-left">
            <span className={questionCls}>{item.question}</span>
            <svg
              className={`h-5 w-5 shrink-0 transition-[color,transform] duration-300 ${chevronCls} ${
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
          </div>
          <div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className={`overflow-hidden transition-all duration-200 ${
              isOpen ? 'max-h-64' : 'max-h-0'
            }`}
          >
            <div className={`px-5 pb-4 ${answerCls}`}>{item.answer}</div>
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
  const { theme } = useTheme()
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
                theme={theme}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
