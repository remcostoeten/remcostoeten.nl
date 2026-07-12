export type TKeywordMode = 'remove' | 'keep'

export type TLinkFilter = 'all' | 'links-only' | 'no-links'

export type TSortMode = 'none' | 'az' | 'za' | 'shortest' | 'longest'

export type TExtractorOptions = {
	keyword: string
	keywordMode: TKeywordMode
	caseSensitive: boolean
	useRegex: boolean
	linkFilter: TLinkFilter
	explodeLinks: boolean
	dedupe: boolean
	trimEmpty: boolean
	sort: TSortMode
}

export type TLine = {
	key: string
	text: string
	url: string | null
}

export type TExtractorResult = {
	lines: TLine[]
	inputLines: number
	linkCount: number
	error: string | null
}

export type TPersistedState = {
	version: 1
	input: string
	options: TExtractorOptions
	openBatchSize: number
}
