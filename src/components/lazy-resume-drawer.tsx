'use client'

import { lazy, Suspense, useState } from 'react'
import { FileUser } from 'lucide-react'

const ResumeDrawer = lazy(() =>
	import('./resume-drawer').then(module => ({
		default: module.ResumeDrawer
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
		<button
			type="button"
			onPointerEnter={onLoad}
			onFocus={onLoad}
			onClick={onOpen}
			className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
		>
			<FileUser className="w-4 h-4" />
			<span>Resume</span>
		</button>
	)
}

/**
 * Defers loading the drawer (and its vaul dependency) until the user hovers,
 * focuses, or clicks the trigger, keeping it out of the initial bundle of
 * every page that renders the footer.
 */
export function LazyResumeDrawer() {
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
			<ResumeDrawer initialOpen={open} />
		</Suspense>
	)
}
