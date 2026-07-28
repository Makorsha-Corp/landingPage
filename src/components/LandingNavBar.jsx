import { Link } from 'react-router-dom'
import { useNavLayout } from '../context/NavLayoutContext'
import { navTitleClass } from '../lib/navChrome'
import BrandLogo from './BrandLogo'
import LandingSectionNav from './LandingSectionNav'
import NavbarShell from './NavbarShell'

export default function LandingNavBar({ sections, activeSection, onSectionNavigate, actions }) {
  const { navLayout } = useNavLayout()

  return (
    <NavbarShell layout={navLayout}>
      <div className="relative flex h-14 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo variant="soft" />
          <span className={navTitleClass}>Marker</span>
        </Link>
        <LandingSectionNav
          sections={sections}
          activeSection={activeSection}
          onNavigate={onSectionNavigate}
        />
        <div className="flex items-center gap-2 overflow-visible sm:gap-3">{actions}</div>
      </div>
    </NavbarShell>
  )
}
