import type { TExtractorOptions } from './types'

export const STORAGE_KEY = 'tools:link-extractor:v1'

export const MAX_INPUT_CHARS = 2_000_000

export const INITIAL_VISIBLE_LINES = 300

export const VISIBLE_LINES_STEP = 300

export const OPEN_CONFIRM_THRESHOLD = 12

export const MAX_OPEN_AT_ONCE = 50

export const DEFAULT_OPTIONS: TExtractorOptions = {
	keyword: '',
	keywordMode: 'remove',
	caseSensitive: false,
	useRegex: false,
	linkFilter: 'all',
	explodeLinks: false,
	dedupe: false,
	trimEmpty: false,
	sort: 'none'
}
