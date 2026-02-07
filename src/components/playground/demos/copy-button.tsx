'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function CopyButtonDemo() {
	const [copied, setCopied] = useState(false)

	function handleCopy() {
		setCopied(true)
		setTimeout(function resetCopied() {
			setCopied(false)
		}, 2000)
	}

	return (
		<div className="flex items-center justify-center p-6">
			<button
				onClick={handleCopy}
				className={cn(
					'flex items-center gap-2 px-4 py-2 text-sm font-medium',
					'border border-border/50 bg-muted/30',
					'hover:bg-muted/50 transition-all duration-200',
					copied && 'border-emerald-500/50 text-emerald-400'
				)}
			>
				<AnimatePresence mode="wait">
					{copied ? (
						<motion.span
							key="check"
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0 }}
							className="flex items-center gap-2"
						>
							<Check className="w-4 h-4" />
							Copied!
						</motion.span>
					) : (
						<motion.span
							key="copy"
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0 }}
							className="flex items-center gap-2"
						>
							<Copy className="w-4 h-4" />
							Copy code
						</motion.span>
					)}
				</AnimatePresence>
			</button>
		</div>
	)
}
