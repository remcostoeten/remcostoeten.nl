'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { getToolBySlug } from '../constants/tools'
import {
	LOCATION_RECEIVERS,
	stageLocations,
	type TLocationPoint,
	type TLocationReceiver
} from '../utils/location-handoff'

type Props = {
	from: TLocationReceiver | 'my-location'
	points: TLocationPoint[] | (() => TLocationPoint[])
	label?: string
	size?: 'sm' | 'default'
	disabled?: boolean
	className?: string
}

function nameOf(slug: TLocationReceiver): string {
	return getToolBySlug(slug)?.name ?? slug
}

/**
 * Hands the given points to another geo tool and navigates there. Points may be
 * a thunk so callers can resolve a selection lazily, at click time.
 */
export function SendToTool({
	from,
	points,
	label = 'Send to',
	size = 'sm',
	disabled,
	className
}: Props) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const rootRef = useRef<HTMLDivElement>(null)

	const targets = useMemo(
		() => LOCATION_RECEIVERS.filter(slug => slug !== from),
		[from]
	)

	useEffect(() => {
		if (!open) return
		function onPointerDown(event: MouseEvent) {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
		}
		window.addEventListener('mousedown', onPointerDown)
		return () => window.removeEventListener('mousedown', onPointerDown)
	}, [open])

	function send(target: TLocationReceiver) {
		const resolved = typeof points === 'function' ? points() : points
		if (resolved.length === 0) {
			toast.error('Nothing to send')
			return
		}

		stageLocations(target, resolved)
		setOpen(false)
		toast.success(
			`Sending ${resolved.length} ${resolved.length === 1 ? 'location' : 'locations'} to ${nameOf(target)}`
		)
		router.push(`/tools/${target}`)
	}

	if (targets.length === 1) {
		const target = targets[0]
		return (
			<Button
				type="button"
				variant="outline"
				size={size}
				className={cn('gap-1.5', className)}
				onClick={() => send(target)}
				disabled={disabled}
				title={`Send to the ${nameOf(target)} tool`}
			>
				<Send aria-hidden className="size-3.5" />
				{label} {nameOf(target)}
			</Button>
		)
	}

	return (
		<div ref={rootRef} className={cn('relative shrink-0', className)}>
			<Button
				type="button"
				variant="outline"
				size={size}
				className="gap-1.5"
				onClick={() => setOpen(value => !value)}
				disabled={disabled}
				aria-expanded={open}
				aria-haspopup="menu"
			>
				<Send aria-hidden className="size-3.5" />
				{label}
				<ChevronDown aria-hidden className="size-3.5 opacity-60" />
			</Button>

			{open && (
				<div
					role="menu"
					className="absolute right-0 top-full z-[1000] mt-1 w-56 border border-border bg-popover p-1 shadow-lg"
				>
					{targets.map(target => {
						const tool = getToolBySlug(target)
						return (
							<button
								key={target}
								type="button"
								role="menuitem"
								onClick={() => send(target)}
								className="flex w-full flex-col gap-0.5 rounded-sm px-2 py-1.5 text-left hover:bg-accent/40"
							>
								<span className="text-sm">{nameOf(target)}</span>
								{tool && (
									<span className="line-clamp-1 text-[11px] text-muted-foreground">
										{tool.description}
									</span>
								)}
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}
