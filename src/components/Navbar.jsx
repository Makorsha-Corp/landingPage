import { useState } from 'react'
import FloatingNavbarShell from './FloatingNavbarShell'
import ThemeToggleButton from './ThemeToggleButton'
import BrandLogo from './BrandLogo'
import { BRAND_NAME } from '../lib/brand.js'
import Button from './ui/Button'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <FloatingNavbarShell>
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <BrandLogo />
          <span className="text-xl font-bold text-foreground">{BRAND_NAME}</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggleButton />

          <a
            href="https://frontend-theta-dusky-91.vercel.app/login2"
            className="hidden sm:inline-flex text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </a>

          <Button
            as="a"
            href="https://frontend-theta-dusky-91.vercel.app/login2"
            size="sm"
          >
            Get started
          </Button>

          <Button
            variant="muted"
            size="icon"
            className="flex md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://frontend-theta-dusky-91.vercel.app/login2"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </a>
          </div>
        </div>
      )}
    </FloatingNavbarShell>
  )
}
