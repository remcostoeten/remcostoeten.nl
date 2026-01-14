'use client'

import { LogOut } from 'lucide-react'
import { Session } from '../types'

interface AuthSectionProps {
  session?: Session | null
  onSignOut?: () => void
}

export function AuthSection({ session, onSignOut }: AuthSectionProps) {
  if (!session) return null

  return (
    <div className="p-2 m-2 bg-[hsl(0,0%,8.6%)] border border-[hsl(0,0%,18%)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium text-[hsl(0,0%,85%)]">
            {session?.user?.name || 'anonymous'}
          </div>
          {session?.user?.email && (
            <div className="text-[10px] text-[hsl(0,0%,40%)]">
              {session.user.email}
            </div>
          )}
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex items-center gap-1 px-2 py-1 text-[10px] bg-[hsl(355,98%,75%)]/10 text-[hsl(355,98%,75%)] hover:bg-[hsl(355,98%,75%)]/20 border border-[hsl(355,98%,75%)]/20 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3 h-3" />
            <span>logout</span>
          </button>
        )}
      </div>
    </div>
  )
}
