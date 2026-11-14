import { siteTitle, yearsOfExperience } from '@/core/config/site'
import { createPageMetadata } from './base'

export const homeMetadata = createPageMetadata({
	title: siteTitle,
	description: `Remco Stoeten, software engineer from the Netherlands. ${yearsOfExperience} years building for the web, mostly React and TypeScript. Occasional thoughts on code, design, and overengineering side projects.`,
	keywords: [
		'personal blog',
		'portfolio',
		'engineering',
		'design',
		'web development',
		'react',
		'typescript',
		'css',
		'frontend',
		'programming',
		'npm packages',
		'React libraries',
		'open source developer tools'
	],
	canonical: '/'
})
