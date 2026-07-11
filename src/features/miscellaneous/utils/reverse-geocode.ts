export type TGeocodedAddress = {
	address?: string
	street?: string
	houseNumber?: string
	postcode?: string
	city?: string
	region?: string
	country?: string
}

/**
 * Resolves a latitude/longitude pair to a human readable address via Nominatim.
 * Returns an empty object when the lookup fails, so callers can render partial
 * results without special-casing errors.
 */
export async function reverseGeocode(
	lat: number,
	lng: number
): Promise<TGeocodedAddress> {
	try {
		const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
		const response = await fetch(url, {
			headers: { Accept: 'application/json' }
		})
		if (!response.ok) return {}

		const data = await response.json()
		const address = data.address ?? {}

		return {
			address: data.display_name as string | undefined,
			street: address.road || address.pedestrian || address.footway,
			houseNumber: address.house_number,
			postcode: address.postcode,
			city:
				address.city ||
				address.town ||
				address.village ||
				address.hamlet ||
				address.municipality ||
				address.county,
			region: address.state,
			country: address.country
		}
	} catch (error) {
		console.warn('Reverse geocode failed', error)
		return {}
	}
}
