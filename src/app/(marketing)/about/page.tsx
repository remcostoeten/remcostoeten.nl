import { Metadata } from 'next'
import { yearsOfExperience } from '@/core/config/site'
import { createPageMetadata } from '@/core/metadata/base'
import { AboutView } from '@/views/marketing/about'

export const metadata: Metadata = createPageMetadata({
	title: 'About',
	description: `Learn more about Remco Stoeten, a Dutch frontend engineer with ${yearsOfExperience} years of experience, mostly in React, TypeScript and Next.js.`,
	keywords: [
		'Remco Stoeten',
		'Remco',
		'Stoeten',
		'About Remco Stoeten',
		'Frontend Engineer Netherlands',
		'React Developer',
		'TypeScript Developer',
		'Next.js Developer'
	],
	canonical: '/about'
})

export default function Page() {
	return <AboutView />
}
