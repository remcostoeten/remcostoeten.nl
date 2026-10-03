import {
	ArrowUpRight,
	CircleDot,
	GitFork,
	Github,
	Scale,
	Star,
	Tag
} from 'lucide-react'
import Image from 'next/image'
import { formatDate } from '@/shared/lib/date'
import { getRepoCard } from '../api/queries/repo-card'

type CardProps = {
	repo: string
	release?: boolean
}

type FallbackProps = {
	repo: string
}

const COMPACT_NUMBER = new Intl.NumberFormat('en-US', {
	notation: 'compact',
	maximumFractionDigits: 1
})

function FallbackLink({ repo }: FallbackProps) {
	return (
		<a
			href={`https://github.com/${repo}`}
			target="_blank"
			rel="noopener noreferrer"
			className="not-prose my-8 flex items-center gap-2 border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<Github className="h-4 w-4 shrink-0" />
			<span className="font-mono">{repo}</span>
			<ArrowUpRight className="ml-auto h-4 w-4 shrink-0" />
		</a>
	)
}

export async function RepoCard({ repo, release = true }: CardProps) {
	const result = await getRepoCard(repo)

	if (!result.ok) {
		return <FallbackLink repo={repo} />
	}

	const card = result.data
	const latest = release ? card.release : null

	return (
		<a
			href={card.url}
			target="_blank"
			rel="noopener noreferrer"
			className="not-prose group my-8 block border border-border/60 bg-muted/20 p-4 no-underline transition-colors hover:border-border hover:bg-muted/40"
		>
			<div className="flex items-center gap-3">
				<Image
					src={card.owner.avatarUrl}
					alt={card.owner.login}
					width={32}
					height={32}
					className="h-8 w-8 rounded-full"
				/>
				<div className="min-w-0 flex-1">
					<p className="truncate font-mono text-sm text-foreground">
						<span className="text-muted-foreground">
							{card.owner.login}/
						</span>
						{card.name}
					</p>
					{card.archived && (
						<p className="text-xs text-muted-foreground">
							Archived
						</p>
					)}
				</div>
				<ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-[color,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
			</div>

			{card.description && (
				<p className="mt-3 text-sm text-muted-foreground">
					{card.description}
				</p>
			)}

			{card.topics.length > 0 && (
				<ul className="mt-3! mb-0! flex list-none flex-wrap gap-1.5 pl-0!">
					{card.topics.slice(0, 6).map(topic => (
						<li
							key={topic}
							className="my-0! border border-border/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
						>
							{topic}
						</li>
					))}
				</ul>
			)}

			<dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
				{card.language && (
					<div className="flex items-center gap-1.5">
						<dt className="sr-only">Language</dt>
						<span className="h-2 w-2 rounded-full bg-muted-foreground" />
						<dd>{card.language}</dd>
					</div>
				)}
				<div className="flex items-center gap-1.5">
					<dt className="sr-only">Stars</dt>
					<Star className="h-3.5 w-3.5" />
					<dd>{COMPACT_NUMBER.format(card.stars)}</dd>
				</div>
				<div className="flex items-center gap-1.5">
					<dt className="sr-only">Forks</dt>
					<GitFork className="h-3.5 w-3.5" />
					<dd>{COMPACT_NUMBER.format(card.forks)}</dd>
				</div>
				<div className="flex items-center gap-1.5">
					<dt className="sr-only">Open issues and pull requests</dt>
					<CircleDot className="h-3.5 w-3.5" />
					<dd>{COMPACT_NUMBER.format(card.issues)}</dd>
				</div>
				{card.license && (
					<div className="flex items-center gap-1.5">
						<dt className="sr-only">License</dt>
						<Scale className="h-3.5 w-3.5" />
						<dd>{card.license}</dd>
					</div>
				)}
				{latest && (
					<div className="flex items-center gap-1.5 sm:ml-auto">
						<dt className="sr-only">Latest release</dt>
						<Tag className="h-3.5 w-3.5" />
						<dd className="font-mono">
							{latest.tag}
							{latest.publishedAt && (
								<span className="font-sans">
									{' '}
									· {formatDate(latest.publishedAt)}
								</span>
							)}
						</dd>
					</div>
				)}
			</dl>
		</a>
	)
}
