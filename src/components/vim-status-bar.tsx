'use client'

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { generateRoutes } from '../../tools/dev-menu/utils/generate-routes'
import { Terminal } from 'lucide-react'

const COMMANDS = [
	{ cmd: 'signin', alias: ['login'], desc: 'Authenticate with GitHub' },
	{ cmd: 'signout', alias: ['logout'], desc: 'Sign out' },
	{
		cmd: 'show drafts',
		alias: ['drafts'],
		desc: 'Filter blog list to drafts only'
	},
	{
		cmd: 'show published',
		alias: ['published'],
		desc: 'Filter blog list to published only'
	},
	{
		cmd: 'show all',
		alias: ['all'],
		desc: 'Clear blog post filter'
	},
	{ cmd: 'help', alias: ['?'], desc: 'Show available commands' }
]

interface VimStatusBarProps {
	onCommand?: (command: string) => void
}

export function VimStatusBar({ onCommand }: VimStatusBarProps) {
	const [isVisible, setIsVisible] = useState(false)
	const [input, setInput] = useState('')
	const [selectedIndex, setSelectedIndex] = useState(0)
	const { data: session } = useSession()
	const router = useRouter()
	const inputRef = useRef<HTMLInputElement>(null)

	const currentInput = input.slice(1).toLowerCase()
	const isNavigation = input.startsWith('/')

	// Focus input when visible
	useEffect(() => {
		if (isVisible) {
			// Small timeout to ensure DOM is ready
			const timer = setTimeout(() => {
				inputRef.current?.focus()
			}, 50)
			return () => clearTimeout(timer)
		}
	}, [isVisible])

	const suggestions = useMemo(() => {
		if (!currentInput) {
			if (isNavigation) {
				return generateRoutes()
					.filter(r => !r.isDynamic)
					.map(r => ({
						cmd: r.path,
						alias: [r.label],
						desc: `Go to ${r.label}`
					}))
			}
			return COMMANDS
		}

		if (isNavigation) {
			const routes = generateRoutes().filter(r => !r.isDynamic)
			return routes
				.filter(
					r =>
						r.path.toLowerCase().includes(currentInput) ||
						r.label.toLowerCase().includes(currentInput)
				)
				.map(r => ({
					cmd: r.path,
					alias: [r.label],
					desc: `Go to ${r.label}`
				}))
		}

		return COMMANDS.filter(
			c =>
				c.cmd.startsWith(currentInput) ||
				c.alias.some(a => a.startsWith(currentInput))
		)
	}, [currentInput, isNavigation])

	const safeSelectedIndex =
		suggestions.length > 0
			? Math.max(0, Math.min(selectedIndex, suggestions.length - 1))
			: -1

	const handleCommand = useCallback(
		(cmd: string) => {
			if (cmd.startsWith('/')) {
				setIsVisible(false)
				setInput('')
				setSelectedIndex(0)
				router.push(cmd)
				return
			}

			const normalized = cmd
				.trim()
				.toLowerCase()
				.replace(/^:/, '')
				.replace(/\s+/g, '')

			setIsVisible(false)
			setInput('')
			setSelectedIndex(0)

			if (onCommand) {
				onCommand(normalized)
			}
		},
		[onCommand, router]
	)

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			e.preventDefault()
			setIsVisible(false)
			setInput('')
			setSelectedIndex(0)
			return
		}

		if (e.key === 'Tab' && suggestions.length > 0) {
			e.preventDefault()
			const suggestion = suggestions[safeSelectedIndex]
			if (suggestion) {
				if (isNavigation) {
					setInput(suggestion.cmd)
				} else {
					setInput(':' + suggestion.cmd)
				}
			}
			return
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault()
			setSelectedIndex(prev => Math.max(0, prev - 1))
			return
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setSelectedIndex(prev =>
				Math.min(suggestions.length - 1, prev + 1)
			)
			return
		}

		if (e.key === 'Enter') {
			e.preventDefault()
			if (input.length > 1) {
				handleCommand(input)
			} else if (suggestions.length > 0 && safeSelectedIndex !== -1) {
				const suggestion = suggestions[safeSelectedIndex]
				if (suggestion) {
					if (isNavigation) {
						handleCommand(suggestion.cmd)
					} else {
						handleCommand(':' + suggestion.cmd)
					}
				}
			}
		}
	}

	// Global key listener to toggle bar (desktop)
	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement ||
				(e.target as HTMLElement)?.isContentEditable
			) {
				return
			}

			if ((e.key === ';' || e.key === ':' || e.key === '/') && !isVisible) {
				e.preventDefault()
				setIsVisible(true)
				setInput(e.key === '/' ? '/' : ':')
				setSelectedIndex(0)
			}
		}

		window.addEventListener('keydown', handleGlobalKeyDown)
		return () => window.removeEventListener('keydown', handleGlobalKeyDown)
	}, [isVisible])

	const getStatusText = () => {
		if (session?.user) {
			return `-- AUTHENTICATED -- ${session.user.name || session.user.email}`
		}
		return '-- NORMAL --'
	}

	return (
		<>
			{/* Mobile Trigger Button */}
			<motion.button
				onClick={() => {
					setIsVisible(true)
					setInput(':')
				}}
				className="fixed bottom-4 right-4 z-[9990] w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white shadow-lg md:hidden"
				whileTap={{ scale: 0.95 }}
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
			>
				<Terminal className="w-5 h-5" />
			</motion.button>

			<AnimatePresence>
				{isVisible && (
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 20, opacity: 0 }}
						transition={{ duration: 0.15, ease: 'easeOut' }}
						className="fixed bottom-0 left-0 right-0 z-[9999] bg-black/95 border-t border-zinc-800 backdrop-blur-sm shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
					>
						<div className="container mx-auto px-4 py-2 flex items-center justify-between font-mono text-sm relative">
							<div className="flex items-center gap-2 flex-1 relative">
								<input
									ref={inputRef}
									type="text"
									value={input}
									onChange={e => {
										setInput(e.target.value)
										setSelectedIndex(0)
									}}
									onKeyDown={handleKeyDown}
									className="w-full bg-transparent border-none outline-none text-green-500 font-mono p-0 m-0 focus:ring-0 placeholder-transparent"
									autoFocus
									autoCapitalize="none"
									autoComplete="off"
									autoCorrect="off"
									spellCheck="false"
								/>
								{/* Blinking cursor visual if needed, though native cursor is usually fine. 
                                    Let's rely on native cursor for now for better mobile XP */}
							</div>

							<div className="text-zinc-500 text-xs whitespace-nowrap ml-4">
								{getStatusText()}
							</div>
						</div>
						{suggestions.length > 0 && (
							<div className="container mx-auto px-4 pb-2">
								<div className="text-xs text-zinc-600 font-mono flex flex-col gap-1 max-h-[30vh] overflow-y-auto">
									{suggestions.map((s, index) => (
										<div
											key={s.cmd}
											className={`flex gap-2 p-1 ${index === safeSelectedIndex ? 'bg-zinc-800 text-green-400' : ''}`}
											onClick={() => {
												if (isNavigation) {
													handleCommand(s.cmd)
												} else {
													handleCommand(':' + s.cmd)
												}
											}}
										>
											<span className="w-20 flex-shrink-0">
												{isNavigation
													? s.cmd
													: `:${s.cmd}`}
											</span>
											<span className="text-zinc-500">
												{s.desc}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
						{suggestions.length === 0 && (
							<div className="container mx-auto px-4 pb-2">
								<div className="text-xs text-zinc-600 font-mono flex flex-wrap gap-4">
									<span>:signin - Authenticate</span>
									<span>:signout - Sign out</span>
									<span>ESC - Close</span>
								</div>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</>
	)
}
