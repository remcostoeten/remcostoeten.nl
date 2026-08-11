import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Check, Github, Package } from 'lucide-react'
import { Suspense } from 'react'
import { BreadcrumbStructuredData } from '@/components/seo/structured-data'
import { AuthDrawerDemo } from '@/components/packages/auth-drawer-demo'
import { NotifierDemo } from '@/components/packages/notifier-demo'
import { PackageCode } from '@/components/packages/package-code'
import { baseUrl } from '@/core/config/site'
import {
	developerPackages,
	getDeveloperPackage,
	getNpmPackage
} from '@/features/packages/data'

type Props = { params: Promise<{ slug: string }> }

export const instant = true

export function generateStaticParams() {
	return developerPackages.map(pkg => ({ slug: pkg.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const pkg = getDeveloperPackage((await params).slug)
	if (!pkg) return {}

	const title = `${pkg.name}: ${pkg.tagline}`
	return {
		title,
		description: pkg.description,
		keywords: [
			pkg.packageName,
			...pkg.keywords,
			'open source npm package',
			'Remco Stoeten'
		],
		alternates: { canonical: `${baseUrl}/packages/${pkg.slug}` },
		openGraph: {
			title,
			description: pkg.description,
			url: `${baseUrl}/packages/${pkg.slug}`,
			type: 'website',
			images: [
				{
					url: `/og?title=${encodeURIComponent(pkg.name)}`,
					width: 1200,
					height: 630,
					alt: `${pkg.name} by Remco Stoeten`
				}
			]
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description: pkg.description,
			images: [`/og?title=${encodeURIComponent(pkg.name)}`]
		}
	}
}

function PackagePageFallback() {
	return (
		<article aria-busy="true" aria-label="Loading package details">
			<header className="border-b border-border/60 px-4 pb-7 md:px-5">
				<div className="flex items-start gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 shadow-sm">
						<Package
							className="size-4 animate-pulse text-muted-foreground"
							aria-hidden="true"
						/>
					</div>
					<div className="min-w-0 flex-1 space-y-3">
						<div className="h-6 w-40 animate-pulse rounded-sm bg-muted" />
						<div className="h-4 w-full max-w-md animate-pulse rounded-sm bg-muted/70" />
					</div>
				</div>
			</header>
			<div className="space-y-3 px-4 py-7 md:px-5">
				<div className="h-4 w-full animate-pulse rounded-sm bg-muted/60" />
				<div className="h-4 w-5/6 animate-pulse rounded-sm bg-muted/50" />
				<div className="h-28 w-full animate-pulse rounded-sm bg-muted/40" />
			</div>
		</article>
	)
}

export default function PackagePage({ params }: Props) {
	return (
		<Suspense fallback={<PackagePageFallback />}>
			<PackagePageContent params={params} />
		</Suspense>
	)
}

async function PackagePageContent({ params }: Props) {
	const pkg = getDeveloperPackage((await params).slug)
	if (!pkg) notFound()

	const npmData = await getNpmPackage(pkg.packageName)
	const version = npmData?.version
	const pageUrl = `${baseUrl}/packages/${pkg.slug}`
	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'SoftwareApplication',
				'@id': `${pageUrl}#software`,
				name: pkg.name,
				description: npmData?.description ?? pkg.description,
				applicationCategory: 'DeveloperApplication',
				operatingSystem: 'Web',
				softwareVersion: version,
				license: npmData?.license,
				url: pageUrl,
				downloadUrl: pkg.npmUrl,
				author: {
					'@type': 'Person',
					name: 'Remco Stoeten',
					url: baseUrl
				},
				keywords: pkg.keywords.join(', ')
			}
		]
	}

	return (
		<article>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
				}}
			/>
			<BreadcrumbStructuredData
				items={[
					{ name: 'Packages', url: '/packages' },
					{ name: pkg.name, url: `/packages/${pkg.slug}` }
				]}
			/>

			<header className="border-b border-border/60 px-4 pb-7 md:px-5">
				<div className="flex items-start gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 shadow-sm">
						<Package
							className="size-4 text-muted-foreground"
							aria-hidden="true"
						/>
					</div>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="text-xl font-semibold tracking-tight">
								{pkg.name}
							</h1>
							{version && (
								<span className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
									v{version}
								</span>
							)}
						</div>
						<p className="mt-1 font-mono text-xs text-muted-foreground">
							{pkg.packageName}
						</p>
					</div>
				</div>
				<p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/90">
					{pkg.tagline}
				</p>
				<p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
					{pkg.description}
				</p>
				<div className="mt-5 flex flex-wrap gap-2">
					{pkg.docsUrl && (
						<ExternalLink href={pkg.docsUrl}>
							Documentation
						</ExternalLink>
					)}
					<ExternalLink href={pkg.npmUrl}>npm package</ExternalLink>
					{pkg.sourceUrl && (
						<ExternalLink
							href={pkg.sourceUrl}
							icon={<Github className="size-3.5" />}
						>
							Source
						</ExternalLink>
					)}
					{pkg.demoUrl && (
						<ExternalLink href={pkg.demoUrl}>
							Try the live drawer
						</ExternalLink>
					)}
				</div>
			</header>
			<section
				id="why"
				aria-labelledby="why-heading"
				className="border-b border-border/60 px-4 py-7 md:px-5"
			>
				<SectionLabel>What it replaces</SectionLabel>
				<h2
					id="why-heading"
					className="mt-2 text-lg font-semibold tracking-tight"
				>
					{pkg.whyHeading}
				</h2>
				<p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
					{pkg.whenToUse}
				</p>
				<ul
					className="mt-5 space-y-3"
					aria-label={`${pkg.name} highlights`}
				>
					{pkg.highlights.map(highlight => (
						<li
							key={highlight}
							className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
						>
							<Check
								className="mt-0.5 size-3.5 shrink-0 text-brand-400"
								aria-hidden="true"
							/>
							{highlight}
						</li>
					))}
				</ul>
				{pkg.slug === 'auth-drawer' && (
					<div className="mt-6">
						<AuthDrawerDemo />
					</div>
				)}
				{pkg.slug === 'notifier' && (
					<div className="mt-6">
						<NotifierDemo />
					</div>
				)}
			</section>

			<section
				id="quick-start"
				aria-labelledby="quick-start-heading"
				className="border-b border-border/60 px-4 py-7 md:px-5"
			>
				<SectionLabel>Quick start</SectionLabel>
				<h2
					id="quick-start-heading"
					className="mt-2 text-lg font-semibold tracking-tight"
				>
					Start with one small integration.
				</h2>
				<div className="mt-5 border border-border bg-muted/20 px-4 py-3 font-mono text-xs text-foreground">
					<span className="select-none text-muted-foreground">
						${' '}
					</span>
					{pkg.install}
				</div>
				<PackageCode
					code={pkg.quickStart}
					fileName={pkg.quickStartFile}
					className="mt-4"
				/>
			</section>

			<section
				id="api"
				aria-labelledby="api-heading"
				className="border-b border-border/60 px-4 py-7 md:px-5"
			>
				<SectionLabel>API examples</SectionLabel>
				<h2
					id="api-heading"
					className="mt-2 text-lg font-semibold tracking-tight"
				>
					Start with one call. Add the pieces when you need them.
				</h2>
				{pkg.apiIntro && (
					<p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
						{pkg.apiIntro}
					</p>
				)}
				<div className="mt-5 space-y-7">
					{pkg.apiExamples.map(example => (
						<div key={example.title}>
							<h3 className="text-sm font-medium">
								{example.title}
							</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
								{example.description}
							</p>
							<PackageCode
								code={example.code}
								fileName={example.fileName}
								className="mt-3"
							/>
						</div>
					))}
				</div>
				<dl className="mt-5 divide-y divide-border border-y border-border">
					{pkg.api.map(item => (
						<div
							key={item.name}
							className="grid gap-1 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-5"
						>
							<dt className="font-mono text-xs text-foreground">
								{item.name}
							</dt>
							<dd className="text-sm leading-relaxed text-muted-foreground">
								{item.description}
							</dd>
						</div>
					))}
				</dl>
				{pkg.apiDetails && (
					<div className="mt-7 space-y-6">
						{pkg.apiDetails.map(item => (
							<div key={item.name}>
								<h3 className="text-sm font-medium">
									{item.name}
								</h3>
								<code className="mt-2 block overflow-x-auto border border-border bg-muted/20 px-3 py-2 font-mono text-xs text-foreground">
									{item.signature}
								</code>
								<ul className="mt-2 divide-y divide-border border-y border-border">
									{item.arguments.map(argument => (
										<li
											key={argument.name}
											className="grid gap-1 py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4"
										>
											<code className="font-mono text-xs text-foreground">
												{argument.name}
											</code>
											<span className="text-xs leading-relaxed text-muted-foreground">
												{argument.description}
											</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				)}
			</section>
		</article>
	)
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
			{children}
		</p>
	)
}

function ExternalLink({
	href,
	children,
	icon
}: {
	href: string
	children: React.ReactNode
	icon?: React.ReactNode
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium shadow-sm transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
		>
			{icon}
			{children}
			<ArrowUpRight className="size-3" aria-hidden="true" />
		</a>
	)
}
