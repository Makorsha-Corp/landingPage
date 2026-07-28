import { navActiveSectionClass, navLinkClass } from '../lib/navChrome'

export default function LandingSectionNav({ sections, activeSection, onNavigate }) {
  return (
    <nav
      aria-label="Page sections"
      className="absolute left-1/2 hidden -translate-x-1/2 md:flex md:items-center md:gap-1.5"
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
