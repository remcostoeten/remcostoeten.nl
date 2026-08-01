import {
	BracesIcon,
	CoordinateIcon,
	DiffIcon,
	FindReplaceIcon,
	GifToVideoIcon,
	LinkExtractIcon,
	LocateIcon,
	RadiusIcon,
	VideoConvertIcon,
	VideoToGifIcon
} from '../components/icons/animated-icons'
import type { TToolCategory, TToolDefinition } from '../types'

export const TOOL_CATEGORY_LABELS: Record<TToolCategory, string> = {
	text: 'Text',
	geo: 'Maps',
	media: 'Media'
}

export const TOOL_CATEGORIES = Object.keys(
	TOOL_CATEGORY_LABELS
) as TToolCategory[]

export const TOOLS = [
	{
		slug: 'find-replace',
		name: 'Find & Replace',
		description:
			'Advanced find and replace with regex, sorting, whitespace cleanup, workspaces, snapshots and history.',
		updatedAt: '2026-07-04',
		category: 'text',
		icon: FindReplaceIcon,
		status: 'available',
		keywords: ['search', 'replace', 'regex', 'substitute', 'sed', 'text']
	},
	{
		slug: 'diff-checker',
		name: 'Diff Checker',
		description:
			'Compare two texts with line, word, or character level diffs.',
		updatedAt: '2026-07-12',
		category: 'text',
		icon: DiffIcon,
		status: 'available',
		keywords: ['diff', 'compare', 'changes', 'text', 'character']
	},
	{
		slug: 'json-tool',
		name: 'JSON Tool',
		description:
			'Validate, format and minify JSON, sort its keys, and convert it to a TypeScript type, YAML or CSV, with the exact line and column of every syntax error.',
		updatedAt: '2026-08-01',
		category: 'text',
		icon: BracesIcon,
		status: 'available',
		keywords: [
			'json',
			'json formatter',
			'json beautifier',
			'pretty print',
			'json validator',
			'minify',
			'json to typescript',
			'json to yaml',
			'json to csv',
			'sort keys',
			'parse error',
			'lint'
		]
	},
	{
		slug: 'svg-converter',
		name: 'SVG to React',
		description:
			'Extract, sanitize, preview and convert one or many SVGs into deterministic React TSX components and local ZIP packages.',
		updatedAt: '2026-08-01',
		category: 'text',
		icon: BracesIcon,
		status: 'available',
		keywords: [
			'svg',
			'react',
			'tsx',
			'icon',
			'converter',
			'component',
			'sanitize',
			'zip'
		]
	},
	{
		slug: 'link-extractor',
		name: 'Link Extractor',
		description:
			'Paste any text and pull the links out of it. Keep or delete lines by word, keep only links or only prose, put every link on its own line, sort, dedupe, and open them in batches.',
		updatedAt: '2026-08-01',
		category: 'text',
		icon: LinkExtractIcon,
		status: 'available',
		keywords: [
			'link extractor',
			'url extractor',
			'text extractor',
			'extract links',
			'extract urls',
			'filter lines',
			'delete lines containing',
			'keep lines containing',
			'grep',
			'open links',
			'bulk open',
			'sort links',
			'dedupe',
			'url list'
		]
	},
	{
		slug: 'coordinate-marker',
		name: 'Coordinate Marker',
		description:
			'Click anywhere on the map to drop a pin and capture latitude, longitude, city and address. Saved locally in your browser.',
		updatedAt: '2026-08-01',
		category: 'geo',
		icon: CoordinateIcon,
		status: 'available',
		keywords: [
			'coordinates',
			'latitude',
			'longitude',
			'map',
			'pin',
			'marker',
			'geo',
			'location',
			'address',
			'nominatim',
			'reverse geocode'
		]
	},
	{
		slug: 'my-location',
		name: 'My Location',
		description:
			'Detect where you are right now and resolve it to latitude, longitude, street, postcode, city and country. Copy any value, all of them, or the whole thing as JSON.',
		updatedAt: '2026-07-11',
		category: 'geo',
		icon: LocateIcon,
		status: 'available',
		keywords: [
			'my location',
			'current location',
			'geolocation',
			'gps',
			'where am i',
			'latitude',
			'longitude',
			'coordinates',
			'city',
			'address',
			'postcode',
			'reverse geocode',
			'copy'
		]
	},
	{
		slug: 'hemelsbreed',
		name: 'Hemelsbreed Radius',
		description:
			'Plot as-the-crow-flies radius circles on a map of the Netherlands from any address, postcode or click, then see where they overlap to pinpoint a location.',
		updatedAt: '2026-08-01',
		category: 'geo',
		icon: RadiusIcon,
		status: 'available',
		keywords: [
			'hemelsbreed',
			'radius',
			'circle',
			'map',
			'distance',
			'kilometer',
			'km',
			'postcode',
			'address',
			'netherlands',
			'nederland',
			'geo',
			'crow',
			'triangulate'
		]
	},
	{
		slug: 'sendable-video',
		name: 'Sendable Video',
		description:
			'Convert any video into an MP4 that WhatsApp Web and other chat apps accept, or into an optimized GIF. Trim the clip first if you want. Everything runs in your browser, nothing is uploaded.',
		updatedAt: '2026-08-01',
		category: 'media',
		icon: VideoConvertIcon,
		status: 'available',
		keywords: [
			'video',
			'video converter',
			'mp4',
			'whatsapp',
			'whatsapp web',
			'sendable',
			'gif',
			'video to gif',
			'mov to mp4',
			'mkv to mp4',
			'hevc',
			'h264',
			'compress',
			'trim',
			'ffmpeg'
		]
	},
	{
		slug: 'gif-to-video',
		name: 'GIF to Video',
		description:
			'Turn an animated GIF into a compact MP4 or WebM — usually many times smaller — with quality presets and an instant result preview. Runs entirely in your browser.',
		updatedAt: '2026-08-01',
		category: 'media',
		icon: GifToVideoIcon,
		status: 'available',
		keywords: [
			'gif to mp4',
			'gif to webm',
			'gif to video',
			'gif converter',
			'compress gif',
			'animated gif',
			'shrink gif',
			'mp4',
			'webm',
			'ffmpeg'
		]
	},
	{
		slug: 'video-to-gif',
		name: 'Video to GIF',
		description:
			'Convert a video clip into an optimized looping GIF. Control framerate, width and quality, and render a quick preview with a size estimate before committing to the full clip. Runs entirely in your browser.',
		updatedAt: '2026-08-01',
		category: 'media',
		icon: VideoToGifIcon,
		status: 'available',
		keywords: [
			'video to gif',
			'mp4 to gif',
			'mov to gif',
			'gif maker',
			'gif creator',
			'animated gif',
			'fps',
			'palette',
			'loop',
			'ffmpeg'
		]
	}
] as const satisfies readonly TToolDefinition[]

