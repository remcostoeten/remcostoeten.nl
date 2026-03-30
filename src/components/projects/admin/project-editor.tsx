'use client'

import type React from 'react'

import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { ExternalLink, Info, Save, Trash2, X } from 'lucide-react'
import type { Project } from '../../../server/db/project-schema'
import { deleteProject, updateProject } from '../server/mutations'

type Props = {
	project: Project
	onUpdate: (project: Project) => void
	onDelete: () => void
	onClose: () => void
}

export function ProjectEditor({ project, onUpdate, onDelete, onClose }: Props) {
	const [form, setForm] = useState(project)
	const [labelsInput, setLabelsInput] = useState(project.labels.join(', '))
	const [isPending, startTransition] = useTransition()
	const [hasChanges, setHasChanges] = useState(false)
	const [statusMessage, setStatusMessage] = useState<string | null>(null)
	const titleId = useId()
	const descriptionId = useId()
	const titleFieldId = useId()
	const descFieldId = useId()
	const githubFieldId = useId()
	const demoFieldId = useId()
	const demoBoxFieldId = useId()
	const labelsFieldId = useId()
	const titleInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		setForm(project)
		setLabelsInput(project.labels.join(', '))
		setHasChanges(false)
		setStatusMessage(null)
	}, [project])

	useEffect(() => {
		titleInputRef.current?.focus()
	}, [project.id])

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [onClose])

	function handleChange<K extends keyof Project>(key: K, value: Project[K]) {
		setForm({ ...form, [key]: value })
		setHasChanges(true)
		setStatusMessage(null)
	}

	function handleSave() {
		startTransition(async () => {
			const labels = labelsInput
				.split(',')
				.map(label => label.trim())
				.filter(Boolean)
			const result = await updateProject(project.id, { ...form, labels })

			if (result.success) {
				onUpdate({ ...form, labels })
				setHasChanges(false)
				setStatusMessage('Changes saved.')
			} else {
				setStatusMessage(result.error)
			}
		})
	}

	function handleDelete() {
		if (!confirm(`Delete "${project.title}"? This cannot be undone.`))
			return

		startTransition(async () => {
			const result = await deleteProject(project.id)
			if (result.success) {
				onDelete()
			} else {
				setStatusMessage(result.error)
			}
		})
	}

	return (
		<div className="fixed inset-0 z-50 flex h-full w-full flex-col justify-end bg-black/80 backdrop-blur-sm lg:static lg:z-auto lg:block lg:h-fit lg:w-auto lg:bg-transparent lg:backdrop-blur-none">
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				className="flex h-[92vh] w-full flex-col rounded-t-2xl border-t border-zinc-800 bg-zinc-950 lg:sticky lg:top-6 lg:h-auto lg:max-h-[calc(100vh-3rem)] lg:rounded-2xl lg:border"
			>
				<div className="flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-900/60 px-4 py-4 lg:rounded-t-2xl">
					<div className="min-w-0">
						<h2
							id={titleId}
							className="text-base font-semibold text-zinc-50"
						>
							Edit project
						</h2>
						<p
							id={descriptionId}
							className="mt-1 text-sm leading-6 text-zinc-400"
						>
							Update content, links, and display options for{' '}
							<span className="font-medium text-zinc-200">
								{project.title}
							</span>
							.
						</p>
					</div>

					<div className="flex items-center gap-2">
						{hasChanges && (
							<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-300">
								Unsaved
							</span>
						)}
						<button
							onClick={onClose}
							type="button"
							className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-500 transition hover:text-zinc-300"
							aria-label="Close editor"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
				</div>

				<div className="sr-only" role="status" aria-live="polite">
					{statusMessage}
				</div>

				<form
					onSubmit={event => {
						event.preventDefault()
						handleSave()
					}}
					className="flex min-h-0 flex-1 flex-col"
				>
					<div className="flex-1 space-y-6 overflow-y-auto p-4 lg:max-h-[calc(100vh-16rem)]">
						<section className="space-y-4">
							<div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
								<Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" />
								<p className="leading-6">
									Changes stay local to this editor until you
									save. Hidden projects remain editable but
									will not be shown publicly.
								</p>
							</div>

							<Field
								label="Title"
								fieldId={titleFieldId}
								description="Used in the project list and public project card."
							>
								<input
									id={titleFieldId}
									ref={titleInputRef}
									type="text"
									value={form.title}
									onChange={event =>
										handleChange(
											'title',
											event.target.value
										)
									}
									className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700/60"
								/>
							</Field>

							<Field
								label="Description"
								fieldId={descFieldId}
								description="A concise summary that helps you identify the project quickly."
							>
								<textarea
									id={descFieldId}
									value={form.desc}
									onChange={event =>
										handleChange('desc', event.target.value)
									}
									rows={4}
									className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700/60"
								/>
							</Field>
						</section>

						<section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
							<div>
								<h3 className="text-sm font-medium text-zinc-100">
									Links
								</h3>
								<p className="mt-1 text-xs leading-5 text-zinc-500">
									Add URLs only when they should be exposed
									through the project card.
								</p>
							</div>

							<Field label="GitHub URL" fieldId={githubFieldId}>
								<InputWithIcon
									id={githubFieldId}
									value={form.gitUrl ?? ''}
									onChange={value =>
										handleChange('gitUrl', value || null)
									}
								/>
							</Field>

							<Field label="Demo URL" fieldId={demoFieldId}>
								<InputWithIcon
									id={demoFieldId}
									value={form.demoUrl ?? ''}
									onChange={value =>
										handleChange('demoUrl', value || null)
									}
								/>
							</Field>

							<Field
								label="Demo Sandbox URL"
								fieldId={demoBoxFieldId}
								description="Optional interactive sandbox link."
							>
								<InputWithIcon
									id={demoBoxFieldId}
									value={form.demoBox ?? ''}
									onChange={value =>
										handleChange('demoBox', value || null)
									}
								/>
							</Field>
						</section>

						<section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
							<div>
								<h3 className="text-sm font-medium text-zinc-100">
									Metadata
								</h3>
								<p className="mt-1 text-xs leading-5 text-zinc-500">
									Labels help you recognize the stack or
									category at a glance.
								</p>
							</div>

							<Field
								label="Labels"
								fieldId={labelsFieldId}
								description="Comma-separated values, for example React, TypeScript, Tauri."
							>
								<input
									id={labelsFieldId}
									type="text"
									value={labelsInput}
									onChange={event => {
										setLabelsInput(event.target.value)
										setHasChanges(true)
										setStatusMessage(null)
									}}
									placeholder="React, TypeScript, Tauri"
									className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700/60"
								/>
							</Field>
						</section>

						<fieldset className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
							<legend className="px-1 text-sm font-medium text-zinc-100">
								Display options
							</legend>
							<p className="text-xs leading-5 text-zinc-500">
								Control which project details appear in the
								public interface.
							</p>
							<div className="grid gap-3 sm:grid-cols-2">
								<Toggle
									label="Featured"
									description="Highlight this project in the admin list and public UI."
									checked={form.featured}
									onChange={value =>
										handleChange('featured', value)
									}
								/>
								<Toggle
									label="Hidden"
									description="Keep the project editable without showing it publicly."
									checked={form.hidden}
									onChange={value =>
										handleChange('hidden', value)
									}
								/>
								<Toggle
									label="Native App"
									description="Mark the project as a native application."
									checked={form.native}
									onChange={value =>
										handleChange('native', value)
									}
								/>
								<Toggle
									label="Show Live"
									description="Display the live/demo link on the public project card."
									checked={form.showLive}
									onChange={value =>
										handleChange('showLive', value)
									}
								/>
								<Toggle
									label="Show Updated"
									description="Show the last updated date."
									checked={form.showUpd}
									onChange={value =>
										handleChange('showUpd', value)
									}
								/>
								<Toggle
									label="Show Commits"
									description="Expose repository commit information."
									checked={form.showCommits}
									onChange={value =>
										handleChange('showCommits', value)
									}
								/>
								<Toggle
									label="Show First"
									description="Pin this project near the top of the public layout."
									checked={form.showFirst}
									onChange={value =>
										handleChange('showFirst', value)
									}
								/>
								<Toggle
									label="Show Latest"
									description="Include latest update information."
									checked={form.showLatest}
									onChange={value =>
										handleChange('showLatest', value)
									}
								/>
								<Toggle
									label="Default Open"
									description="Open this project by default in expandable views."
									checked={form.defaultOpen}
									onChange={value =>
										handleChange('defaultOpen', value)
									}
								/>
								<Toggle
									label="Show Indicator"
									description="Display a visual indicator for this project."
									checked={form.showIndicator}
									onChange={value =>
										handleChange('showIndicator', value)
									}
								/>
							</div>
						</fieldset>
					</div>

					<div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
						<button
							onClick={handleDelete}
							type="button"
							disabled={isPending}
							className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Trash2 className="h-4 w-4" />
							Delete
						</button>

						<div className="flex items-center gap-3">
							{statusMessage && (
								<p className="hidden text-xs text-zinc-500 sm:block">
									{statusMessage}
								</p>
							)}
							<button
								type="submit"
								disabled={isPending || !hasChanges}
								className="inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-100 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<Save className="h-4 w-4" />
								{isPending ? 'Saving...' : 'Save changes'}
							</button>
						</div>
					</div>
				</form>
			</section>
		</div>
	)
}

