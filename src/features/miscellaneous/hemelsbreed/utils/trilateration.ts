import type { TRadiusCircle } from '../types'

const EARTH_RADIUS_KM = 6371
const MAX_ITERATIONS = 100
const CONVERGENCE_KM = 1e-6

export type TTrilaterationEstimate = {
	lat: number
	lng: number
	errorKm: number
	residuals: { id: string; label: string; km: number }[]
}

function toRad(degrees: number): number {
	return (degrees * Math.PI) / 180
}

function toDeg(radians: number): number {
	return (radians * 180) / Math.PI
}

/**
 * Least-squares multilateration. Projects circle centres onto a local plane
 * around their centroid and runs Gauss-Newton to find the point whose
 * distance to every centre best matches that circle's radius. Needs at least
 * three visible circles for a unique solution; returns null otherwise.
 * errorKm is the RMS mismatch — how far off the radii are at the best point.
 */
export function trilaterate(
	circles: TRadiusCircle[]
): TTrilaterationEstimate | null {
	const points = circles.filter(circle => circle.visible)
	if (points.length < 3) return null

	const lat0 = points.reduce((sum, p) => sum + p.lat, 0) / points.length
	const lng0 = points.reduce((sum, p) => sum + p.lng, 0) / points.length
	const cosLat0 = Math.cos(toRad(lat0))

	const centers = points.map(point => ({
		x: EARTH_RADIUS_KM * toRad(point.lng - lng0) * cosLat0,
		y: EARTH_RADIUS_KM * toRad(point.lat - lat0),
		r: point.radiusKm
	}))

	let x = 0
	let y = 0

	for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
		let jtj00 = 0
		let jtj01 = 0
		let jtj11 = 0
		let jtf0 = 0
		let jtf1 = 0

		for (const center of centers) {
			const dx = x - center.x
			const dy = y - center.y
			const distance = Math.hypot(dx, dy)
			if (distance < 1e-9) continue
			const ux = dx / distance
			const uy = dy / distance
			const residual = distance - center.r
			jtj00 += ux * ux
			jtj01 += ux * uy
			jtj11 += uy * uy
			jtf0 += ux * residual
			jtf1 += uy * residual
		}

		const damping = 1e-6
		jtj00 += damping
		jtj11 += damping
		const det = jtj00 * jtj11 - jtj01 * jtj01
		if (Math.abs(det) < 1e-12) break

		const stepX = (jtj11 * jtf0 - jtj01 * jtf1) / det
		const stepY = (jtj00 * jtf1 - jtj01 * jtf0) / det
		x -= stepX
		y -= stepY

		if (Math.hypot(stepX, stepY) < CONVERGENCE_KM) break
	}

	const residuals = points.map((point, index) => {
		const center = centers[index]
		const km = Math.hypot(x - center.x, y - center.y) - center.r
		return { id: point.id, label: point.label, km }
	})
	const errorKm = Math.sqrt(
		residuals.reduce((sum, entry) => sum + entry.km ** 2, 0) /
			residuals.length
	)

	return {
		lat: lat0 + toDeg(y / EARTH_RADIUS_KM),
		lng: lng0 + toDeg(x / (EARTH_RADIUS_KM * cosLat0)),
		errorKm,
		residuals
	}
}
