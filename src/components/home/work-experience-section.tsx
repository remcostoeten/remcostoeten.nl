import type { ExperienceItemType } from '@/components/ui/work-experience'
import { WorkExperience } from '@/components/ui/work-experience'
import { Section } from '@/components/ui/section'

export const WORK_EXPERIENCE: ExperienceItemType[] = [
	{
		id: 'nextgen-automotive',
		companyName: 'NextGen Automotive Group',
		companyLogo: '/logos/companies/nextgen-automotive.webp',
		tagline: 'In-house · Automotive group',
		positions: [
			{
				id: 'nextgen-automotive-developer',
				title: 'Full-Stack Developer',
				employmentPeriod: '2026 — present',
				employmentType: 'Full-time',
				description: `Building customer facing portals and internal tooling for the automotive business.`,
				skills: [
					'Preact',
					'React',
					'GraphQL/REST',
					'PHP/Symfony',
					'Elixir'
				],
				isExpanded: true
			}
		],
		isCurrentEmployer: true
	},
	{
		id: 'brainstud',
		companyName: 'Brainstud / Allyoucanlearn',
		companyLogo: '/logos/companies/brainstud-next-level.webp',
		tagline: 'In-house · E-learning platform for mbo students',
		positions: [
			{
				id: 'brainstud-frontend',
				title: 'Front End Developer',
				employmentPeriod: '2025 — 2026',
				employmentType: 'Full-time',
				location: 'Zwolle (Hybrid)',
				description: `
- Building a modern e-learning platform in Next.js, TypeScript & React Query.
- Self-driven development using Shape Up methodology in a hybrid team.`,
				skills: [
					'Next.js',
					'TypeScript',
					'React Query',
					'REST API',
					'Shape Up',
					'CSS modules'
				]
			}
		]
	},
	{
		id: 'pleio',
		companyName: 'Pleio',
		companyLogo: '/logos/companies/pleio.svg',
		tagline: 'In-house · Platforms for government & non-profits',
		positions: [
			{
				id: 'pleio-frontend',
				title: 'Front End Developer',
				employmentPeriod: '2023 — 2025',
				employmentType: 'Full-time',
				location: 'Remote',
				description: `
- Developed the open-source intranet platform (React/GraphQL) used by Dutch government bodies and non-profits.
- Rebuilt the FSV (Fraude Signalering Voorziening), the government's fraud signalling portal.
- Built pdfchecker.nl, a tool that checks PDFs against accessibility requirements.
- Held every product to WCAG AA, as required for public sector software.
- Collaborated in a Kanban flow with backend/devops on weekly releases.`,
				skills: [
					'React',
					'GraphQL',
					'Django',
					'SCSS',
					'Vanilla JS',
					'WCAG AA'
				]
			}
		]
	},
	{
		id: 'lasaulec',
		companyName: 'Lasaulec / Distil',
		companyLogo: '/logos/companies/lasaulec.svg',
		tagline: 'In-house · Technical wholesale',
		positions: [
			{
				id: 'lasaulec-frontend',
				title: 'Front End Developer',
				employmentPeriod: '2022 — 2023',
				employmentType: 'Full-time',
				location: 'Remote',
				description: `
- Rebuilt the complete webshop front-end using Razor, SCSS and JavaScript.
- Co-architected and built features for a SaaS inspection & compliance platform.
- Delivered production features autonomously for React-based internal applications.`,
				skills: ['React', 'Razor', 'JavaScript', 'SCSS']
			}
		]
	},
	{
		id: 'tickles',
		companyName: 'Tickles',
		companyLogo: '/logos/companies/tickles.webp',
		tagline: 'Agency · Magento 2 e-commerce for B2B / B2C',
		positions: [
			{
				id: 'tickles-developer',
				title: 'Front End Developer',
				employmentPeriod: '2016 — 2022',
				employmentType: 'Full-time',
				location: 'Lemmer / Joure (Office)',
				description: `
- Job offer from internship.
- Built various custom Magento 2 webshops for B2B/B2C clients.
- Developed with PHTML, BEM SCSS, and JavaScript (Vanilla, jQuery, Knockout.js).`,
				skills: [
					'Magento 2',
					'PHTML',
					'BEM SCSS',
					'JavaScript',
					'jQuery',
					'Knockout.js'
				]
			}
		]
	},
	{
		id: 'education',
		companyName: 'ROC Friese Poort',
		companyLogo: '/logos/companies/roc-friese-poort.svg',
		tagline: 'Web internship at Tickles',
		taglineArrowTo: 'tickles',
		taglineArrowLabel: 'Job offer from internship',
		positions: [
			{
				id: 'education-graphic-design',
				title: 'College - Interactive Graphic Design',
				employmentPeriod: '2012 — 2016',
				employmentType: 'Graduated',
				location: 'Sneek',
				description:
					'Studied the intersection of visual communication and technical implementation, with a strong focus on UI/UX, human-centered design, art history, and filmmaking. The final two years and internships were dedicated full time to interactive web design.',
				skills: [
					'UI/UX',
					'Web Design & Development',
					'Accessibility',
					'After Effects',
					'Photoshop'
				]
			}
		]
	}
]

export async function WorkExperienceSection() {
	const { getWorkExperiences } =
		await import('@/components/home/work-experience-queries')
	const experiences = await getWorkExperiences()
	return (
		<Section animatedStripes title="Professional Experience">
			<WorkExperience experiences={experiences} />
		</Section>
	)
}
