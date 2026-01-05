'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal, X, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { DevWidgetConfig, Corner, Session } from './types'
import { AuthSection } from './sections/AuthSection'
import { RoutesSection } from './sections/RoutesSection'
import { SystemInfoSection } from './sections/SystemInfoSection'
import { SettingsPopover } from './sections/SettingsPopover'

interface DevWidgetProps extends DevWidgetConfig {
  session?: Session | null
  onSignOut?: () => void
}

const DEFAULT_ROUTES = [
  '/',
  '/admin',
  '/blog',
  '/blog/[...slug]',
  '/projects',
  '/api/example',
]

export function DevWidget({
  session,
  onSignOut,
  showAuth = true,
  showRoutes = true,
  showSystemInfo = true,
  showSettings = true,
  routes = DEFAULT_ROUTES,
  customTitle,
  isAdmin = false,
}: DevWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [corner, setCorner] = useState<Corner>('bottom-right')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const pathname = usePathname()
  const isDev = process.env.NODE_ENV === 'development'
  const shouldShow = isDev || isAdmin

  const getCornerPosition = (c: Corner) => {
    const offset = 16
    switch (c) {
      case 'top-left': return { left: offset, top: offset, right: undefined, bottom: undefined }
      case 'top-right': return { right: offset, top: offset, left: undefined, bottom: undefined }
      case 'bottom-left': return { left: offset, bottom: offset, right: undefined, top: undefined }
      case 'bottom-right': return { right: offset, bottom: offset, left: undefined, top: undefined }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`') {
        setIsMinimized(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!shouldShow) return null

  const currentPos = getCornerPosition(corner)

  if (isMinimized) {
    return (
      <div
        className="fixed z-50 transition-all duration-300 ease-in-out"
        style={currentPos}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-black/80 text-white p-2 rounded-lg shadow-lg hover:bg-black/90 transition-colors backdrop-blur-sm border border-white/10"
          title="Dev Tools"
        >
          <Terminal className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <>
      {showSettings && (
        <SettingsPopover
          isOpen={isSettingsOpen}
          corner={corner}
          onClose={() => setIsSettingsOpen(false)}
          onCornerChange={setCorner}
          currentPos={currentPos}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="fixed z-50 bg-zinc-950/80 text-white rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl border border-white/10 min-w-[300px] max-h-[85vh] overflow-hidden flex flex-col"
        style={currentPos}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Terminal className="w-4 h-4 text-yellow-500" />
              <div className="absolute inset-0 bg-yellow-500/20 blur-sm rounded-full" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              {customTitle || (isDev ? 'Dev Mode' : 'Admin Tools')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showSettings && (
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="text-white/60 hover:text-white transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
          {showAuth && session && (
            <AuthSection
              session={session}
              onSignOut={onSignOut}
            />
          )}

          {showRoutes && (
            <RoutesSection
              routes={routes}
              pathname={pathname}
            />
          )}

          {showSystemInfo && (
            <SystemInfoSection
              isExpanded={isExpanded}
              onToggle={() => setIsExpanded(!isExpanded)}
            />
          )}
        </div>

        <div className="p-1 text-center border-t border-white/5 bg-zinc-950/50">
          <div className="w-8 h-1 bg-white/10 rounded-full mx-auto my-1" />
        </div>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  )
}
