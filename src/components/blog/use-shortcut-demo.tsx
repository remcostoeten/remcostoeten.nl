'use client'

import { useShortcut } from '@remcostoeten/use-shortcut'
import { useEffect, useRef, useState } from 'react'

type LogEntry = {
	id: number
	text: string
}

export function UseShortcutDemo() {
	const $ = useShortcut({ eventType: 'keydown' })
	const [saveCount, setSaveCount] = useState(0)
	const [searchCount, setSearchCount] = useState(0)
	const [helpOpen, setHelpOpen] = useState(false)
	const [paused, setPaused] = useState(false)
	const [log, setLog] = useState<LogEntry[]>([])
	const searchRef = useRef<HTMLInputElement>(null)
	const nextId = useRef(1)

	const addLog = (text: string) => {
		setLog(prev => [{ id: nextId.current++, text }, ...prev].slice(0, 6))
	}

	useEffect(() => {
		const save = $.mod.key('s').on(
			() => {
				setSaveCount(prev => prev + 1)
				addLog('Save action fired')
			},
			{ disabled: paused, preventDefault: true }
		)

		const search = $.mod.key('k').except('typing').on(
			() => {
				setSearchCount(prev => prev + 1)
				searchRef.current?.focus()
				addLog('Search focus action fired')
			},
			{ disabled: paused, preventDefault: true }
		)

		const help = $.shift.key('/').on(
			() => {
				setHelpOpen(prev => !prev)
				addLog('Help toggle action fired')
			},
			{ disabled: paused, preventDefault: true }
		)

		const pause = $.mod.key('p').on(
			() => {
				setPaused(prev => !prev)
			},
			{ preventDefault: true }
		)

		return () => {
			save.unbind()
			search.unbind()
			help.unbind()
			pause.unbind()
		}
	}, [$, paused])

	return (
		<div className="my-6 rounded-xl border border-border/60 bg-muted/20 p-4">
			<p className="text-sm text-muted-foreground">
				Live demo. Try shortcuts while this page is focused.
			</p>

			<div className="mt-3 flex flex-wrap gap-2 text-xs">
				<span className="rounded-md border border-border px-2 py-1">mod+s</span>
				<span className="rounded-md border border-border px-2 py-1">mod+k</span>
				<span className="rounded-md border border-border px-2 py-1">
					shift+/
				</span>
				<span className="rounded-md border border-border px-2 py-1">mod+p</span>
			</div>

			<div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
				<div className="rounded-lg border border-border/60 bg-background/70 p-3">
					Saves triggered: <strong>{saveCount}</strong>
				</div>
				<div className="rounded-lg border border-border/60 bg-background/70 p-3">
					Search focus triggered: <strong>{searchCount}</strong>
				</div>
			</div>

			<label className="mt-4 block text-sm">
				Test input (`mod+k` is blocked here via `.except('typing')`)
				<input
					ref={searchRef}
					placeholder="Type here and press mod+k"
					className="mt-2 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
				/>
			</label>

			{helpOpen ? (
				<div className="mt-4 rounded-lg border border-border/60 bg-background/80 p-3 text-sm">
					Help open. Press <code>shift+/</code> again to close.
				</div>
			) : null}

			<div className="mt-4 text-sm">
				Status:{' '}
				<strong>{paused ? 'Paused (except mod+p)' : 'Active shortcuts'}</strong>
			</div>

			<div className="mt-3 space-y-1 text-xs text-muted-foreground">
				{log.length === 0 ? <div>No actions yet.</div> : null}
				{log.map(item => (
					<div key={item.id}>{item.text}</div>
				))}
			</div>
		</div>
	)
}
