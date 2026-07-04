import type { TFindOptions } from './types'

export const STORAGE_KEY = 'misc-tools:find-replace:v1'
export const STORAGE_VERSION = 1

export const DEFAULT_OPTIONS: TFindOptions = {
	caseSensitive: false,
	wholeWord: false,
	regex: false,
	multiline: false,
	preserveCase: false,
	trimWhitespace: false
}

export const MAX_UNDO_STEPS = 50
export const MAX_SNAPSHOTS = 50
export const MAX_WORKSPACES = 20

export const MATCH_LIMIT = 5000
export const HIGHLIGHT_CHAR_LIMIT = 200_000
export const LIVE_PREVIEW_CHAR_LIMIT = 2_000_000

export const MAX_FILE_SIZE = 10 * 1024 * 1024

export const ACCEPTED_FILE_EXTENSIONS = [
	'.txt',
	'.md',
	'.markdown',
	'.json',
	'.csv',
	'.tsv',
	'.log',
	'.xml',
	'.yml',
	'.yaml',
	'.html',
	'.css',
	'.js',
	'.jsx',
	'.ts',
	'.tsx',
	'.sql',
	'.sh',
	'.env',
	'.ini',
	'.toml'
]

export const ACCEPT_ATTRIBUTE = ACCEPTED_FILE_EXTENSIONS.join(',')
