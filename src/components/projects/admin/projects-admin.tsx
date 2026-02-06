'use client'

import { useState, useTransition } from 'react'
import type {
	Project,
	ProjectSettings
} from '../../../server/db/project-schema'
import { ProjectList } from './project-list'
import { ProjectEditor } from './project-editor'
import { SettingsPanel } from './settings-panel'
import { createProject } from '../server/mutations'

type Props = {
	initialProjects: Project[]
	initialSettings: ProjectSettings
}

export function ProjectsAdmin({ initialProjects, initialSettings }: Props) {
	const [projects, setProjects] = useState(initialProjects)
	const [settings, setSettings] = useState(initialSettings)
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const selectedProject = projects.find(p => p.id === selectedId) ?? null

	async function handleCreate() {
		startTransition(async () => {
			const result = await createProject({
				title: 'New Project',
				desc: 'Project description'
			})
			if (result.success && result.data) {
				setSelectedId(result.data.id)
				window.location.reload()
			}
		})
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-medium text-zinc-100">
						Projects
					</h1>
					<p className="text-sm text-zinc-500">
						{projects.length} total,{' '}
						{projects.filter(p => !p.hidden).length} visible
					</p>
				</div>
				<button
					onClick={handleCreate}
					disabled={isPending}
					className="px-4 py-2 text-sm bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
				>
					{isPending ? 'Creating...' : 'Add Project'}
				</button>
			</div>

			<SettingsPanel settings={settings} onUpdate={setSettings} />

			<div className="grid gap-6 lg:grid-cols-[1fr,400px]">
				<ProjectList
					projects={projects}
					selectedId={selectedId}
					onSelect={setSelectedId}
					onReorder={newProjects => setProjects(newProjects)}
				/>

				{selectedProject && (
					<ProjectEditor
						project={selectedProject}
						onUpdate={updated => {
							setProjects(
								projects.map(p =>
									p.id === updated.id ? updated : p
								)
							)
						}}
						onDelete={() => {
							setProjects(
								projects.filter(p => p.id !== selectedId)
							)
							setSelectedId(null)
						}}
						onClose={() => setSelectedId(null)}
					/>
				)}
			</div>
		</div>
	)
}
