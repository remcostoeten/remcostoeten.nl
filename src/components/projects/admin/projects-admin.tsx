'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, FolderKanban, type LucideIcon, Star } from 'lucide-react'
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
	const [selectedId, setSelectedId] = useState<string | null>(
		initialProjects[0]?.id ?? null
	)
	const [statusMessage, setStatusMessage] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const selectedProject =
		projects.find(project => project.id === selectedId) ?? null
	const visibleProjects = projects.filter(project => !project.hidden)
	const featuredProjects = projects.filter(project => project.featured)

	async function handleCreate() {
		startTransition(async () => {
			const result = await createProject({
				title: 'New Project',
				desc: 'Project description'
			})

			if (result.success && result.data) {
				const idx =
					projects.length > 0
						? Math.max(...projects.map(project => project.idx)) + 1
						: 1
				const nextProject: Project = {
					id: result.data.id,
					idx,
					title: 'New Project',
					desc: 'Project description',
					featured: false,
					additionalDesc: null,
					showUpd: true,
					demoBox: null,
					showLive: false,
					gitUrl: null,
					demoUrl: null,
					native: false,
					labels: [],
					showCommits: false,
					showFirst: false,
					showLatest: true,
					hidden: false,
					defaultOpen: false,
					showIndicator: false,
					createdAt: new Date(),
					updatedAt: new Date()
				}

				setProjects(currentProjects => [
					...currentProjects,
					nextProject
				])
				setSelectedId(result.data.id)
				setStatusMessage(
					'New project created. You can edit the details now.'
				)
			} else if (!result.success) {
				setStatusMessage(result.error)
			}
		})
	}

	function handleProjectDelete() {
		setProjects(currentProjects => {
			const remainingProjects = currentProjects
				.filter(project => project.id !== selectedId)
				.sort((a, b) => a.idx - b.idx)
				.map((project, index) => ({
					...project,
					idx: index + 1
				}))

			setSelectedId(remainingProjects[0]?.id ?? null)
			return remainingProjects
		})
		setStatusMessage('Project deleted.')
	}

	return (
		<div className="space-y-6">
			<section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 md:p-6">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200">
								<FolderKanban className="h-5 w-5" />
							</div>
							<div>
								<h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
									Projects
								</h1>
								<p className="text-sm text-zinc-400">
									Manage visibility, ordering, and project
									metadata from one workspace.
								</p>
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-3">
							<StatCard
								label="Total projects"
								value={projects.length}
								icon={FolderKanban}
							/>
							<StatCard
								label="Visible now"
								value={visibleProjects.length}
								icon={Eye}
							/>
							<StatCard
								label="Featured"
								value={featuredProjects.length}
								icon={Star}
							/>
						</div>
					</div>

					<div className="flex flex-col items-stretch gap-3 lg:w-[18rem]">
						<button
							onClick={handleCreate}
							disabled={isPending}
							className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-100 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isPending ? 'Creating...' : 'Add Project'}
						</button>
						<p className="text-xs leading-5 text-zinc-500">
							New projects are created at the end of the list and
							opened directly in the editor.
						</p>
					</div>
				</div>
			</section>

			<div
				className="sr-only"
				role="status"
				aria-live="polite"
				aria-atomic="true"
			>
				{statusMessage}
			</div>

			<SettingsPanel
				settings={settings}
				onUpdate={nextSettings => {
					setSettings(nextSettings)
					setStatusMessage('Project display settings saved.')
				}}
			/>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,420px)]">
				<ProjectList
					projects={projects}
					selectedId={selectedId}
					onSelect={setSelectedId}
					onReorder={newProjects => setProjects(newProjects)}
					onStatusChange={setStatusMessage}
				/>

				{selectedProject ? (
					<ProjectEditor
						project={selectedProject}
						onUpdate={updated => {
							setProjects(currentProjects =>
								currentProjects.map(project =>
									project.id === updated.id
										? updated
										: project
								)
							)
							setStatusMessage(
								`Saved changes to ${updated.title}.`
							)
						}}
						onDelete={handleProjectDelete}
						onClose={() => setSelectedId(null)}
					/>
				) : (
					<section className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-6 text-sm text-zinc-400">
						<h2 className="text-base font-medium text-zinc-100">
							Select a project to edit
						</h2>
						<p className="mt-2 leading-6">
							Choose a row from the list to update details, toggle
							display options, or remove a project.
						</p>
						<div className="mt-4 flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 text-xs text-zinc-500">
							<EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
							Hidden projects stay in the list so you can edit
							them without exposing them on the public site.
						</div>
					</section>
				)}
			</div>
		</div>
	)
}

function StatCard({
	label,
	value,
	icon: Icon
}: {
	label: string
	value: number
	icon: LucideIcon
}) {
	return (
		<div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
						{label}
					</p>
					<p className="mt-2 text-2xl font-semibold text-zinc-50">
						{value}
					</p>
				</div>
				<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300">
					<Icon className="h-4 w-4" />
				</div>
			</div>
		</div>
	)
}
