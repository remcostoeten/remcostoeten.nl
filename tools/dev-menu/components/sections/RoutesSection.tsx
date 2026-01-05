'use client'

import { Route, Zap } from 'lucide-react'
import Link from 'next/link'

interface RoutesSectionProps {
  routes: string[]
  pathname: string
}

export function RoutesSection({ routes, pathname }: RoutesSectionProps) {
  const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget.value
      if (target.startsWith('/')) {
        window.location.href = target
      }
    }
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3 px-1 text-zinc-400">
        <Route className="w-3.5 h-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">Routes ({routes.length})</span>
      </div>

      <div className="mb-4 group">
        <input
          type="text"
          placeholder="Jump to route..."
          className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
          onKeyDown={handleJump}
        />
      </div>

      <div className="max-h-[200px] overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
        <div className="text-[10px] text-zinc-500 px-2 py-1 mb-1 bg-white/5 rounded-md border border-white/5">
          Current: <span className="text-blue-400 font-mono">{pathname}</span>
        </div>
        {routes.map((route) => {
          const isDynamic = route.includes('[')
          const isActive = pathname === route

          if (isDynamic) {
            return (
              <div
                key={route}
                className="text-[11px] px-3 py-1.5 rounded-lg text-zinc-600 flex items-center justify-between group/route"
                title="Dynamic route - requires parameters"
              >
                <code className="font-mono">{route}</code>
                <Zap className="w-3 h-3 opacity-0 group-hover/route:opacity-100 transition-opacity" />
              </div>
            )
          }

          return (
            <Link
              key={route}
              href={route}
              className={`flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg transition-all ${isActive
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <code className="font-mono">{route}</code>
              {isActive && <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