export type TToolSlug = (typeof TOOLS)[number]['slug']

const SEARCH_HAYSTACKS = new Map<string, string>(
	TOOLS.map(tool => [
		tool.slug,
		[tool.name, tool.description, ...tool.keywords].join(' ').toLowerCase()
	])
)

export function searchTools(query: string): readonly TToolDefinition[] {
	const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
	if (terms.length === 0) return TOOLS
	return TOOLS.filter(tool => {
		const haystack = SEARCH_HAYSTACKS.get(tool.slug) ?? ''
		return terms.every(term => haystack.includes(term))
	})
}

export function getToolBySlug(slug: string): TToolDefinition | undefined {
	return TOOLS.find(tool => tool.slug === slug)
}

export function getAvailableTools(): readonly TToolDefinition[] {
	return TOOLS.filter(tool => tool.status === 'available')
}

export function getToolCountsByCategory(): Record<TToolCategory, number> {
	return TOOLS.reduce(
		(counts, tool) => {
			counts[tool.category] += 1
			return counts
		},
		Object.fromEntries(
			TOOL_CATEGORIES.map(category => [category, 0])
		) as Record<TToolCategory, number>
	)
}

export function getToolsGroupedByCategory(): readonly {
	category: TToolCategory
	tools: readonly TToolDefinition[]
}[] {
	return TOOL_CATEGORIES.map(category => ({
		category,
		tools: getAvailableTools().filter(tool => tool.category === category)
	})).filter(group => group.tools.length > 0)
}
