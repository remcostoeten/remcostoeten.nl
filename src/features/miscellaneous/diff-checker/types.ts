export type TDiffLineType = 'equal' | 'added' | 'removed'

export type TDiffLine = {
	type: TDiffLineType
	text: string
	aLine: number | null
	bLine: number | null
}

export type TDiffSegment = {
	type: TDiffLineType
	text: string
}

export type TDiffGranularity = 'line' | 'word' | 'char'
