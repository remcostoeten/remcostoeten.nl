'use client'

import { useEffect } from 'react'
import nextDynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { TToolSlug } from '../constants/tools'
import { useRecentTools } from '../hooks/use-tool-usage'

function ToolSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading tool"
			className="flex min-h-[70vh] flex-col gap-3"
		>
			<div className="h-8 w-64 shrink-0 animate-pulse bg-muted/60" />
			<div className="h-28 shrink-0 animate-pulse bg-muted/60" />
			<div className="grow animate-pulse bg-muted/60" />
		</div>
	)
}

type TLoader = () => Promise<{ default: ComponentType }>

function lazyTool(loader: TLoader, ssr = false) {
	return nextDynamic(loader, { ssr, loading: ToolSkeleton })
}

const TOOL_COMPONENTS: Record<TToolSlug, ComponentType> = {
	'find-replace': lazyTool(() => import('../find-replace')),
	'diff-checker': lazyTool(() => import('../diff-checker'), true),
	hemelsbreed: lazyTool(() => import('../hemelsbreed')),
	'coordinate-marker': lazyTool(() => import('../coordinate-marker')),
	'my-location': lazyTool(() => import('../my-location'))
}

type Props = {
	slug: TToolSlug
}

export function ToolRenderer({ slug }: Props) {
	const { markUsed } = useRecentTools()

	useEffect(() => {
		markUsed(slug)
	}, [slug, markUsed])

	const Tool = TOOL_COMPONENTS[slug]
	if (!Tool) return null

	return (
		<div className="min-h-[70vh]">
			<Tool />
		</div>
	)
}
