import type { Metadata } from 'next'
import { comOrigin, nlOrigin, siteUrl } from '@/core/config/site'

/**
 * @name createAlternates
 * @description Builds the canonical and hreflang alternates for a path. The Netherlands maps to the .nl domain and every other visitor to the .com domain. The canonical is rewritten per host by the Worker.
 * @example createAlternates('/about')
 */
export function createAlternates(
	path: string
): NonNullable<Metadata['alternates']> {
	return {
		canonical: `${siteUrl}${path}`,
		languages: {
			'nl-NL': `${nlOrigin}${path}`,
			'en-NL': `${nlOrigin}${path}`,
			en: `${comOrigin}${path}`,
			'x-default': `${comOrigin}${path}`
		}
	}
}
