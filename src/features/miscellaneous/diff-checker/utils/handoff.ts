const HANDOFF_KEY = 'misc-tools:diff-handoff'

type THandoff = {
	left: string
	right: string
	leftLabel: string
	rightLabel: string
}

export function writeDiffHandoff(handoff: THandoff): void {
	try {
		window.localStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff))
	} catch (error) {
		console.warn(`Could not write localStorage key "${HANDOFF_KEY}"`, error)
	}
}

export function readDiffHandoff(): THandoff | null {
	try {
		const raw = window.localStorage.getItem(HANDOFF_KEY)
		if (raw === null) return null
		window.localStorage.removeItem(HANDOFF_KEY)
		return JSON.parse(raw) as THandoff
	} catch (error) {
		console.warn(`Could not read localStorage key "${HANDOFF_KEY}"`, error)
		return null
	}
}
