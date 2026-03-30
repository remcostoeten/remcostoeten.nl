'use client'

import { useId, useState, useTransition } from 'react'
import type { ProjectSettings } from '../../../server/db/project-schema'
import { updateSettings } from '../server/mutations'

type Props = {
	settings: ProjectSettings
	onUpdate: (settings: ProjectSettings) => void
}

export function SettingsPanel({ settings, onUpdate }: Props) {
	const [showN, setShowN] = useState(settings.showN)
	const [isPending, startTransition] = useTransition()
	const hasChanges = showN !== settings.showN
	const inputId = useId()

	function handleSave() {
		startTransition(async () => {
			const result = await updateSettings(showN)
			if (result.success) {
				onUpdate({ ...settings, showN })
			}
		})
	}

	return (
		<section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 md:p-5">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-1.5">
					<h2 className="text-base font-medium text-zinc-100">
						Display settings
					</h2>
					<p className="text-sm leading-6 text-zinc-500">
						Control how many projects remain visible before the
						public list collapses.
					</p>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
					<div className="space-y-1.5">
						<label
							htmlFor={inputId}
							className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500"
						>
							Show when collapsed
						</label>
						<input
							id={inputId}
							type="number"
							min={1}
							max={50}
							value={showN}
							onChange={event =>
								setShowN(Number(event.target.value))
							}
							className="h-11 w-28 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700/60"
						/>
					</div>

					{hasChanges && (
						<button
							onClick={handleSave}
							disabled={isPending}
							className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-100 px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isPending ? 'Saving...' : 'Save settings'}
						</button>
					)}
				</div>
			</div>
		</section>
	)
}
