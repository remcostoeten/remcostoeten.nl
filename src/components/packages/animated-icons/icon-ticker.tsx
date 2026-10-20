'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import {
	installIconHover,
	playIcon
} from '@/components/animated-icons/icon-frame'
import { AnimatedBellIcon } from '@/components/animated-icons/icons/bell'
import { AnimatedCalendarIcon } from '@/components/animated-icons/icons/calendar'
import { AnimatedDownloadIcon } from '@/components/animated-icons/icons/download'
import { AnimatedFlagIcon } from '@/components/animated-icons/icons/flag'
import { AnimatedLockIcon } from '@/components/animated-icons/icons/lock'
import { AnimatedSearchIcon } from '@/components/animated-icons/icons/search'
import { AnimatedSettingsIcon } from '@/components/animated-icons/icons/settings'
import { AnimatedTrashIcon } from '@/components/animated-icons/icons/trash'

const tickInterval = 900

const tickerEntries = [
	{ id: 'search', name: 'Search', Icon: AnimatedSearchIcon },
	{ id: 'bell', name: 'Bell', Icon: AnimatedBellIcon },
	{ id: 'trash', name: 'Trash', Icon: AnimatedTrashIcon },
	{ id: 'settings', name: 'Settings', Icon: AnimatedSettingsIcon },
	{ id: 'calendar', name: 'Calendar', Icon: AnimatedCalendarIcon },
	{ id: 'flag', name: 'Flag', Icon: AnimatedFlagIcon },
	{ id: 'lock', name: 'Lock', Icon: AnimatedLockIcon },
	{ id: 'download', name: 'Download', Icon: AnimatedDownloadIcon }
] as const

type Props = {
	href: string
}

export function IconTicker({ href }: Props) {
	const listRef = useRef<HTMLUListElement>(null)

	useEffect(() => installIconHover(), [])

	useEffect(() => {
		const list = listRef.current
		if (!list) return
		let index = 0
		let interval: ReturnType<typeof setInterval> | undefined

		function tick() {
			const icons =
				list?.querySelectorAll<SVGSVGElement>('.animated-icon')
			if (!icons || icons.length === 0) return
			playIcon(icons[index % icons.length])
			index += 1
		}

		const observer = new IntersectionObserver(([entry]) => {
			clearInterval(interval)
			if (entry.isIntersecting) interval = setInterval(tick, tickInterval)
		})
		observer.observe(list)
		return () => {
			observer.disconnect()
			clearInterval(interval)
		}
	}, [])

	return (
		<ul
			ref={listRef}
			className="grid grid-cols-4 border-t border-l border-border/70 bg-background"
		>
			{tickerEntries.map(entry => (
				<li
					key={entry.id}
					className="border-r border-b border-border/70"
				>
					<Link
						href={
							`${href}?component=${entry.id}#component` as Route
						}
						data-icon-trigger=""
						aria-label={`${entry.name} icon`}
						className="flex aspect-square items-center justify-center text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted/30 hover:text-foreground focus-visible:outline-none focus-visible:bg-muted/40 focus-visible:text-foreground"
					>
						<entry.Icon size={22} />
					</Link>
				</li>
			))}
		</ul>
	)
}
