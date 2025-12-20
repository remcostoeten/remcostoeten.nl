'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Home, FileText, Hash, FolderOpen, Menu, X } from 'lucide-react'

const navItems = [
  { path: '/', name: 'home', icon: Home },
  { path: '/blog', name: 'blog', icon: FileText },
  { path: '/blog/categories', name: 'categories', icon: FolderOpen },
  { path: '/blog/topics', name: 'topics', icon: Hash },
]

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileMenuOpen])

  return (
    <aside className="mb-12 tracking-tight">
      <nav
        ref={navRef}
        className="relative"
        id="nav"
        aria-label="Main navigation"
      >
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-row items-center gap-1">
          {navItems.map(({ path, name, icon: Icon }) => {
            const active = isActive(path)
            return (
              <Link
                key={path}
                href={path}
                className={`
                  group relative flex items-center gap-2 py-2 px-3 rounded-lg
                  text-sm font-medium transition-colors
                  ${active
                    ? 'text-foreground bg-muted'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" />
                <span className="capitalize">{name}</span>

                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 p-4 bg-background border border-border/50 rounded-lg shadow-lg z-50">
            <div className="flex flex-col gap-1">
              {navItems.map(({ path, name, icon: Icon }) => {
                const active = isActive(path)
                return (
                  <Link
                    key={path}
                    href={path}
                    className={`
                      group relative flex items-center gap-3 py-3 px-3 rounded-lg
                      text-sm font-medium transition-colors
                      ${active
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }
                    `}
                    aria-current={active ? 'page' : undefined}
                    onClick={closeMobileMenu}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="capitalize">{name}</span>

                    {active && (
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-foreground" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </aside>
  )
}
