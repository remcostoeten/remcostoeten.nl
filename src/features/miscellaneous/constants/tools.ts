import {
	BracesIcon,
	CoordinateIcon,
	DiffIcon,
	FindReplaceIcon,
	LinkExtractIcon,
	LocateIcon,
	RadiusIcon
} from '../components/icons/animated-icons'
import type { TToolCategory, TToolDefinition } from '../types'

export const TOOL_CATEGORY_LABELS: Record<TToolCategory, string> = {
	text: 'Text',
	geo: 'Maps'
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
		category: 'text',
		icon: DiffIcon,
		status: 'available',
		keywords: ['diff', 'compare', 'changes', 'text', 'character']
	},
	{
		slug: 'json-tool',
		name: 'JSON Tool',
		description:
			'Validate, format and minify JSON, sort its keys, and convert it to a TypeScript type, YAML or CSV — with the exact line and column of every syntax error.',
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
		slug: 'link-extractor',
		name: 'Link Extractor',
		description:
			'Paste any text and pull the links out of it — keep or delete lines by word, keep only links or only prose, put every link on its own line, sort, dedupe, and open them in batches.',
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
			'Detect where you are right now and resolve it to latitude, longitude, street, postcode, city and country — copy any value, all of them, or the whole thing as JSON.',
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
