export const siteName = 'Remco Stoeten'
export const jobTitle = 'Software Engineer'
export const siteTitle = `${siteName} - ${jobTitle}`
export const contactEmail = 'stoetenremco.rs@gmail.com'
export const yearsOfExperience = 10
export const siteDescription = `Dutch software engineer focused on front-end development with ${yearsOfExperience} years of experience across e-commerce, SaaS, government, and automotive projects.`

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
export const siteUrl = (
	configuredSiteUrl || 'https://www.remcostoeten.nl'
).replace(/\/+$/, '')

export const baseUrl = siteUrl

export const nlOrigin = 'https://www.remcostoeten.nl'
export const comOrigin = 'https://www.remcostoeten.com'
