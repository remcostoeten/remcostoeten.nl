'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal, X, Settings, Home } from 'lucide-react'
import Link from 'next/link'
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

export function DevWidget({
	session,
	onSignOut,
	showAuth = true,
	showRoutes = true,
	showSystemInfo = true,
	showSettings = true,
	customTitle,
	isAdmin = false
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
			case 'top-left':
				return {
					left: offset,
					top: offset,
					right: undefined,
					bottom: undefined
				}
			case 'top-right':
				return {
					right: offset,
					top: offset,
					left: undefined,
					bottom: undefined
				}
			case 'bottom-left':
				return {
					left: offset,
					bottom: offset,
					right: undefined,
					top: undefined
				}
			case 'bottom-right':
				return {
					right: offset,
					bottom: offset,
					left: undefined,
					top: undefined
				}
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
				className="fixed z-50 transition-all duration-200"
				style={currentPos}
			>
				<button
					onClick={() => setIsMinimized(false)}
					className="bg-[hsl(0,0%,7%)] text-[hsl(167.8,53.25%,54.71%)] p-2 shadow-lg hover:bg-[hsl(0,0%,12%)] transition-colors border border-[hsl(0,0%,18%)]"
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
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
				className="fixed z-50 bg-[hsl(0,0%,7%)] text-[hsl(0,0%,85%)] shadow-2xl border border-[hsl(0,0%,18%)] min-w-[280px] max-h-[85vh] overflow-hidden flex flex-col font-mono"
				style={currentPos}
			>
				<div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(0,0%,18%)] bg-[hsl(0,0%,8.6%)]">
					<div className="flex items-center gap-2">
						<Terminal className="w-3.5 h-3.5 text-[hsl(167.8,53.25%,54.71%)]" />
						<span className="text-[11px] font-medium tracking-tight uppercase">
							{customTitle || (isDev ? 'dev' : 'admin')}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<Link
							href="/"
							className="text-muted-foreground hover:text-foreground transition-colors p-1"
							title="Go Home"
						>
							<Home className="w-3.5 h-3.5" />
						</Link>
						{showSettings && (
							<button
								onClick={() =>
									setIsSettingsOpen(!isSettingsOpen)
								}
								className="text-[hsl(0,0%,55%)] hover:text-[hsl(0,0%,85%)] transition-colors p-1"
								title="Settings"
							>
								<Settings className="w-3.5 h-3.5" />
							</button>
						)}
						<button
							onClick={() => setIsMinimized(true)}
							className="text-[hsl(0,0%,55%)] hover:text-[hsl(0,0%,85%)] transition-colors p-1"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto scrollbar-hide">
					{showAuth && session && (
						<AuthSection session={session} onSignOut={onSignOut} />
					)}

					{showRoutes && <RoutesSection pathname={pathname} />}

					{showSystemInfo && (
						<SystemInfoSection
							isExpanded={isExpanded}
							onToggle={() => setIsExpanded(!isExpanded)}
						/>
					)}
				</div>

				<div className="px-3 py-1.5 border-t border-[hsl(0,0%,18%)] bg-[hsl(0,0%,8.6%)]">
					<div className="flex items-center justify-between text-[9px] text-[hsl(0,0%,55%)]">
						<span>
							press{' '}
							<kbd className="px-1 py-0.5 bg-[hsl(0,0%,18%)] text-[hsl(0,0%,70%)]">
								`
							</kbd>{' '}
							to toggle
						</span>
					</div>
				</div>
			</motion.div>
		</>
	)
}
