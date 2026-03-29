import { Metadata } from 'next'
import { createPageMetadata } from '@/core/metadata/base'
import { AboutView } from '@/views/marketing/about'

export const metadata: Metadata = createPageMetadata({
	title: 'About Remco Stoeten',
	description:
		'Learn more about Remco Stoeten, a Dutch frontend engineer with 8 years of experience in React, TypeScript, Next.js, and modern web development.',
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
