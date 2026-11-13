import Image from 'next/image'
import type { Route } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/section'
import { contactEmail, yearsOfExperience } from '@/core/config/site'
import {
	BreadcrumbStructuredData,
	PersonStructuredData
} from '@/components/seo/structured-data'
import {
	GithubIcon,
	LinkedinIcon,
	MailIcon,
	MapPinIcon,
	BriefcaseIcon,
	GraduationCapIcon
} from 'lucide-react'

const skillGroups = [
	{
		label: 'Frontend',
		skills: [
			'React',
			'Next.js',
			'TypeScript',
			'Tailwind CSS',
			'Framer Motion'
		]
	},
	{
		label: 'Data and APIs',
		skills: ['Node.js', 'PostgreSQL', 'Drizzle ORM', 'GraphQL']
	},
	{
		label: 'Desktop',
		skills: ['Rust', 'Tauri', 'GTK4']
	},
	{
		label: 'Workflow',
		skills: ['Bun', 'Docker', 'Vercel', 'Linux', 'Figma']
	}
]

const projects = [
	{
		name: 'Skriuw',
		description: 'A Notion-like desktop app.',
		href: 'https://skriuw.com',
		status: 'Beta'
	},
	{
		name: 'DoraDB',
		description: 'A cross-platform database manager.',
		href: 'https://doradb.app',
		status: 'Beta'
	},
	{
		name: 'Kiekje',
		description: 'A screenshot tray app for KDE Plasma and Hyprland.',
		href: 'https://github.com/remcostoeten/kiekje',
		status: 'Alpha'
	},
	{
		name: 'npm packages',
		description:
			'use-shortcut, Auth Drawer and a few more, so I never have to build the same UI twice.',
		href: '/packages',
		status: null
	}
] as const

const socialLinks = [
	{
		name: 'GitHub',
		href: 'https://github.com/remcostoeten',
		icon: GithubIcon
	},
	{
		name: 'LinkedIn',
		href: 'https://www.linkedin.com/in/remco-stoeten/',
		icon: LinkedinIcon
	},
	{
		name: 'Email me',
		href: `mailto:${contactEmail}`,
		icon: MailIcon
	}
]

const linkClassName =
	'text-foreground underline underline-offset-4 hover:text-primary transition-colors'

