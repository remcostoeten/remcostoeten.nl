'use client'

import { lazy, Suspense, useState } from 'react'

const ContactPopover = lazy(() =>
	import('./contact-popover').then(module => ({
		default: module.ContactPopover
	}))
)

function Trigger({
	onLoad,
	onOpen
}: {
	onLoad: () => void
	onOpen: () => void
}) {
	return (
		<div className="relative inline-block text-left">
			<button
				type="button"
				aria-haspopup="dialog"
				aria-expanded={false}
				onPointerEnter={onLoad}
				onFocus={onLoad}
				onClick={onOpen}
				className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
			>
				Contact
			</button>
		</div>
	)
}

/**
 * Defers loading the popover (and its motion dependency) until the user
 * hovers, focuses, or clicks the trigger, keeping it out of the initial
 * bundle of every page that renders the footer.
 */
export function LazyContactPopover() {
	const [load, setLoad] = useState(false)
	const [open, setOpen] = useState(false)

	function handleLoad() {
		setLoad(true)
	}

	function handleOpen() {
		setLoad(true)
		setOpen(true)
	}

	if (!load) return <Trigger onLoad={handleLoad} onOpen={handleOpen} />

	return (
		<Suspense
			fallback={<Trigger onLoad={handleLoad} onOpen={handleOpen} />}
		>
			<ContactPopover initialOpen={open} />
		</Suspense>
	)
}
