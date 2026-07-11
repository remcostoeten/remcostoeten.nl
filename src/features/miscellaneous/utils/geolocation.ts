const GEOLOCATION_ERRORS: Record<number, string> = {
	1: 'Permission denied. Allow location access for this site and try again.',
	2: 'Your position is unavailable. Check that location services are enabled.',
	3: 'Timed out while locating you. Try again.'
}

export type TFix = {
	lat: number
	lng: number
	accuracy: number
	timestamp: number
}

export function geolocationErrorMessage(cause: unknown): string {
	const code = (cause as GeolocationPositionError)?.code
	return GEOLOCATION_ERRORS[code] ?? 'Could not determine your location.'
}

/** Browser geolocation as a promise, with the high-accuracy options every tool wants. */
export function locate(): Promise<TFix> {
	return new Promise((resolve, reject) => {
		if (typeof navigator === 'undefined' || !navigator.geolocation) {
			reject(new Error('Your browser does not support geolocation.'))
			return
		}

		navigator.geolocation.getCurrentPosition(
			position => {
				const { latitude, longitude, accuracy } = position.coords
				resolve({
					lat: latitude,
					lng: longitude,
					accuracy,
					timestamp: position.timestamp
				})
			},
			reject,
			{ enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
		)
	})
}
