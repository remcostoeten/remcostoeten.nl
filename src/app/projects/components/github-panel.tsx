import Link from 'next/link'
import { ExternalLink, GitBranch, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import type { GithubRef } from '../types/project'
import { getGithubData } from '../api/queries/github'
import { formatDate } from '../utilities/date-format'

type Props = {
  github?: GithubRef
}

export async function GithubPanel({ github }: Props) {
  if (!github) {
    return null
  }

  const data = await getGithubData(github)

  if (!data) {
    return (
      <div className="rounded-xl border border-border/70 bg-card/60 p-4 text-sm text-muted-foreground">
        GitHub data is unavailable right now, but the rest of the page is ready.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">GitHub</div>
          <p className="text-xs text-muted-foreground">Repository health and engagement</p>
        </div>
        <Link
          href={data.url}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          target="_blank"
          rel="noreferrer"
        >
          Open
          <ExternalLink className="h-3 w-3" aria-hidden />
        </Link>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted-foreground md:grid-cols-3">
        <DataItem label="Created" value={formatDate(data.createdAt)} />
        <DataItem label="Updated" value={formatDate(data.updatedAt)} />
        {data.license && <DataItem label="License" value={data.license} />}
        {data.stars && (
          <DataItem
            label="Stars"
            value={
              <span className="inline-flex items-center gap-1 text-foreground">
                <Star className="h-4 w-4 text-amber-300" aria-hidden />
                {data.stars}
              </span>
            }
          />
        )}
        <DataItem
          label="Forks"
          value={
            <span className="inline-flex items-center gap-1 text-foreground">
              <GitBranch className="h-4 w-4 text-primary" aria-hidden />
              {data.forks ?? 0}
            </span>
          }
        />
      </dl>
    </div>
  )
}

type ItemProps = {
  label: string
  value?: ReactNode
}

function DataItem({ label, value }: ItemProps) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  return (
    <div className="space-y-1">
      <dt className="text-xs uppercase tracking-wide">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  )
}
