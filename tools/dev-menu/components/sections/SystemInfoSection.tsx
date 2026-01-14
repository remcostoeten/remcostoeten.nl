'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface SystemInfoSectionProps {
  isExpanded: boolean
  onToggle: () => void
}

export function SystemInfoSection({ isExpanded, onToggle }: SystemInfoSectionProps) {
  return (
    <>
      <div className="px-2 pt-1">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] text-[hsl(0,0%,55%)] hover:text-[hsl(0,0%,85%)] hover:bg-[hsl(0,0%,18%)] transition-colors group"
        >
          <span className="uppercase tracking-wider">system</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 py-2 space-y-1.5 text-[10px]">
              <div className="flex justify-between border-b border-[hsl(0,0%,18%)] pb-1">
                <span className="text-[hsl(0,0%,40%)] uppercase">env</span>
                <span className="text-[hsl(167.8,53.25%,65%)]">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex justify-between border-b border-[hsl(0,0%,18%)] pb-1">
                <span className="text-[hsl(0,0%,40%)] uppercase">admin</span>
                <span className="text-[hsl(0,0%,55%)] truncate max-w-[120px]">{process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'n/a'}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[hsl(0,0%,40%)] uppercase block">ua</span>
                <span className="block text-[9px] text-[hsl(0,0%,40%)] leading-relaxed break-all">
                  {typeof window !== 'undefined' ? navigator.userAgent.slice(0, 80) + '...' : 'n/a'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
