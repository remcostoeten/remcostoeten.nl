import { eq } from 'drizzle-orm'
import { db } from '@/server/db/connection'
import { siteIntro } from '@/server/db/schema'

export type IntroContent = {
	name: string
	role: string
	bio: string
}

export const DEFAULT_INTRO: IntroContent = {
	name: 'Remco Stoeten',
	role: 'Frontend Engineer',
	bio: 'Dutch software engineer focused on front-end development with a degree in *graphic design*. **8 years** of experience across e-commerce, SaaS, government, and e-learning projects.'
}

export async function getIntro(): Promise<IntroContent> {
	try {
		const [row] = await db
			.select()
			.from(siteIntro)
			.where(eq(siteIntro.id, 1))
		if (!row) return DEFAULT_INTRO
		return { name: row.name, role: row.role, bio: row.bio }
	} catch (error) {
		console.error('[getIntro] Database error:', error)
		return DEFAULT_INTRO
	}
}
