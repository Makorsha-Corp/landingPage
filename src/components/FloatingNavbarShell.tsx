import type { ReactNode } from 'react'
import NavbarShell from './NavbarShell'

interface FloatingNavbarShellProps {
  children?: ReactNode
  className?: string
}

/** @deprecated Use NavbarShell or LandingNavBar */
export default function FloatingNavbarShell({ children, className = '' }: FloatingNavbarShellProps) {
  return (
    <NavbarShell className={className}>
      {children}
    </NavbarShell>
  )
}
