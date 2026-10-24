'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
	deleteTemplate,
	saveSignature,
	saveTemplate
} from '@/server/actions/contact/snippets'
import {
	REPLY_MAX_LENGTH,
	SIGNATURE_MAX_LENGTH,
	SNIPPET_TITLE_MAX_LENGTH
} from '@/shared/lib/contact-reply'
import type { ReplySnippets, SnippetResult } from '../inbox/types'

type Props = {
	initial: ReplySnippets
}

type Draft = {
	id: string | null
	title: string
	body: string
}

const FIELD = 'admin-field'

const BTN = 'admin-btn'

const CONFIRM_WINDOW_MS = 4000

export function ReplySnippetsCard({ initial }: Props) {
	const [snippets, setSnippets] = useState(initial)
	const [signature, setSignature] = useState(initial.signature ?? '')
	const [draft, setDraft] = useState<Draft | null>(null)
	const [busy, setBusy] = useState(false)
	const [status, setStatus] = useState('')
	const [confirmingId, setConfirmingId] = useState<string | null>(null)
	const baseId = useId()
	const titleInputRef = useRef<HTMLInputElement>(null)
	const addButtonRef = useRef<HTMLButtonElement>(null)
	const draftOpen = draft !== null
	const wasDraftOpen = useRef(draftOpen)

	useEffect(() => {
		if (draftOpen) titleInputRef.current?.focus()
		else if (wasDraftOpen.current) addButtonRef.current?.focus()
		wasDraftOpen.current = draftOpen
	}, [draftOpen])

	useEffect(() => {
		if (!confirmingId) return
		const timer = setTimeout(() => setConfirmingId(null), CONFIRM_WINDOW_MS)
		return () => clearTimeout(timer)
	}, [confirmingId])

	async function run(task: () => Promise<SnippetResult>, done: string) {
		setBusy(true)
		try {
			const result = await task()
			if (!result.success) {
				setStatus(`Error: ${result.error}`)
				toast.error(result.error)
				return false
			}
			setSnippets(result.snippets)
			setStatus(done)
			toast.success(done)
			return true
		} catch {
			setStatus('Error: could not save. Try again.')
			toast.error('Could not save. Try again.')
			return false
		} finally {
			setBusy(false)
		}
	}

	async function submitDraft() {
		if (!draft) return
		const saved = await run(() => saveTemplate(draft), 'Template saved')
		if (saved) setDraft(null)
	}

	function deleteOrConfirm(id: string) {
		if (confirmingId !== id) {
			setConfirmingId(id)
			return
		}
		setConfirmingId(null)
		void run(() => deleteTemplate(id), 'Template deleted')
	}

	return (
		<section aria-labelledby={`${baseId}-title`} className="admin-panel">
			<div className="admin-panel-header items-center">
				<h2 id={`${baseId}-title`} className="admin-panel-title">
					Reply signature and templates
				</h2>
			</div>

			<div className="space-y-6 px-5 pb-5">
				<p role="status" aria-live="polite" className="sr-only">
					{status}
				</p>
				<div className="space-y-2">
					<div className="space-y-2">
						<label
							htmlFor={`${baseId}-signature`}
							className="admin-label"
						>
							Signature, added to every new reply
						</label>
						<textarea
							id={`${baseId}-signature`}
							aria-describedby={`${baseId}-signature-count`}
							value={signature}
							onChange={event => setSignature(event.target.value)}
							maxLength={SIGNATURE_MAX_LENGTH}
							rows={3}
							placeholder="Remco"
							className={FIELD}
						/>
						<p
							id={`${baseId}-signature-count`}
							className="admin-text-xs admin-text-muted tabular-nums"
						>
							{signature.length} of {SIGNATURE_MAX_LENGTH}{' '}
							characters
						</p>
					</div>
					<button
						type="button"
						disabled={
							busy ||
							signature.trim() === (snippets.signature ?? '')
						}
						onClick={() =>
							void run(
								() => saveSignature(signature),
								'Signature saved'
							)
						}
						className={BTN}
					>
						Save signature
					</button>
				</div>

				<div className="space-y-3">
					<p
						id={`${baseId}-templates-help`}
						className="admin-text-xs admin-text-muted"
					>
						Templates appear as buttons in the reply form. Use{' '}
						{'{name}'} for the visitor's first name.
					</p>

					{snippets.templates.length > 0 && (
						<ul
							aria-label="Reply templates"
							className="divide-y divide-border rounded-md border border-border"
						>
							{snippets.templates.map(template => (
								<li
									key={template.id}
									className="flex items-center justify-between gap-3 px-3 py-2"
								>
									<span className="min-w-0">
										<span className="admin-text-sm block truncate">
											{template.title}
										</span>
										<span className="admin-text-xs admin-text-muted block truncate">
											{template.body}
										</span>
									</span>
									<span className="flex shrink-0 gap-2">
										<button
											type="button"
											disabled={busy}
											onClick={() =>
												setDraft({ ...template })
											}
											aria-label={`Edit template: ${template.title}`}
											className={BTN}
										>
											Edit
										</button>
										<button
											type="button"
											disabled={busy}
											onClick={() =>
												deleteOrConfirm(template.id)
											}
											aria-label={
												confirmingId === template.id
													? `Confirm delete template: ${template.title}`
													: `Delete template: ${template.title}`
											}
											data-variant={
												confirmingId === template.id
													? 'danger'
													: undefined
											}
											data-confirming={
												confirmingId === template.id
											}
											className={BTN}
										>
											{confirmingId === template.id
												? 'Confirm delete'
												: 'Delete'}
										</button>
									</span>
								</li>
							))}
						</ul>
					)}

					{draft ? (
						<div
							role="group"
							aria-label={
								draft.id ? 'Edit template' : 'New template'
							}
							className="space-y-2 rounded-md border border-border p-3"
						>
							<label
								htmlFor={`${baseId}-title-input`}
								className="admin-label"
							>
								Template title
							</label>
							<input
								id={`${baseId}-title-input`}
								ref={titleInputRef}
								value={draft.title}
								onChange={event =>
									setDraft({
										...draft,
										title: event.target.value
									})
								}
								maxLength={SNIPPET_TITLE_MAX_LENGTH}
								placeholder="Title, for example Thanks"
								className={FIELD}
							/>
							<label
								htmlFor={`${baseId}-body-input`}
								className="admin-label"
							>
								Template text
							</label>
							<textarea
								id={`${baseId}-body-input`}
								aria-describedby={`${baseId}-templates-help`}
								value={draft.body}
								onChange={event =>
									setDraft({
										...draft,
										body: event.target.value
									})
								}
								maxLength={REPLY_MAX_LENGTH}
								rows={5}
								placeholder="Hi {name}, thanks for reaching out."
								className={FIELD}
							/>
							<div className="flex gap-2">
								<button
									type="button"
									disabled={busy}
									onClick={() => void submitDraft()}
									className={BTN}
									data-variant="primary"
								>
									Save template
								</button>
								<button
									type="button"
									disabled={busy}
									onClick={() => setDraft(null)}
									className={BTN}
								>
									Cancel
								</button>
							</div>
						</div>
					) : (
						<button
							type="button"
							ref={addButtonRef}
							onClick={() =>
								setDraft({ id: null, title: '', body: '' })
							}
							className={BTN}
						>
							Add template
						</button>
					)}
				</div>
			</div>
		</section>
	)
}
