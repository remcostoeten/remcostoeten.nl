import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Github, Package } from 'lucide-react'
import { Suspense } from 'react'
import { AuthDrawerDemo } from '@/components/packages/auth-drawer-demo'
import { EmptyStatesDemo } from '@/components/packages/empty-states-demo'
import { NotifierDemo } from '@/components/packages/notifier-demo'
import { PackageCode } from '@/components/packages/package-code'
import { PackageStructuredData, packageMetadata } from '../package-seo'
import { PackageApiList, PackageWhy } from '../package-sections'
import {
	developerPackages,
	getDeveloperPackage,
	getNpmPackage,
	type DeveloperPackage
} from '@/features/packages/data'

type Props = { params: Promise<{ slug: string }> }

const staticRoutes = new Set(['empty-states', 'animated-icons'])

export const instant = true

export function generateStaticParams() {
	return developerPackages
		.filter(pkg => !staticRoutes.has(pkg.slug))
		.map(pkg => ({ slug: pkg.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const pkg = getDeveloperPackage((await params).slug)
	if (!pkg) return {}

	return packageMetadata(pkg)
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

	const npmData = pkg.npmUrl ? await getNpmPackage(pkg.packageName) : null
	const version = npmData?.version
	const hideSectionLabels = pkg.slug === 'use-shortcut'
	const structuredData = <PackageStructuredData pkg={pkg} npmData={npmData} />

	return (
		<article>
			{structuredData}

			<header className="border-b border-border/60 px-4 pb-7 md:px-5">
				<div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-3">
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
							{pkg.npmUrl && (
								<ExternalLink href={pkg.npmUrl}>
									npm package
								</ExternalLink>
							)}
							{pkg.registryUrl && (
								<ExternalLink href={pkg.registryUrl}>
									Registry item
								</ExternalLink>
							)}
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
					</div>
				</div>
			</header>
			{pkg.slug === 'use-shortcut' && (
				<PackageQuickStart
					pkg={pkg}
					hideSectionLabels={hideSectionLabels}
				/>
			)}
			{pkg.slug !== 'animated-icons' && (
				<PackageWhy pkg={pkg} hideLabel={hideSectionLabels}>
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
					{pkg.slug === 'empty-states' && (
						<div className="mt-6">
							<EmptyStatesDemo />
						</div>
					)}
				</PackageWhy>
			)}

			{pkg.slug !== 'use-shortcut' && (
				<PackageQuickStart
					pkg={pkg}
					hideSectionLabels={hideSectionLabels}
				/>
			)}

			<section
				id="api"
				aria-labelledby="api-heading"
				className="border-b border-border/60 px-4 py-7 md:px-5"
			>
				<h2
					id="api-heading"
					className={`${hideSectionLabels ? '' : 'mt-2 '}text-lg font-semibold tracking-tight`}
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
				<PackageApiList pkg={pkg} />
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

type PackageQuickStartProps = {
	pkg: DeveloperPackage
	hideSectionLabels: boolean
}

function PackageQuickStart({ pkg, hideSectionLabels }: PackageQuickStartProps) {
	return (
		<section
			id="quick-start"
			aria-labelledby="quick-start-heading"
			className={`${hideSectionLabels ? 'py-5' : 'py-7'} border-b border-border/60 px-4 md:px-5`}
		>
			{!hideSectionLabels && (
				<div className="mt-5 border border-border bg-muted/20 px-4 py-3 font-mono text-xs text-foreground">
					<span className="select-none text-muted-foreground">
						${' '}
					</span>
					{pkg.install}
				</div>
			)}
			<PackageCode
				code={pkg.quickStart}
				fileName={pkg.quickStartFile}
				className={hideSectionLabels ? 'mt-3' : 'mt-4'}
			/>
		</section>
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