function Field({
	label,
	fieldId,
	description,
	children
}: {
	label: string
	fieldId: string
	description?: string
	children: React.ReactNode
}) {
	return (
		<div className="space-y-1.5">
			<label
				htmlFor={fieldId}
				className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500"
			>
				{label}
			</label>
			{description && (
				<p className="text-xs leading-5 text-zinc-500">{description}</p>
			)}
			{children}
		</div>
	)
}

function InputWithIcon({
	id,
	value,
	onChange
}: {
	id: string
	value: string
	onChange: (value: string) => void
}) {
	return (
		<div className="relative">
			<input
				id={id}
				type="url"
				value={value}
				onChange={event => onChange(event.target.value)}
				className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 pr-10 text-sm text-zinc-100 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700/60"
			/>
			<ExternalLink className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
		</div>
	)
}

function Toggle({
	label,
	description,
	checked,
	onChange
}: {
	label: string
	description: string
	checked: boolean
	onChange: (value: boolean) => void
}) {
	return (
		<label className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 transition hover:border-zinc-700">
			<input
				type="checkbox"
				checked={checked}
				onChange={event => onChange(event.target.checked)}
				className="mt-1 h-4 w-4 rounded border border-zinc-700 bg-zinc-900 accent-zinc-100"
			/>
			<span className="space-y-1">
				<span className="block text-sm font-medium text-zinc-200">
					{label}
				</span>
				<span className="block text-xs leading-5 text-zinc-500">
					{description}
				</span>
			</span>
		</label>
	)
}
