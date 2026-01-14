'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid } from 'lucide-react'
import { Corner } from '../types'

interface SettingsPopoverProps {
  isOpen: boolean
  corner: Corner
  onClose: () => void
  onCornerChange: (corner: Corner) => void
  currentPos: { left?: number; right?: number; top?: number; bottom?: number }
}

export function SettingsPopover({ isOpen, corner, onClose, onCornerChange, currentPos }: SettingsPopoverProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[60] bg-[hsl(0,0%,7%)] border border-[hsl(0,0%,18%)] shadow-2xl p-2 min-w-[180px] font-mono"
          style={{
            right: currentPos.right !== undefined ? (Number(currentPos.right) + 16) : undefined,
            left: currentPos.left !== undefined ? (Number(currentPos.left) + 16) : undefined,
            top: currentPos.top !== undefined ? (Number(currentPos.top) + 50) : undefined,
            bottom: currentPos.bottom !== undefined ? (Number(currentPos.bottom) + 50) : undefined,
          }}
        >
          <div className="flex items-center gap-1.5 mb-2 px-1 text-[hsl(0,0%,55%)]">
            <LayoutGrid className="w-3 h-3" />
            <span className="text-[9px] uppercase tracking-wider">position</span>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as Corner[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  onCornerChange(c)
                  onClose()
                }}
                className={`relative flex flex-col items-center gap-1 p-1.5 border transition-colors ${
                  corner === c
                    ? 'bg-[hsl(167.8,53.25%,54.71%)]/10 border-[hsl(167.8,53.25%,54.71%)]/50 text-[hsl(167.8,53.25%,65%)]'
                    : 'bg-[hsl(0,0%,8.6%)] border-[hsl(0,0%,18%)] text-[hsl(0,0%,55%)] hover:text-[hsl(0,0%,85%)] hover:border-[hsl(0,0%,25%)]'
                }`}
              >
                <div className="w-full aspect-video bg-[hsl(0,0%,12%)] flex items-center justify-center relative">
                  <div className="absolute inset-0.5 border border-[hsl(0,0%,18%)]">
                    <div 
                      className={`absolute w-2.5 h-1.5 ${corner === c ? 'bg-[hsl(167.8,53.25%,54.71%)]' : 'bg-[hsl(0,0%,25%)]'}`}
                      style={{
                        top: c.startsWith('top') ? '1px' : 'auto',
                        bottom: c.startsWith('bottom') ? '1px' : 'auto',
                        left: c.endsWith('left') ? '1px' : 'auto',
                        right: c.endsWith('right') ? '1px' : 'auto',
                      }} 
                    />
                  </div>
                </div>
                <span className="text-[9px] whitespace-nowrap">
                  {c.replace('-', ' ')}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
