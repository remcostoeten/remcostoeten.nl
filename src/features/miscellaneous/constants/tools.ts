import {
	CoordinateIcon,
	DiffIcon,
	FindReplaceIcon,
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

export const TOOLS: TToolDefinition[] = [
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
		description: 'Compare two texts with line and word level diffs.',
		category: 'text',
		icon: DiffIcon,
		status: 'available',
		keywords: ['diff', 'compare', 'changes', 'text']
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
]

export function getToolBySlug(slug: string): TToolDefinition | undefined {
	return TOOLS.find(tool => tool.slug === slug)
}

export function getAvailableTools(): TToolDefinition[] {
	return TOOLS
}
