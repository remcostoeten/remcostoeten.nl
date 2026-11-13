export const siteName = 'Remco Stoeten'
export const contactEmail = 'stoetenremco.rs@gmail.com'
export const yearsOfExperience = 10

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
export const siteUrl = (
	configuredSiteUrl || 'https://www.remcostoeten.nl'
).replace(/\/+$/, '')

export const baseUrl = siteUrl
