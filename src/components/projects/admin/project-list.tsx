'use client'

import { useId, useMemo, useState, useTransition } from 'react'
import { ChevronDown, ChevronUp, Eye, EyeOff, Search, Star } from 'lucide-react'
import type { Project } from '../../../server/db/project-schema'
import { moveProject } from '../server/mutations'

type Props = {
	projects: Project[]
	selectedId: string | null
	onSelect: (id: string | null) => void
	onReorder?: (projects: Project[]) => void
	onStatusChange?: (message: string) => void
}

export function ProjectList({
	projects,
	selectedId,
	onSelect,
	onReorder,
	onStatusChange
}: Props) {
	const [isPending, startTransition] = useTransition()
	const [query, setQuery] = useState('')
	const [visibilityFilter, setVisibilityFilter] = useState<
		'all' | 'visible' | 'hidden'
	>('all')
	const searchId = useId()
	const filterId = useId()

	const orderedProjects = useMemo(
		() => [...projects].sort((a, b) => a.idx - b.idx),
		[projects]
	)

	const filteredProjects = useMemo(() => {
		return orderedProjects.filter(project => {
			const matchesQuery =
				query.trim().length === 0 ||
				`${project.title} ${project.desc} ${project.labels.join(' ')}`
					.toLowerCase()
					.includes(query.trim().toLowerCase())
			const matchesVisibility =
				visibilityFilter === 'all' ||
				(visibilityFilter === 'visible' && !project.hidden) ||
				(visibilityFilter === 'hidden' && project.hidden)

			return matchesQuery && matchesVisibility
		})
	}, [orderedProjects, query, visibilityFilter])

	function handleMove(id: string, direction: 'up' | 'down') {
		startTransition(async () => {
			const result = await moveProject(id, direction)
			if (result.success) {
				const reorderedProjects = reorderProjects(
					projects,
					id,
					direction
				)
				onReorder?.(reorderedProjects)
				onStatusChange?.(
					`Moved ${
						reorderedProjects.find(project => project.id === id)
							?.title ?? 'project'
					} ${direction}.`
				)
			} else {
				onStatusChange?.(result.error)
			}
		})
	}

	return (
		<section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80">
			<div className="border-b border-zinc-800 bg-zinc-900/50 p-4 md:p-5">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<h2 className="text-base font-medium text-zinc-100">
							Project list
						</h2>
						<p className="mt-1 text-sm text-zinc-500">
							Select a project to edit it, then use the arrows to
							adjust display order.
						</p>
					</div>

					<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem] lg:w-[30rem]">
						<div className="space-y-1.5">
							<label
								htmlFor={searchId}
								className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500"
							>
								Search
							</label>
							<div className="relative">
								<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
								<input
									id={searchId}
									type="search"
									value={query}
									onChange={event =>
										setQuery(event.target.value)
									}
									placeholder="Find by title, description, or label"
									className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700/60"
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor={filterId}
								className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500"
							>
								Visibility
							</label>
							<select
								id={filterId}
								value={visibilityFilter}
								onChange={event =>
									setVisibilityFilter(
										event.target.value as
											| 'all'
											| 'visible'
											| 'hidden'
									)
								}
								className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700/60"
							>
								<option value="all">All projects</option>
								<option value="visible">Visible only</option>
								<option value="hidden">Hidden only</option>
							</select>
						</div>
					</div>
				</div>

				<p className="mt-4 text-xs text-zinc-500">
					Showing {filteredProjects.length} of {projects.length}{' '}
					projects.
				</p>
			</div>

			{projects.length > 0 && (
				<ol className="divide-y divide-zinc-800/60">
					{filteredProjects.map(project => {
						const isSelected = selectedId === project.id
						const canMoveUp = project.idx > 1
						const canMoveDown = project.idx < projects.length

						return (
							<li
								key={project.id}
								className={`flex flex-col gap-3 p-4 transition-colors md:flex-row md:items-center md:justify-between ${
									isSelected
										? 'bg-zinc-900/80'
										: 'hover:bg-zinc-900/40'
								}`}
							>
								<button
									type="button"
									onClick={() => onSelect(project.id)}
									className="min-w-0 flex-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
									aria-pressed={isSelected}
								>
									<div className="flex items-start gap-3">
										<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-400">
											{project.idx}
										</div>
										<div className="min-w-0 space-y-2">
											<div className="flex flex-wrap items-center gap-2">
												<span className="truncate text-sm font-medium text-zinc-100">
													{project.title}
												</span>
												{project.featured && (
													<span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
														<Star className="h-3 w-3" />
														Featured
													</span>
												)}
												<span
													className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
														project.hidden
															? 'border-zinc-700 bg-zinc-900 text-zinc-400'
															: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
													}`}
												>
													{project.hidden ? (
														<EyeOff className="h-3 w-3" />
													) : (
														<Eye className="h-3 w-3" />
													)}
													{project.hidden
														? 'Hidden'
														: 'Visible'}
												</span>
												{isSelected && (
													<span className="rounded-full border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-[11px] text-zinc-300">
														Selected
													</span>
												)}
											</div>

											<p className="line-clamp-2 text-sm leading-6 text-zinc-400">
												{project.desc}
											</p>

											{project.labels.length > 0 && (
												<div className="flex flex-wrap gap-2">
													{project.labels
														.slice(0, 4)
														.map(label => (
															<span
																key={label}
																className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-400"
															>
																{label}
															</span>
														))}
													{project.labels.length >
														4 && (
														<span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-500">
															+
															{project.labels
																.length -
																4}{' '}
															more
														</span>
													)}
												</div>
											)}
										</div>
									</div>
								</button>

								<div className="flex items-center justify-end gap-2">
									<button
										type="button"
										onClick={() =>
											handleMove(project.id, 'up')
										}
										disabled={isPending || !canMoveUp}
										className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-35"
										aria-label={`Move ${project.title} up`}
										title="Move up"
									>
										<ChevronUp className="h-4 w-4" />
									</button>
									<button
										type="button"
										onClick={() =>
											handleMove(project.id, 'down')
										}
										disabled={isPending || !canMoveDown}
										className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-35"
										aria-label={`Move ${project.title} down`}
										title="Move down"
									>
										<ChevronDown className="h-4 w-4" />
									</button>
								</div>
							</li>
						)
					})}
				</ol>
			)}

			{projects.length === 0 && (
				<div
					role="status"
					className="px-4 py-14 text-center text-sm text-zinc-500"
				>
					No projects yet. Use “Add Project” to create the first one.
				</div>
			)}

			{projects.length > 0 && filteredProjects.length === 0 && (
				<div
					role="status"
					className="px-4 py-14 text-center text-sm text-zinc-500"
				>
					No projects match the current filters.
				</div>
			)}
		</section>
	)
}

function reorderProjects(
	projects: Project[],
	id: string,
	direction: 'up' | 'down'
) {
	const orderedProjects = [...projects].sort((a, b) => a.idx - b.idx)
	const currentIndex = orderedProjects.findIndex(project => project.id === id)
	if (currentIndex === -1) return projects

	const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
	if (targetIndex < 0 || targetIndex >= orderedProjects.length)
		return projects

	;[orderedProjects[currentIndex], orderedProjects[targetIndex]] = [
		orderedProjects[targetIndex],
		orderedProjects[currentIndex]
	]

	return orderedProjects.map((project, index) => ({
		...project,
		idx: index + 1
	}))
}
