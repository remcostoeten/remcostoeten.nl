'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import type { Project } from '../types/project'
import { StackPills } from './stack-pills'
import { StatusBadge } from './status-badge'

type Props = {
  project: Project
  index: number
}

export function ProjectCard({ project, index }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.8, 0.4, 1],
        delay: index * 0.04,
      }}
      className="group rounded-xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg focus-within:border-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/projects/${project.slug}`}
            className="text-lg font-semibold text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            prefetch
          >
            {project.title}
          </Link>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{project.summary}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
          {project.dates.year}
        </span>
        {project.categories.map((category) => (
          <Badge key={category} variant="secondary" className="bg-secondary/60 text-xs">
            {category}
          </Badge>
        ))}
      </div>
      <StackPills stack={project.stack} className="mt-4" />
      <div className="mt-5 flex gap-3 text-sm">
        {project.links?.live && (
          <Link
            href={project.links.live}
            className="text-primary transition hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            target="_blank"
            rel="noreferrer"
          >
            Live
          </Link>
        )}
        {project.links?.repo && (
          <Link
            href={project.links.repo}
            className="text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            target="_blank"
            rel="noreferrer"
          >
            Repo
          </Link>
        )}
        {project.links?.docs && (
          <Link
            href={project.links.docs}
            className="text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </Link>
        )}
      </div>
    </motion.article>
  )
}
