export const siteName = 'Remco Stoeten'

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
export const siteUrl = (configuredSiteUrl || 'https://remcostoeten.nl').replace(
	/\/+$/,
	''
)

export const baseUrl = siteUrl
