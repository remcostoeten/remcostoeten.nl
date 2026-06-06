'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

type Props = {
	isExpanded: boolean
	onToggle: () => void
}

export function SystemInfoSection({
	isExpanded,
	onToggle
}: Props) {
	return (
		<>
			<div className="px-2 pt-1">
				<button
					onClick={onToggle}
					className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors group"
				>
					<span className="uppercase tracking-wider">system</span>
					<ChevronDown
						className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
					/>
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
							<div className="flex justify-between border-b border-border pb-1">
								<span className="text-muted-foreground uppercase">
									env
								</span>
								<span className="text-primary">
									{process.env.NODE_ENV}
								</span>
							</div>
							<div className="flex justify-between border-b border-border pb-1">
								<span className="text-muted-foreground uppercase">
									admin
								</span>
								<span className="text-muted-foreground truncate max-w-[120px]">
									{process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
										'n/a'}
								</span>
							</div>
							<div className="space-y-0.5">
								<span className="text-muted-foreground uppercase block">
									ua
								</span>
								<span className="block text-[9px] text-muted-foreground leading-relaxed break-all">
									{typeof window !== 'undefined'
										? navigator.userAgent.slice(0, 80) +
										'...'
										: 'n/a'}
								</span>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	)
}
