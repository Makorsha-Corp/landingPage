import { Link } from 'react-router-dom'
import { navTitleClass } from '../lib/navChrome'
import BrandLogo from './BrandLogo'
import LandingSectionNav from './LandingSectionNav'
import LandingMobileMenu from './LandingMobileMenu'
import LandingMobileThemeDevMenu from './LandingMobileThemeDevMenu'
import NavbarShell from './NavbarShell'

export default function LandingNavBar({
  sections,
  activeSection,
  onSectionNavigate,
  desktopActions,
  devToolsProps,
}) {
  return (
    <NavbarShell>
      <div className="relative flex h-14 items-center gap-2 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <BrandLogo variant="soft" />
          <span className={navTitleClass}>Marker</span>
        </Link>

        <LandingSectionNav
          sections={sections}
          activeSection={activeSection}
          onNavigate={onSectionNavigate}
        />

        <LandingMobileMenu
          sections={sections}
          activeSection={activeSection}
          onNavigate={onSectionNavigate}
        />

        <div className="ml-auto flex shrink-0 items-center gap-2 overflow-visible sm:gap-3">
          {desktopActions}
          {devToolsProps ? <LandingMobileThemeDevMenu devToolsProps={devToolsProps} /> : null}
        </div>
      </div>
    </NavbarShell>
  )
}
