export type SvgState = 'valid' | 'warning' | 'invalid'

export type SvgSource = {
	start: number
	end: number
	markup: string
	complete: boolean
	errors: string[]
}

export type SvgColor = {
	value: string
	normalized: string
	count: number
	locations: string[]
}

export type SvgMetadata = {
	markup: string
	viewBox?: string
	width?: string
	height?: string
	sourceName?: string
	colors: SvgColor[]
	errors: string[]
	warnings: string[]
	notices: string[]
}

export type ColorMode = 'preserve' | 'fill' | 'stroke'

export type ConversionSettings = {
	colorMode: ColorMode
	primaryColor?: string
	replacePrimary: boolean
	replaceBlack: boolean
	removeDimensions: boolean
	defaultSize: number | string
	preserveAspectRatio: boolean
	preserveTitle: boolean
	preserveDesc: boolean
	decorative: boolean
	includeLabel: boolean
	preserveIds: boolean
	prefixIds: boolean
	format: boolean
	optimizePrecision: boolean
	preserveDecimalPrecision: boolean
	precision: number
	removeMetadata: boolean
}

export type SvgItem = {
	id: string
	index: number
	source: SvgSource
	importedFilename?: string
	name: string
	component: string
	filename: string
	state: SvgState
	errors: string[]
	warnings: string[]
	notices: string[]
	colors: SvgColor[]
	markup: string
	viewBox?: string
	width?: string
	height?: string
	settings: ConversionSettings
}

export type ExportScope = 'selected' | 'all'

export const DEFAULT_SETTINGS: ConversionSettings = {
	colorMode: 'preserve',
	replacePrimary: false,
	replaceBlack: false,
	removeDimensions: true,
	defaultSize: '1em',
	preserveAspectRatio: true,
	preserveTitle: true,
	preserveDesc: true,
	decorative: true,
	includeLabel: true,
	preserveIds: false,
	prefixIds: true,
	format: true,
	optimizePrecision: false,
	preserveDecimalPrecision: true,
	precision: 3,
	removeMetadata: true
}
