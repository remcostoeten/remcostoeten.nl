export type TJsonValue =
	| null
	| boolean
	| number
	| string
	| TJsonValue[]
	| { [key: string]: TJsonValue }

export type TOutputMode =
	| 'formatted'
	| 'minified'
	| 'typescript'
	| 'yaml'
	| 'csv'

export type TIndent = '2' | '4' | 'tab'

export type TParseResult =
	| { ok: true; value: TJsonValue }
	| { ok: false; error: string; line: number | null; column: number | null }

export type TConversion =
	| { ok: true; text: string }
	| { ok: false; error: string }

export type TJsonStats = {
	bytes: number
	nodes: number
	depth: number
	arrays: number
	objects: number
}

export type TJsonToolOptions = {
	mode: TOutputMode
	indent: TIndent
	sortKeys: boolean
	typeName: string
}

export type TPersistedState = {
	version: 1
	input: string
	options: TJsonToolOptions
}
