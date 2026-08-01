import Image from 'next/image'
import type { Route } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/section'
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
	GraduationCapIcon,
	CodeIcon
} from 'lucide-react'

const skills = [
	'React',
	'Next.js',
	'TypeScript',
	'JavaScript',
	'Tailwind CSS',
	'Node.js',
	'PostgreSQL',
	'Drizzle ORM',
	'GraphQL',
	'REST APIs',
	'Git',
	'Docker',
	'Framer Motion',
	'Figma',
	'Vercel',
	'Linux'
]

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
	{ name: 'Email', href: 'mailto:remcostoeten@gmail.com', icon: MailIcon }
]

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

					<div className="flex gap-3 mb-6">
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

				<Section title="About Me" noHeaderMargin>
					<div className="px-4 pt-4 pb-6 space-y-4">
						<p className="text-sm text-muted-foreground/90 leading-relaxed">
							I'm{' '}
							<strong className="text-foreground">
								Remco Stoeten
							</strong>
							, a Dutch frontend engineer who started out in
							graphic design and ended up{' '}
							<strong className="text-foreground">8 years</strong>{' '}
							deep in React and TypeScript. Along the way I've
							shipped for e-commerce, SaaS, government, and
							e-learning, so I've seen my share of both greenfield
							and legacy.
						</p>
						<p className="text-sm text-muted-foreground/90 leading-relaxed">
							Most of my work is React, TypeScript, and Next.js. I
							care about interfaces that feel instant, type
							systems that actually pull their weight, and I hold
							unreasonably strong opinions about small things,
							like whether you should ever write an arrow
							function.
						</p>
						<p className="text-sm text-muted-foreground/90 leading-relaxed">
							By day I'm at{' '}
							<strong className="text-foreground">
								NextGen Automotive Group
							</strong>
							, building customer portals and internal tooling for
							the automotive business. The rest of the time I
							overengineer open source:{' '}
							<strong className="text-foreground">Skriuw</strong>,
							a Notion-like desktop app,{' '}
							<strong className="text-foreground">DoraDB</strong>,
							a cross-platform database manager, and a handful of
							npm packages that exist so I never have to build the
							same UI twice. The first two are in beta, and I'm in
							no rush.
						</p>
					</div>
				</Section>

				<Section title="Education" noHeaderMargin>
					<div className="px-4 pt-4 pb-6">
						<div className="flex items-start gap-3">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary border border-primary/20 mt-0.5">
								<GraduationCapIcon className="size-4" />
							</div>
							<div>
								<h3 className="text-sm font-medium text-foreground">
									Graphic Design
								</h3>
								<p className="text-xs text-muted-foreground/70 mt-0.5">
									Bachelor's Degree
								</p>
								<p className="text-xs text-muted-foreground/50 mt-0.5">
									Final two years spent on interactive web
									design, which is where the code took over
								</p>
							</div>
						</div>
					</div>
				</Section>

				<Section title="Skills & Technologies" noHeaderMargin>
					<div className="px-4 pt-4 pb-6">
						<div className="flex flex-wrap gap-2">
							{skills.map(skill => (
								<span
									key={skill}
									className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground bg-secondary/30 border border-transparent hover:border-border/50 rounded-md transition-colors"
								>
									<CodeIcon className="size-3" />
									{skill}
								</span>
							))}
						</div>
					</div>
				</Section>

				<Section title="Get In Touch" noHeaderMargin>
					<div className="px-4 pt-4 pb-6 space-y-3">
						<p className="text-sm text-muted-foreground/90 leading-relaxed">
							Interested in working together or just want to say
							hi? Feel free to reach out through any of the
							channels above, or check out my work on{' '}
							<Link
								href="https://github.com/remcostoeten"
								className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
							>
								GitHub
							</Link>
							.
						</p>
						<p className="text-sm text-muted-foreground/90 leading-relaxed">
							You can also explore my{' '}
							<Link
								href="/blog"
								className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
							>
								blog
							</Link>{' '}
							where I write about frontend development, React,
							TypeScript, and other tech topics.
						</p>
					</div>
				</Section>
			</div>
		</>
	)
}
