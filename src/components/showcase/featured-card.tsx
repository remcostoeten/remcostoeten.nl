import type { ComponentType, ReactNode } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { TechStack } from './tech-stack'

export type FeaturedLink = {
	label: string
	href: string
	icon: ComponentType<{ className?: string }>
}

type Props = {
	title: string
	titleHref?: Route
	description: string
	status?: string
	meta?: ReactNode
	tech: string[]
	links: FeaturedLink[]
	media: ReactNode
	backdrop?: ReactNode
	mediaSide?: 'left' | 'right' | 'top'
	seamless?: boolean
}

export function FeaturedCard({
	title,
	titleHref,
	description,
	status,
	meta,
	tech,
	links,
	media,
	backdrop,
	mediaSide = 'left',
	seamless = false
}: Props) {
	const isTop = mediaSide === 'top'

	return (
		<article
			className={cn(
				'group bg-card',
				isTop && 'flex h-full flex-col',
				mediaSide === 'left' &&
					'grid sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]',
				mediaSide === 'right' &&
					'grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'
			)}
		>
			<div
				className={cn(
					'relative aspect-[16/10] overflow-hidden',
					!isTop &&
						!seamless &&
						'border-b border-border/50 bg-background',
					mediaSide === 'left' &&
						!seamless &&
						'sm:border-b-0 sm:border-r',
					mediaSide === 'right' && 'sm:order-last',
					mediaSide === 'right' &&
						!seamless &&
						'sm:border-b-0 sm:border-l'
				)}
			>
				{media}
				{isTop && (
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card from-20% via-card/75 to-transparent" />
				)}
			</div>
			<div
				className={cn(
					'relative isolate flex min-w-0 flex-1 flex-col px-4 md:px-5',
					isTop ? '-mt-3 gap-3 pb-4' : 'justify-center gap-4 py-6'
				)}
			>
				{backdrop && (
					<div className="absolute inset-x-0 bottom-0 -z-10 h-14">
						{backdrop}
					</div>
				)}
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h3
							className={cn(
								'font-medium text-foreground',
								isTop ? 'text-base tracking-tight' : 'text-sm'
							)}
						>
							{titleHref ? (
								<Link
									href={titleHref}
									prefetch
									className="transition-colors duration-150 ease-out hover:text-muted-foreground focus-visible:outline-none focus-visible:underline"
								>
									{title}
								</Link>
							) : (
								title
							)}
						</h3>
						{status && (
							<span className="bg-foreground/10 px-1 py-px font-mono text-[10px] text-muted-foreground">
								{status}
							</span>
						)}
						{isTop && links.length > 0 && (
							<div className="-my-1 -mr-1.5 ml-auto flex items-center opacity-0 transition-opacity duration-150 ease-out focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100">
								{links.map(link => (
									<a
										key={link.label}
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`${link.label} for ${title}`}
										title={link.label}
										className="group/glyph flex size-7 items-center justify-center text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:bg-muted focus-visible:text-foreground"
									>
										<link.icon
											className="size-3.5"
											aria-hidden="true"
										/>
									</a>
								))}
							</div>
						)}
					</div>
					<p
						className={cn(
							'text-xs leading-relaxed text-muted-foreground',
							isTop ? 'line-clamp-2 min-h-[2lh]' : 'max-w-[52ch]'
						)}
					>
						{description}
					</p>
				</div>
				{!isTop && (
					<div className="flex items-center gap-3">
						<TechStack tech={tech} />
						{meta}
					</div>
				)}
				{isTop ? (
					<div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-border pt-3">
						<div className="min-w-0 overflow-hidden whitespace-nowrap">
							{meta}
						</div>
						<TechStack
							tech={tech}
							align="end"
							className="shrink-0"
						/>
					</div>
				) : (
					<div className="flex flex-wrap items-center gap-1.5">
						{links.map(link => (
							<a
								key={link.label}
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="group/glyph inline-flex items-center gap-1.5 border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:bg-muted focus-visible:text-foreground"
							>
								<link.icon
									className="size-3"
									aria-hidden="true"
								/>
								{link.label}
							</a>
						))}
					</div>
				)}
			</div>
		</article>
	)
}
