import { Suspense } from 'react'
import { RepoCard } from './repo-card'
import { RepoCardSkeleton } from './repo-card-skeleton'

type Props = {
	repo: string
	release?: boolean
}

export function GitHubRepo({ repo, release }: Props) {
	return (
		<Suspense fallback={<RepoCardSkeleton />}>
			<RepoCard repo={repo} release={release} />
		</Suspense>
	)
}
