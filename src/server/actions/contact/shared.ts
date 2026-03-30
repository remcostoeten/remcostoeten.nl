import { fetchGeoInfo } from '@/server/request'
import type { RequestClientInfo } from '@/server/request'

export async function buildContactGeoFields(ip: string) {
	const geoInfo = await fetchGeoInfo(ip)

	return {
		geoCountry: geoInfo?.country,
		geoCity: geoInfo?.city,
		geoRegion: geoInfo?.region,
		geoLoc: geoInfo?.loc,
		geoOrg: geoInfo?.org,
		geoTimezone: geoInfo?.timezone
	}
}

export async function buildContactInteractionValues(
	visitorId: string,
	clientInfo: RequestClientInfo,
	interactionType: 'button_click' | 'form_start' | 'form_abandon',
	sessionId?: string
) {
	return {
		visitorId,
		interactionType,
		ipAddress: clientInfo.ip,
		userAgent: clientInfo.userAgent,
		referrer: clientInfo.referrer,
		sessionId: sessionId || null,
		...(await buildContactGeoFields(clientInfo.ip))
	}
}

export async function buildContactAbandonmentValues(
	clientInfo: RequestClientInfo,
	visitorId: string,
	interactionId: string,
	timeToAbandon: number,
	lastFieldTouched?: string,
	formData?: Record<string, any>
) {
	return {
		visitorId,
		interactionId,
		timeToAbandon,
		lastFieldTouched: lastFieldTouched || null,
		formData: formData ? JSON.stringify(formData) : null,
		ipAddress: clientInfo.ip,
		userAgent: clientInfo.userAgent,
		referrer: clientInfo.referrer,
		...(await buildContactGeoFields(clientInfo.ip))
	}
}
