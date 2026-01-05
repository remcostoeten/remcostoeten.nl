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
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="fixed z-[60] bg-zinc-900/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl p-3 min-w-[200px]"
          style={{
            right: currentPos.right !== undefined ? (Number(currentPos.right) + 16) : undefined,
            left: currentPos.left !== undefined ? (Number(currentPos.left) + 16) : undefined,
            top: currentPos.top !== undefined ? (Number(currentPos.top) + 60) : undefined,
            bottom: currentPos.bottom !== undefined ? (Number(currentPos.bottom) + 60) : undefined,
          }}
        >
          <div className="flex items-center gap-2 mb-3 px-1 text-zinc-400">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Widget Position</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as Corner[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  onCornerChange(c)
                  onClose()
                }}
                className={`relative group flex flex-col items-center gap-2 p-2 rounded-lg border transition-all duration-200 ${corner === c
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)]'
                  : 'bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10 hover:bg-white/10'
                  }`}
              >
                <div className="w-full aspect-video bg-zinc-950/50 rounded flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-1 rounded-sm border border-white/5">
                    <div className={`absolute w-3 h-2 rounded-[1px] ${corner === c ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-white/10'
                      }`}
                      style={{
                        top: c.startsWith('top') ? '2px' : 'auto',
                        bottom: c.startsWith('bottom') ? '2px' : 'auto',
                        left: c.endsWith('left') ? '2px' : 'auto',
                        right: c.endsWith('right') ? '2px' : 'auto',
                      }} />
                  </div>
                </div>
                <span className="text-[10px] whitespace-nowrap capitalize font-medium">
                  {c.replace('-', ' ')}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1">
              <span>Shortcut</span>
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/40">~</kbd>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
