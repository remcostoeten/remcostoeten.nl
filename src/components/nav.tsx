'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Hash, FolderOpen } from 'lucide-react'

const navItems = [
  { path: '/', name: 'home', icon: Home },
  { path: '/blog', name: 'blog', icon: FileText },
  { path: '/categories', name: 'categories', icon: FolderOpen },
  { path: '/topics', name: 'topics', icon: Hash },
]

export function Navbar() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <aside className="mb-12 tracking-tight">
      <nav
        className="flex flex-row items-center relative"
        id="nav"
        aria-label="Main navigation"
      >
        <div className="flex flex-row items-center gap-1">
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
      </nav>
    </aside>
  )
}
