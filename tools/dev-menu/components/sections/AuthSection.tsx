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
    <div className="p-3 m-2 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-white">
            {session?.user?.name || 'Not authenticated'}
          </div>
          {session?.user?.email && (
            <div className="text-xs text-white/40">
              {session.user.email}
            </div>
          )}
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 border border-red-500/20 transition-all"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  )
}
