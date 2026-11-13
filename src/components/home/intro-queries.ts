import { cacheLife, cacheTag } from 'next/cache'
import { RETRY_CACHE_LIFE } from '@/shared/helpers/cache-life'
import { eq } from 'drizzle-orm'
import { db } from '@/server/db/connection'
import { siteIntro } from '@/server/db/schema'
import { yearsOfExperience } from '@/core/config/site'

export type IntroContent = {
	name: string
	role: string
	bio: string
}

export const DEFAULT_INTRO: IntroContent = {
	name: 'Remco Stoeten',
	role: 'Frontend Engineer',
	bio: `Dutch software engineer focused on front-end development with a background in *graphic design*. **${yearsOfExperience} years** of experience across e-commerce, SaaS, government, and e-learning projects.`
}

export async function getIntro(): Promise<IntroContent> {
	'use cache'
	cacheTag('intro')

	try {
		const [row] = await db
			.select()
			.from(siteIntro)
			.where(eq(siteIntro.id, 1))
		cacheLife('days')
		if (!row) return DEFAULT_INTRO
		return { name: row.name, role: row.role, bio: row.bio }
	} catch (error) {
		console.error('[getIntro] Database error:', error)
		cacheLife(RETRY_CACHE_LIFE)
		return DEFAULT_INTRO
	}
}
