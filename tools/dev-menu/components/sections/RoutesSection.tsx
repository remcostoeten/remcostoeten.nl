'use client'

import { Zap, Home, FileText, Code, Shield } from 'lucide-react'
import Link from 'next/link'
import { getRoutesByCategory, RouteItem } from '../../utils/generate-routes'

type Props = {
  pathname: string
}

const CATEGORY_CONFIG = {
  core: { icon: Home, label: 'core' },
  blog: { icon: FileText, label: 'blog' },
  dev: { icon: Code, label: 'dev' },
  legal: { icon: Shield, label: 'legal' },
} as const

function RouteLink({ route, pathname }: Props & { route: RouteItem }) {
  const isActive = pathname === route.path

  if (route.isDynamic) {
    return (
      <div
        className="text-[10px] px-2 py-1 text-[hsl(0,0%,40%)] flex items-center justify-between group/route"
        title="Dynamic route"
      >
        <span>{route.label}</span>
        <Zap className="w-2.5 h-2.5 opacity-0 group-hover/route:opacity-100 transition-opacity" />
      </div>
    )
  }
  ``
  return (
    <Link
      href={route.path}
      className={`flex items-center justify-between text-[10px] px-2 py-1 transition-colors ${isActive
        ? 'bg-[hsl(167.8,53.25%,54.71%)]/10 text-[hsl(167.8,53.25%,65%)] border-l-2 border-[hsl(167.8,53.25%,54.71%)]'
        : 'text-[hsl(0,0%,55%)] hover:text-[hsl(0,0%,85%)] hover:bg-[hsl(0,0%,18%)]'
        }`}
    >
      <span>{route.label}</span>
      {isActive && <div className="w-1 h-1 bg-[hsl(167.8,53.25%,54.71%)]" />}
    </Link>
  )
}

export function RoutesSection({ pathname }: Props) {
  const categorizedRoutes = getRoutesByCategory()

  const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget.value.trim()
      if (target.startsWith('/')) {
        window.location.href = target
      } else if (target) {
        window.location.href = `/${target}`
      }
    }
  }

  return (
    <div className="p-2">
      <input
        type="text"
        placeholder="go to /..."
        className="w-full bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,18%)] px-2 py-1.5 text-[10px] text-[hsl(0,0%,85%)] placeholder:text-[hsl(0,0%,40%)] focus:outline-none focus:border-[hsl(167.8,53.25%,54.71%)] transition-colors"
        onKeyDown={handleJump}
      />

      <div className="text-[9px] text-[hsl(0,0%,40%)] px-2 py-1.5 mt-1 border-b border-[hsl(0,0%,18%)]">
        <span className="text-[hsl(0,0%,55%)]">@</span> <span className="text-[hsl(167.8,53.25%,65%)]">{pathname}</span>
      </div>

      <div className="space-y-1 max-h-[160px] overflow-y-auto scrollbar-hide mt-1">
        {(Object.entries(categorizedRoutes) as [keyof typeof CATEGORY_CONFIG, RouteItem[]][]).map(
          ([category, routes]) => {
            if (routes.length === 0) return null
            const { icon: Icon, label } = CATEGORY_CONFIG[category]

            return (
              <div key={category}>
                <div className="flex items-center gap-1.5 px-2 py-1 text-[hsl(0,0%,40%)]">
                  <Icon className="w-3 h-3" />
                  <span className="text-[9px] uppercase tracking-wider">{label}</span>
                </div>
                <div>
                  {routes.map(route => (
                    <RouteLink key={route.path} route={route} pathname={pathname} />
                  ))}
                </div>
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}
