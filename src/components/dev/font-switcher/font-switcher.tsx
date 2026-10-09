'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Type, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { FontPair } from './types'

const STORAGE_KEY = 'dev-font-pair'
const HOLD_MS = 3000

type Props = {
	pairs: FontPair[]
	defaultId: string
}

function applyPair(pair: FontPair) {
	const root = document.documentElement.style
	root.setProperty('--font-sans-active', `var(${pair.sans.variable})`)
	root.setProperty('--font-mono-active', `var(${pair.mono.variable})`)
}

function readStoredId() {
	try {
		return localStorage.getItem(STORAGE_KEY)
	} catch {
		return null
	}
}

function storeId(id: string) {
	try {
		localStorage.setItem(STORAGE_KEY, id)
	} catch {}
}

export function FontSwitcher({ pairs, defaultId }: Props) {
	const [activeId, setActiveId] = useState(defaultId)
	const [open, setOpen] = useState(false)
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | null = null

		function cancel() {
			if (timer) clearTimeout(timer)
			timer = null
		}

		function onKeyDown(event: KeyboardEvent) {
			if (event.key !== 'Escape' || event.repeat || timer) return
			timer = setTimeout(() => {
				timer = null
				setVisible(prev => !prev)
			}, HOLD_MS)
		}

		function onKeyUp(event: KeyboardEvent) {
			if (event.key === 'Escape') cancel()
		}

		window.addEventListener('keydown', onKeyDown)
		window.addEventListener('keyup', onKeyUp)
		window.addEventListener('blur', cancel)
		return () => {
			cancel()
			window.removeEventListener('keydown', onKeyDown)
			window.removeEventListener('keyup', onKeyUp)
			window.removeEventListener('blur', cancel)
		}
	}, [])

	useEffect(() => {
		const stored = readStoredId()
		if (stored && pairs.some(pair => pair.id === stored)) {
			setActiveId(stored)
		}
	}, [pairs])

	useEffect(() => {
		const pair = pairs.find(item => item.id === activeId)
		if (!pair) return
		applyPair(pair)
		storeId(pair.id)
	}, [activeId, pairs])

	const activeIndex = Math.max(
		0,
		pairs.findIndex(pair => pair.id === activeId)
	)
	const active = pairs[activeIndex]

	function step(direction: 1 | -1) {
		const next = (activeIndex + direction + pairs.length) % pairs.length
		setActiveId(pairs[next].id)
	}

	if (!visible) return null

	return (
		<div className="fixed bottom-4 right-4 z-[9999] font-sans text-foreground">
			{open ? (
				<div className="w-72 rounded-md border border-border bg-background/95 shadow-lg backdrop-blur">
					<div className="flex items-center justify-between border-b border-border px-3 py-2">
						<span className="text-xs font-medium text-muted-foreground">
							Font pairing {activeIndex + 1}/{pairs.length}
						</span>
						<div className="flex items-center gap-1">
							<button
								type="button"
								aria-label="Previous pairing"
								onClick={() => step(-1)}
								className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
							>
								<ChevronLeft className="size-3.5" />
							</button>
							<button
								type="button"
								aria-label="Next pairing"
								onClick={() => step(1)}
								className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
							>
								<ChevronRight className="size-3.5" />
							</button>
							<button
								type="button"
								aria-label="Close font switcher"
								onClick={() => setOpen(false)}
								className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
							>
								<X className="size-3.5" />
							</button>
						</div>
					</div>
					<ul className="max-h-80 overflow-y-auto p-1">
						{pairs.map(pair => (
							<li key={pair.id}>
								<button
									type="button"
									onClick={() => setActiveId(pair.id)}
									aria-pressed={pair.id === activeId}
									className={cn(
										'flex w-full flex-col items-start gap-0.5 rounded px-2 py-1.5 text-left hover:bg-muted',
										pair.id === activeId && 'bg-muted'
									)}
								>
									<span
										className="text-sm"
										style={{
											fontFamily: `var(${pair.sans.variable})`
										}}
									>
										{pair.sans.name}
									</span>
									<span
										className="text-xs text-muted-foreground"
										style={{
											fontFamily: `var(${pair.mono.variable})`
										}}
									>
										{pair.mono.name}
									</span>
								</button>
							</li>
						))}
					</ul>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="flex items-center gap-2 rounded-md border border-border bg-background/95 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur hover:text-foreground"
				>
					<Type className="size-3.5" />
					{active.sans.name} / {active.mono.name}
				</button>
			)}
		</div>
	)
}
