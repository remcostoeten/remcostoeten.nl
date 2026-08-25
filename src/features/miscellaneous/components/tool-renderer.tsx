import nextDynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { TToolSlug } from '../constants/tools'
import { TOOL_SKELETONS } from './tool-skeletons'

type TLoader = () => Promise<{ default: ComponentType }>

function lazyTool(slug: TToolSlug, loader: TLoader) {
	const Fallback = TOOL_SKELETONS[slug]
	return nextDynamic(loader, { loading: () => <Fallback /> })
}

const TOOL_COMPONENTS: Record<TToolSlug, ComponentType> = {
	'find-replace': lazyTool('find-replace', () => import('../find-replace')),
	'diff-checker': lazyTool('diff-checker', () => import('../diff-checker')),
	'link-extractor': lazyTool(
		'link-extractor',
		() => import('../link-extractor')
	),
	'json-tool': lazyTool('json-tool', () => import('../json-tool')),
	'svg-converter': lazyTool(
		'svg-converter',
		() => import('../svg-converter')
	),
	hemelsbreed: lazyTool('hemelsbreed', () => import('../hemelsbreed')),
	'coordinate-marker': lazyTool(
		'coordinate-marker',
		() => import('../coordinate-marker')
	),
	'my-location': lazyTool('my-location', () => import('../my-location')),
	'heic-converter': lazyTool(
		'heic-converter',
		() => import('../heic-converter')
	),
	'sendable-video': lazyTool(
		'sendable-video',
		() => import('../sendable-video')
	),
	'gif-to-video': lazyTool('gif-to-video', () => import('../gif-to-video')),
	'video-to-gif': lazyTool('video-to-gif', () => import('../video-to-gif'))
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
