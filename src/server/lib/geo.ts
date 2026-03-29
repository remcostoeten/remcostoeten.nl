type GeoInfo = {
	country?: string
	city?: string
	region?: string
	loc?: string
	org?: string
	timezone?: string
}

export async function fetchGeoInfo(ip: string): Promise<GeoInfo | null> {
	const isLocalhost =
		ip === 'unknown' ||
		ip === '127.0.0.1' ||
		ip === '::1' ||
		ip.startsWith('192.168.') ||
		ip.startsWith('10.')

	if (isLocalhost) {
		return { country: 'Local', city: 'Development' }
	}

	try {
		const token = process.env.IP_INFO_TOKEN
		if (!token) return { country: 'Unknown (no token)' }

		const response = await fetch(`https://ipinfo.io/${ip}?token=${token}`)
		if (!response.ok) return { country: 'Unknown (API error)' }

		return await response.json()
	} catch (error) {
		console.error('Failed to fetch geo info:', error)
		return { country: 'Unknown (fetch failed)' }
	}
}
