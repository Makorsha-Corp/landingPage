import { navActiveSectionClass, navLinkClass } from '../lib/navChrome'
import useIsMobileTour from '../hooks/useIsMobileTour'

export default function LandingSectionNav({ sections, activeSection, onNavigate }) {
  const isMobileTour = useIsMobileTour()

  if (isMobileTour) return null

  return (
    <nav
      aria-label="Page sections"
      className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5"
    >
      {sections.map((section) => {
        const isActive = activeSection === section.id
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onNavigate(section.id)}
            className={isActive ? navActiveSectionClass : navLinkClass}
            aria-current={isActive ? 'true' : undefined}
          >
            {section.label}
          </button>
        )
      })}
    </nav>
  )
}
