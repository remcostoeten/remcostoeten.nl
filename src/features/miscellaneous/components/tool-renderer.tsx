'use client'

import { useEffect } from 'react'
import nextDynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { useRecentTools } from '../hooks/use-tool-usage'

function ToolSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading tool"
			className="flex flex-col gap-3"
		>
			<div className="h-8 w-64 animate-pulse bg-muted/60" />
			<div className="h-28 animate-pulse bg-muted/60" />
			<div className="h-96 animate-pulse bg-muted/60" />
		</div>
	)
}

const toolComponents: Record<string, ComponentType> = {
	'find-replace': nextDynamic(() => import('../find-replace'), {
		ssr: false,
		loading: ToolSkeleton
	}),
	'diff-checker': nextDynamic(() => import('../diff-checker'), {
		ssr: false,
		loading: ToolSkeleton
	}),
	hemelsbreed: nextDynamic(() => import('../hemelsbreed'), {
		ssr: false,
		loading: ToolSkeleton
	}),
	'coordinate-marker': nextDynamic(() => import('../coordinate-marker'), {
		ssr: false,
		loading: ToolSkeleton
	})
}

type Props = {
	slug: string
}

export function ToolRenderer({ slug }: Props) {
	const { markUsed } = useRecentTools()

	useEffect(() => {
		markUsed(slug)
	}, [slug, markUsed])

	const Tool = toolComponents[slug]
	if (!Tool) return null
	return <Tool />
}
