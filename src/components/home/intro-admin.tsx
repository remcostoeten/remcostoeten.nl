'use client'

import { useState, useTransition } from 'react'
import { saveIntro } from './intro-actions'
import type { IntroContent } from './intro-queries'

type Props = { initialValue: IntroContent }

export function IntroAdmin({ initialValue }: Props) {
	const [value, setValue] = useState(initialValue)
	const [message, setMessage] = useState('')
	const [pending, startTransition] = useTransition()

	function update(key: keyof IntroContent, next: string) {
		setValue(prev => ({ ...prev, [key]: next }))
	}

	function handleSave() {
		startTransition(async () => {
			const result = await saveIntro(value)
			setMessage(result.success ? 'Intro saved.' : result.error)
		})
	}

	return (
		<section className="admin-panel max-w-3xl space-y-5 p-5 md:p-6">
			<label className="block space-y-1.5">
				<span className="text-[12px] font-medium text-muted-foreground">
					Name
				</span>
				<input
					className="admin-field"
					value={value.name}
					onChange={event => update('name', event.target.value)}
				/>
			</label>
			<label className="block space-y-1.5">
				<span className="text-[12px] font-medium text-muted-foreground">
					Role
				</span>
				<input
					className="admin-field"
					value={value.role}
					onChange={event => update('role', event.target.value)}
				/>
			</label>
			<label className="block space-y-1.5">
				<span className="text-[12px] font-medium text-muted-foreground">
					Bio
				</span>
				<span className="block text-[11px] text-muted-foreground/70">
					Use *italic* and **bold**.
				</span>
				<textarea
					className="admin-field min-h-40 font-mono text-xs leading-relaxed"
					value={value.bio}
					onChange={event => update('bio', event.target.value)}
				/>
			</label>
			<div className="flex items-center gap-4 border-t border-border pt-5">
				<button
					type="button"
					disabled={pending}
					onClick={handleSave}
					className="admin-btn"
					data-variant="primary"
				>
					{pending ? 'Saving…' : 'Save intro'}
				</button>
				<p
					aria-live="polite"
					className="text-[13px] text-muted-foreground"
				>
					{message}
				</p>
			</div>
		</section>
	)
}
