'use client'

import Link from 'next/link'
import { ExternalLink, Star } from 'lucide-react'
import { SandboxConfig } from '../types/project'
import { StackPills } from './stack-pills'

type Props = {
  sandbox?: SandboxConfig
  title: string
  summary: string
  stack: string[]
}

export function SandboxFrame({ sandbox, title, summary, stack }: Props) {
  if (!sandbox) {
    return null
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Sandbox preview</span>
          {sandbox.note && <span className="text-xs text-muted-foreground">{sandbox.note}</span>}
        </div>
        <div className="flex items-center gap-2">
          {sandbox.source && (
            <Link
              href={sandbox.source}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-3 w-3" aria-hidden />
              Source
            </Link>
          )}
          {sandbox.star && (
            <Link
              href={sandbox.star}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              target="_blank"
              rel="noreferrer"
            >
              <Star className="h-3 w-3" aria-hidden />
              Star
            </Link>
          )}
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-border/70 bg-background-secondary/30 p-6 text-sm text-muted-foreground">
        <div className="rounded-lg border border-border/60 bg-gradient-to-br from-background-secondary/40 to-background p-4 shadow-sm">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{summary}</p>
          <StackPills stack={stack} className="mt-3" />
        </div>
      </div>
    </div>
  )
}