export function AboutView() {
	return (
		<>
			<BreadcrumbStructuredData
				items={[
					{ name: 'Home', url: '/' },
					{ name: 'About', url: '/about' }
				]}
			/>
			<PersonStructuredData />

			<div className="space-y-6">
				<header className="px-4 md:px-5">
					<div className="flex items-start gap-4 mb-6">
						<Image
							src="/images/remco-stoeten.webp"
							alt="Remco Stoeten - Frontend Engineer"
							width={224}
							height={224}
							sizes="80px"
							priority
							className="w-20 h-20 rounded-full border-2 border-border/50 shadow-sm shrink-0"
						/>
						<div className="min-w-0">
							<h1 className="text-2xl font-semibold tracking-tight text-foreground">
								Remco Stoeten
							</h1>
							<p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
								<BriefcaseIcon className="size-3.5" />
								Frontend Engineer
							</p>
							<p className="text-sm text-muted-foreground/70 mt-0.5 flex items-center gap-1.5">
								<MapPinIcon className="size-3.5" />
								Netherlands
							</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-3 mb-6">
						{socialLinks.map(link => (
							<Link
								key={link.name}
								href={link.href as Route}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 rounded-none hover:bg-muted/50 transition-colors"
							>
								<link.icon className="size-3.5" />
								{link.name}
							</Link>
						))}
					</div>
				</header>

				<Section title="About" noHeaderMargin>
					<div className="px-4 md:px-5 pt-4 pb-6 space-y-4 text-sm text-muted-foreground/90 leading-relaxed">
						<p>
							I'm a Dutch frontend engineer who started in graphic
							design and ended up{' '}
							<strong className="text-foreground">
								{yearsOfExperience} years deep in frontend
							</strong>
							. I've shipped for e-commerce, SaaS, government, and
							e-learning. Greenfield and legacy, so I've seen my
							share of both.
						</p>
						<p>
							Most of my work is React, TypeScript, and Next.js. I
							care about interfaces that feel instant and type
							systems that actually pull their weight. I hold
							unreasonably strong opinions about small things,
							like whether you should ever write an arrow
							function.
						</p>
					</div>
				</Section>

				<Section title="What I'm working on" noHeaderMargin>
					<div className="px-4 md:px-5 pt-4 pb-6 text-sm text-muted-foreground/90 leading-relaxed">
						<div>
							<h3 className="text-sm font-medium text-foreground mb-1">
								NextGen Automotive Group
							</h3>
							<p>
								By day, I build customer portals and internal
								tooling for the automotive business.
							</p>
						</div>
						<div className="mt-5 pt-4 border-t border-border/50">
							<p>
								The rest of the time I overengineer open source.
								I'm in no rush.
							</p>
							<ul className="mt-3">
								{projects.map(project => (
									<li
										key={project.name}
										className="grid gap-1 min-[480px]:grid-cols-[8.5rem_minmax(0,1fr)] min-[480px]:gap-x-4 min-[480px]:items-baseline py-3 border-b border-border/50 last:border-b-0 last:pb-0"
									>
										<div className="flex items-center gap-2.5">
											<h3 className="text-sm font-medium text-foreground">
												<Link
													href={project.href}
													className={linkClassName}
												>
													{project.name}
												</Link>
											</h3>
											{project.status && (
												<span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground whitespace-nowrap">
													<span
														aria-hidden="true"
														className="size-1 rounded-full bg-brand-500"
													/>
													{project.status}
												</span>
											)}
										</div>
										<p>{project.description}</p>
									</li>
								))}
							</ul>
						</div>
					</div>
				</Section>

				<Section title="Tools I use" noHeaderMargin>
					<div className="px-4 md:px-5 pt-4 pb-6 grid gap-4">
						{skillGroups.map(group => (
							<div
								key={group.label}
								className="grid gap-2 min-[480px]:grid-cols-[5rem_minmax(0,1fr)] min-[480px]:gap-3 min-[480px]:items-start"
							>
								<h3 className="text-xs font-normal text-muted-foreground min-[480px]:pt-1">
									{group.label}
								</h3>
								<ul
									aria-label={`${group.label} skills`}
									className="flex flex-wrap gap-2"
								>
									{group.skills.map(skill => (
										<li
											key={skill}
											className="px-2.5 py-1 text-xs font-medium text-muted-foreground bg-secondary/30 border border-transparent hover:border-border/50 rounded-md transition-colors"
										>
											{skill}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</Section>

				<Section title="Education" noHeaderMargin>
					<div className="px-4 md:px-5 pt-4 pb-6">
						<div className="flex items-start gap-3">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary border border-primary/20 mt-0.5">
								<GraduationCapIcon className="size-4" />
							</div>
							<div>
								<h3 className="text-sm font-medium text-foreground">
									Interactive Graphic Design
								</h3>
								<p className="text-xs text-muted-foreground/70 mt-0.5">
									ROC Friese Poort, 2012–2016
								</p>
								<p className="text-xs text-muted-foreground/50 mt-1.5">
									The final two years were interactive web
									design. That's where the code took over.
								</p>
							</div>
						</div>
					</div>
				</Section>

				<p className="!mt-0 px-4 md:px-5 pt-4 pb-1 border-t border-border/50 text-sm text-muted-foreground/90 leading-relaxed">
					More React and TypeScript on{' '}
					<Link href="/blog" className={linkClassName}>
						my blog
					</Link>
					, and the code on{' '}
					<Link
						href="https://github.com/remcostoeten"
						className={linkClassName}
					>
						GitHub
					</Link>
					.
				</p>
			</div>
		</>
	)
}
