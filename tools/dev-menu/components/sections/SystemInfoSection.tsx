'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Settings } from 'lucide-react'

interface SystemInfoSectionProps {
  isExpanded: boolean
  onToggle: () => void
}

export function SystemInfoSection({ isExpanded, onToggle }: SystemInfoSectionProps) {
  return (
    <>
      <div className="px-3 pt-2 pb-1">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all group"
        >
          <span>SYSTEM INFO</span>
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <Settings className="w-3 h-3" />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-3 space-y-2 text-[10px] text-zinc-500 font-mono">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-zinc-600 uppercase">Environment</span>
                <span className="text-green-500/80">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-zinc-600 uppercase">Admin</span>
                <span className="truncate max-w-[120px]">{process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'Not set'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-600 uppercase block">User Agent</span>
                <span className="block leading-relaxed opacity-60">
                  {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
