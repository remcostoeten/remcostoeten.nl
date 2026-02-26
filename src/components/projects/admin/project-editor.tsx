'use client'

import type React from 'react'

import { useState, useTransition } from 'react'
import type { Project } from '../../../server/db/project-schema'
import { updateProject, deleteProject } from '../server/mutations'
import { X, Trash2, Save } from 'lucide-react'

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

	function handleChange<K extends keyof Project>(key: K, value: Project[K]) {
		setForm({ ...form, [key]: value })
		setHasChanges(true)
	}

	function handleSave() {
		startTransition(async () => {
			const labels = labelsInput
				.split(',')
				.map(l => l.trim())
				.filter(Boolean)
			const result = await updateProject(project.id, { ...form, labels })
			if (result.success) {
				onUpdate({ ...form, labels })
				setHasChanges(false)
			}
		})
	}

	function handleDelete() {
		if (!confirm('Delete this project?')) return
		startTransition(async () => {
			const result = await deleteProject(project.id)
			if (result.success) {
				onDelete()
			}
		})
	}

	return (
		<div className="fixed inset-0 z-50 w-full h-full bg-black/80 lg:bg-transparent lg:static lg:z-auto lg:h-fit lg:w-auto lg:sticky lg:top-6 lg:border lg:border-zinc-800 backdrop-blur-sm lg:backdrop-blur-none flex flex-col justify-end lg:block">
			<div className="bg-zinc-950 w-full h-[90vh] lg:h-auto rounded-t-xl lg:rounded-none border-t border-zinc-800 lg:border-none flex flex-col">
				<div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between shrink-0 rounded-t-xl lg:rounded-none">
					<span className="text-sm font-medium text-zinc-100">
						Edit Project
					</span>
					<div className="flex items-center gap-2">
						{hasChanges && (
							<span className="text-xs text-amber-500">Unsaved</span>
						)}
						<button
							onClick={onClose}
							className="p-3.5 text-zinc-500 hover:text-zinc-300"
							aria-label="Close editor"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				<div className="p-4 space-y-4 overflow-y-auto flex-1 lg:max-h-[calc(100vh-200px)]">
					<Field label="Title">
						<input
							type="text"
							value={form.title}
							onChange={e => handleChange('title', e.target.value)}
							className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
						/>
					</Field>

					<Field label="Description">
						<textarea
							value={form.desc}
							onChange={e => handleChange('desc', e.target.value)}
							rows={3}
							className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 resize-none"
						/>
					</Field>

					<Field label="GitHub URL">
						<input
							type="url"
							value={form.gitUrl ?? ''}
							onChange={e =>
								handleChange('gitUrl', e.target.value || null)
							}
							className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
						/>
					</Field>

					<Field label="Demo URL">
						<input
							type="url"
							value={form.demoUrl ?? ''}
							onChange={e =>
								handleChange('demoUrl', e.target.value || null)
							}
							className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
						/>
					</Field>

					<Field label="Demo Sandbox URL">
						<input
							type="url"
							value={form.demoBox ?? ''}
							onChange={e =>
								handleChange('demoBox', e.target.value || null)
							}
							className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
						/>
					</Field>

					<Field label="Labels (comma separated)">
						<input
							type="text"
							value={labelsInput}
							onChange={e => {
								setLabelsInput(e.target.value)
								setHasChanges(true)
							}}
							placeholder="React, TypeScript, Tauri"
							className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
						/>
					</Field>

					<div className="grid grid-cols-2 gap-4">
						<Toggle
							label="Featured"
							checked={form.featured}
							onChange={v => handleChange('featured', v)}
						/>
						<Toggle
							label="Hidden"
							checked={form.hidden}
							onChange={v => handleChange('hidden', v)}
						/>
						<Toggle
							label="Native App"
							checked={form.native}
							onChange={v => handleChange('native', v)}
						/>
						<Toggle
							label="Show Live"
							checked={form.showLive}
							onChange={v => handleChange('showLive', v)}
						/>
						<Toggle
							label="Show Updated"
							checked={form.showUpd}
							onChange={v => handleChange('showUpd', v)}
						/>
						<Toggle
							label="Show Commits"
							checked={form.showCommits}
							onChange={v => handleChange('showCommits', v)}
						/>
						<Toggle
							label="Show First"
							checked={form.showFirst}
							onChange={v => handleChange('showFirst', v)}
						/>
						<Toggle
							label="Show Latest"
							checked={form.showLatest}
							onChange={v => handleChange('showLatest', v)}
						/>
						<Toggle
							label="Default Open"
							checked={form.defaultOpen}
							onChange={v => handleChange('defaultOpen', v)}
						/>
						<Toggle
							label="Show Indicator"
							checked={form.showIndicator}
							onChange={v => handleChange('showIndicator', v)}
						/>
					</div>
				</div>

				<div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between shrink-0 pb-safe">
					<button
						onClick={handleDelete}
						disabled={isPending}
						className="flex h-11 items-center gap-2 px-4 text-sm text-red-500 hover:text-red-400 disabled:opacity-50 transition-colors"
					>
						<Trash2 className="w-4 h-4" />
						Delete
					</button>
					<button
						onClick={handleSave}
						disabled={isPending || !hasChanges}
						className="flex h-11 items-center gap-2 px-6 text-sm bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 transition-colors font-medium"
					>
						<Save className="w-4 h-4" />
						{isPending ? 'Saving...' : 'Save'}
					</button>
				</div>
			</div>
		</div>
	)
}

function Field({
	label,
	children
}: {
	label: string
	children: React.ReactNode
}) {
	return (
		<label className="block">
			<span className="text-xs text-zinc-500 mb-1.5 block">{label}</span>
			{children}
		</label>
	)
}

function Toggle({
	label,
	checked,
	onChange
}: {
	label: string
	checked: boolean
	onChange: (v: boolean) => void
}) {
	return (
		<label className="flex items-center gap-2 cursor-pointer">
			<input
				type="checkbox"
				checked={checked}
				onChange={e => onChange(e.target.checked)}
				className="w-4 h-4 bg-zinc-900 border border-zinc-700 rounded-none accent-zinc-100"
			/>
			<span className="text-xs text-zinc-400">{label}</span>
		</label>
	)
}
