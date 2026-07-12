import type { TJsonToolOptions } from './types'

export const STORAGE_KEY = 'tools:json-tool:v1'

export const MAX_INPUT_CHARS = 5_000_000

export const DEFAULT_OPTIONS: TJsonToolOptions = {
	mode: 'formatted',
	indent: '2',
	sortKeys: false,
	typeName: 'TRoot'
}

export const SAMPLE_INPUT = `{
  "name": "remcostoeten",
  "tools": [
    { "slug": "diff-checker", "category": "text" },
    { "slug": "link-extractor", "category": "text" }
  ],
  "active": true
}`
