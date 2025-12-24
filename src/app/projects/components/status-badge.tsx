'use client'

import clsx from 'clsx'
import type { ProjectStatus } from '../types/project'

type Props = {
  status: ProjectStatus
}

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={clsx(
        'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        {
          'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30': status === 'finished',
          'bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/30': status === 'in progress',
          'bg-rose-500/10 text-rose-200 ring-1 ring-rose-500/30': status === 'abandoned',
        }
      )}
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  )
}
