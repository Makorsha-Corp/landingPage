import NavbarShell from './NavbarShell'

/** @deprecated Use NavbarShell or LandingNavBar */
export default function FloatingNavbarShell({ children, className = '' }) {
  return (
    <NavbarShell layout="island" className={className}>
      {children}
    </NavbarShell>
  )
}
