'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { IProject, IGitMetrics } from '../types'
import { ProjectShowcaseClient } from './project-showcase-client'
import { ProjectShowcaseSkeleton } from './project-showcase-skeleton'

type Props = {
	visibleRowCount?: number
}

type ProjectShowcaseData = {
	featured: IProject[]
	other: IProject[]
}

type ProjectGitMetricsMap = Record<string, IGitMetrics>

async function fetchProjectShowcaseData(): Promise<ProjectShowcaseData> {
	const response = await fetch('/api/projects/showcase')
	if (!response.ok) {
		throw new Error('Failed to load project showcase')
	}
	return response.json()
}

async function fetchProjectGitMetrics(): Promise<ProjectGitMetricsMap> {
	const response = await fetch('/api/projects/git-metrics')
	if (!response.ok) {
		throw new Error('Failed to load project git metrics')
	}
	return response.json()
}

export function ProjectShowcase({ visibleRowCount = 6 }: Props) {
	const { data, isLoading } = useQuery({
		queryKey: ['project-showcase'],
		queryFn: fetchProjectShowcaseData,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		retry: 1,
		refetchOnWindowFocus: false
	})

	const [shouldLoadMetrics, setShouldLoadMetrics] = useState(false)

	useEffect(() => {
		if (!data) return

		const requestIdle = window.requestIdleCallback
		const cancelIdle = window.cancelIdleCallback

		if (typeof requestIdle === 'function') {
			const idleId = requestIdle(() => setShouldLoadMetrics(true), {
				timeout: 2000
			})
			return () => cancelIdle?.(idleId)
		}

		const timeoutId = setTimeout(() => setShouldLoadMetrics(true), 300)
		return () => clearTimeout(timeoutId)
	}, [data])

	const { data: gitMetrics } = useQuery({
		queryKey: ['project-git-metrics'],
		queryFn: fetchProjectGitMetrics,
		enabled: shouldLoadMetrics,
		staleTime: 60 * 60 * 1000,
		gcTime: 2 * 60 * 60 * 1000,
		retry: 0,
		refetchOnWindowFocus: false
	})

	const featured = useMemo(
		() =>
			(data?.featured ?? []).map(project => ({
				...project,
				git: gitMetrics?.[project.name] ?? project.git
			})),
		[data?.featured, gitMetrics]
	)

	const other = useMemo(
		() =>
			(data?.other ?? []).map(project => ({
				...project,
				git: gitMetrics?.[project.name] ?? project.git
			})),
		[data?.other, gitMetrics]
	)

	if (isLoading || !data) {
		return <ProjectShowcaseSkeleton visibleRowCount={visibleRowCount} />
	}

	return (
		<ProjectShowcaseClient
			visibleRowCount={visibleRowCount}
			featured={featured}
			other={other}
		/>
	)
}
