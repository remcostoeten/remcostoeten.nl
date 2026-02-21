'use client'

import { useShortcut } from '@remcostoeten/use-shortcut'
import { useEffect, useMemo, useRef, useState } from 'react'

type Snippet = {
	label: string
	code: string
}

type LogEntry = {
	id: number
	text: string
}

const snippets: Snippet[] = [
	{
		label: 'Save (cross-platform)',
		code: "$.mod.key('s').on(saveDocument)"
	},
	{
		label: 'Search with typing guard',
		code: "$.mod.key('k').except('typing').on(openSearch)"
	},
	{
		label: 'Help overlay',
		code: "$.shift.key('/').on(toggleHelp)"
	},
	{
		label: 'Pause shortcuts',
		code: "$.mod.key('p').on(togglePause)"
	}
]

export function UseShortcutSyntaxLab() {
	const $ = useShortcut({ eventType: 'keydown' })
	const [saveCount, setSaveCount] = useState(0)
	const [searchCount, setSearchCount] = useState(0)
	const [helpOpen, setHelpOpen] = useState(false)
	const [paused, setPaused] = useState(false)
	const [log, setLog] = useState<LogEntry[]>([])
	const inputRef = useRef<HTMLInputElement>(null)
	const nextId = useRef(1)

	const platformLabel = useMemo(() => {
		if (typeof navigator === 'undefined') return 'cmd/ctrl'
		return /mac/i.test(navigator.platform) ? 'cmd' : 'ctrl'
	}, [])

	const addLog = (text: string) => {
		setLog(prev => [{ id: nextId.current++, text }, ...prev].slice(0, 7))
	}

	useEffect(() => {
		const save = $.mod.key('s').on(
			() => {
				setSaveCount(v => v + 1)
				addLog('save fired')
			},
			{ disabled: paused, preventDefault: true }
		)

		const search = $.mod.key('k').except('typing').on(
			() => {
				setSearchCount(v => v + 1)
				inputRef.current?.focus()
				addLog("search fired (except('typing') active)")
			},
			{ disabled: paused, preventDefault: true }
		)

		const help = $.shift.key('/').on(
			() => {
				setHelpOpen(v => !v)
				addLog('help toggled')
			},
			{ disabled: paused, preventDefault: true }
		)

		const pause = $.mod.key('p').on(
			() => {
				setPaused(v => !v)
				addLog('pause toggled')
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
		<section className="my-6 rounded-xl border border-border/60 bg-muted/15 p-4 sm:p-5">
			<div className="mb-4">
				<p className="text-sm text-muted-foreground">
					Try the syntax and test the shortcuts in one place.
				</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="space-y-2">
					{snippets.map(item => (
						<div
							key={item.label}
							className="rounded-lg border border-border/60 bg-background/80 p-3"
						>
							<div className="mb-2 text-xs font-medium text-muted-foreground">
								{item.label}
							</div>
							<pre className="overflow-x-auto rounded-md border border-border/50 bg-muted/35 p-2 text-xs">
								<code>{item.code}</code>
							</pre>
						</div>
					))}
				</div>

				<div className="rounded-lg border border-border/60 bg-background/70 p-3">
					<div className="mb-3 flex flex-wrap gap-2 text-xs">
						<span className="rounded-md border border-border px-2 py-1">
							{platformLabel}+s
						</span>
						<span className="rounded-md border border-border px-2 py-1">
							{platformLabel}+k
						</span>
						<span className="rounded-md border border-border px-2 py-1">shift+/</span>
						<span className="rounded-md border border-border px-2 py-1">
							{platformLabel}+p
						</span>
					</div>

					<div className="grid grid-cols-2 gap-2 text-sm">
						<div className="rounded-md border border-border/60 p-2">
							Saves: <strong>{saveCount}</strong>
						</div>
						<div className="rounded-md border border-border/60 p-2">
							Searches: <strong>{searchCount}</strong>
						</div>
					</div>

					<label className="mt-3 block text-sm">
						Type here (`{platformLabel}+k` is blocked via `.except('typing')`)
						<input
							ref={inputRef}
							placeholder="Try typing, then hit shortcuts"
							className="mt-2 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
						/>
					</label>

					<div className="mt-3 text-sm">
						Status:{' '}
						<strong>{paused ? 'paused (except mod+p)' : 'active shortcuts'}</strong>
					</div>

					{helpOpen ? (
						<div className="mt-3 rounded-md border border-border/60 bg-muted/25 p-2 text-sm">
							Help is open. Press <code>shift+/</code> again to close.
						</div>
					) : null}

					<div className="mt-3 space-y-1 text-xs text-muted-foreground">
						{log.length === 0 ? <div>No events yet.</div> : null}
						{log.map(item => (
							<div key={item.id}>{item.text}</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
