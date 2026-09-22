import type { ReactNode } from 'react'
import { navChromeBorderClass, navShellSurfaceClass } from '../lib/navChrome'

interface NavbarShellProps {
  children?: ReactNode
  className?: string
}

export default function NavbarShell({ children, className = '' }: NavbarShellProps) {
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 pointer-events-none ${className}`}
    >
      <div
        className={`pointer-events-auto mx-auto max-w-6xl overflow-visible rounded-2xl border ${navChromeBorderClass} ${navShellSurfaceClass} shadow-lg`}
      >
        {children}
      </div>
    </header>
  )
}
