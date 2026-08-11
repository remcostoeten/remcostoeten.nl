'use client'

import { Notifier, notify } from '@remcostoeten/notifier'
import { type FormEvent, useState } from 'react'

const SAVE_DELAY_MS = 900

function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export function NotifierDemo() {
	const [isSaving, setIsSaving] = useState(false)

	async function saveProfile(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (isSaving) return

		setIsSaving(true)
		const notice = notify.loading('Saving profile…')

		await wait(SAVE_DELAY_MS)
		notice.success('Profile saved')
		setIsSaving(false)
	}

	return (
		<div className="border border-border bg-muted/20 p-4">
			<p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
				Live demo
			</p>
			<p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
				Save the form to see one notification move from loading to
				success.
			</p>

			<form
				onSubmit={saveProfile}
				className="mt-4 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end"
			>
				<label className="min-w-0 flex-1 text-xs font-medium text-foreground">
					Display name
					<input
						name="displayName"
						defaultValue="Remco Stoeten"
						className="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm font-normal shadow-sm outline-none transition-colors focus:border-foreground/30 focus:ring-2 focus:ring-ring"
					/>
				</label>
				<button
					type="submit"
					disabled={isSaving}
					className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-medium shadow-sm transition-[background-color,transform] duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:cursor-wait disabled:opacity-60"
				>
					{isSaving ? 'Saving…' : 'Save changes'}
				</button>
			</form>

			<Notifier
				position="bottom-right"
				colorMode="auto"
				radius="rounded"
				maxVisible={3}
				border={{ enabled: true }}
			/>
		</div>
	)
}
