'use client'

import clsx from 'clsx'

type Props = {
  stack: string[]
  className?: string
}

export function StackPills({ stack, className }: Props) {
  return (
    <div className={clsx('flex flex-wrap gap-2 text-xs', className)}>
      {stack.map((item) => (
        <span
          key={item}
          className="rounded-full border border-border/70 bg-secondary/40 px-3 py-1 text-muted-foreground shadow-sm transition group-hover:border-primary/50 group-hover:text-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  )
}
