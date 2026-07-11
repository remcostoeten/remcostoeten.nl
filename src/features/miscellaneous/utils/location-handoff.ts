import type { TToolSlug } from '../constants/tools'

const HANDOFF_KEY = 'misc-tools:location-handoff'
const MAX_AGE_MS = 5 * 60_000

export const LOCATION_RECEIVERS = [
	'hemelsbreed',
	'coordinate-marker'
] as const satisfies readonly TToolSlug[]

export type TLocationReceiver = (typeof LOCATION_RECEIVERS)[number]

export type TLocationPoint = {
	id: string
	lat: number
	lng: number
	label: string
}

type TLocationHandoff = {
	target: TLocationReceiver
	points: TLocationPoint[]
	createdAt: number
}

function isPoint(value: unknown): value is TLocationPoint {
	const point = value as TLocationPoint | null
	return (
		!!point &&
		typeof point.id === 'string' &&
		typeof point.label === 'string' &&
		Number.isFinite(point.lat) &&
		Number.isFinite(point.lng)
	)
}

/**
 * Stages points for another tool to pick up. The receiver drains the payload on
 * mount, so navigate to `/tools/<target>` right after calling this.
 */
export function stageLocations(
	target: TLocationReceiver,
	points: TLocationPoint[]
) {
	if (typeof window === 'undefined' || points.length === 0) return
	const handoff: TLocationHandoff = {
		target,
		points,
		createdAt: Date.now()
	}
	try {
		window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff))
	} catch (error) {
		console.warn('Could not stage locations for handoff', error)
	}
}

/**
 * Returns points staged for this tool and clears them, so a refresh does not
 * re-import. Ignores payloads meant for another tool, or ones left to go stale.
 */
export function consumeLocations(target: TLocationReceiver): TLocationPoint[] {
	if (typeof window === 'undefined') return []
	try {
		const raw = window.sessionStorage.getItem(HANDOFF_KEY)
		if (!raw) return []

		const handoff = JSON.parse(raw) as TLocationHandoff
		if (handoff?.target !== target) return []

		window.sessionStorage.removeItem(HANDOFF_KEY)

		if (Date.now() - Number(handoff.createdAt) > MAX_AGE_MS) return []
		if (!Array.isArray(handoff.points)) return []

		return handoff.points.filter(isPoint)
	} catch {
		return []
	}
}
