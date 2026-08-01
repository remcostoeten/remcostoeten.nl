'use client'

import nextDynamic from 'next/dynamic'
import type { ComponentType, ReactNode } from 'react'
import type { TToolSlug } from '../constants/tools'
import {
	CoordinateMarkerSkeleton,
	DiffCheckerSkeleton,
	FindReplaceSkeleton,
	GifToVideoSkeleton,
	HemelsbreedSkeleton,
	JsonToolSkeleton,
	LinkExtractorSkeleton,
	MyLocationSkeleton,
	SendableVideoSkeleton,
	SvgConverterSkeleton,
	VideoToGifSkeleton
} from './tool-skeletons'

type TLoader = () => Promise<{ default: ComponentType }>

function lazyTool(loader: TLoader, skeleton: () => ReactNode, ssr = false) {
	return nextDynamic(loader, { ssr, loading: skeleton })
}

const TOOL_COMPONENTS: Record<TToolSlug, ComponentType> = {
	'find-replace': lazyTool(
		() => import('../find-replace'),
		FindReplaceSkeleton
	),
	'diff-checker': lazyTool(
		() => import('../diff-checker'),
		DiffCheckerSkeleton,
		true
	),
	'link-extractor': lazyTool(
		() => import('../link-extractor'),
		LinkExtractorSkeleton,
		true
	),
	'json-tool': lazyTool(() => import('../json-tool'), JsonToolSkeleton, true),
	'svg-converter': lazyTool(
		() => import('../svg-converter'),
		SvgConverterSkeleton,
		true
	),
	hemelsbreed: lazyTool(() => import('../hemelsbreed'), HemelsbreedSkeleton),
	'coordinate-marker': lazyTool(
		() => import('../coordinate-marker'),
		CoordinateMarkerSkeleton
	),
	'my-location': lazyTool(() => import('../my-location'), MyLocationSkeleton),
	'sendable-video': lazyTool(
		() => import('../sendable-video'),
		SendableVideoSkeleton
	),
	'gif-to-video': lazyTool(
		() => import('../gif-to-video'),
		GifToVideoSkeleton
	),
	'video-to-gif': lazyTool(
		() => import('../video-to-gif'),
		VideoToGifSkeleton
	)
}

type Props = {
	slug: TToolSlug
}

export function ToolRenderer({ slug }: Props) {
	const Tool = TOOL_COMPONENTS[slug]
	if (!Tool) return null

	return (
		<div className="min-h-[70vh]">
			<Tool />
		</div>
	)
}
