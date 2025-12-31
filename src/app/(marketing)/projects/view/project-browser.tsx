'use client'

import Link from 'next/link'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Project } from '../types/project'
import { formatDate } from '../utilities/date-format'
import { StackPills } from '../components/stack-pills'
import { StatusBadge } from '../components/status-badge'

type Props = {
  projects: Project[]
}

type RefMap = Record<string, HTMLButtonElement | null>

const curve = [0.16, 1, 0.3, 1] as const

export function ProjectBrowser({ projects }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const buttonRefs = useRef<RefMap>({})
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const lastSlug = useRef<string | null>(null)

  const activeIndex = useMemo(() => projects.findIndex((entry) => entry.slug === activeSlug), [projects, activeSlug])
  const activeProject = activeIndex >= 0 ? projects[activeIndex] : undefined
  const previousProject = activeIndex > 0 ? projects[activeIndex - 1] : undefined
  const nextProject = activeIndex >= 0 && activeIndex < projects.length - 1 ? projects[activeIndex + 1] : undefined

  useEffect(() => {
    if (activeProject && closeRef.current) {
      closeRef.current.focus()
    }
  }, [activeProject])

  useEffect(() => {
    if (!activeProject && lastSlug.current) {
      const target = buttonRefs.current[lastSlug.current]

      if (target) {
        target.focus()
      }
    }
  }, [activeProject])

  useEffect(() => {
    if (!activeProject) {
      return
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDetail()
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        openPrevious()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        openNext()
      }
    }

    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [activeProject, previousProject, nextProject])

  function openDetail(slug: string) {
    lastSlug.current = slug
    setActiveSlug(slug)
  }

  function closeDetail() {
    setActiveSlug(null)
  }

  function openPrevious() {
    if (previousProject) {
      openDetail(previousProject.slug)
    }
  }

  function openNext() {
    if (nextProject) {
      openDetail(nextProject.slug)
    }
  }

  function setButtonRef(slug: string, node: HTMLButtonElement | null) {
    buttonRefs.current[slug] = node
  }

  return (
    <LayoutGroup>
      <div className="grid gap-3">
        {projects.map((project) => (
          <motion.div
            key={project.slug}
            layoutId={`card-${project.slug}`}
            transition={{ duration: 0.5, ease: curve }}
            className="group rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg"
          >
            <motion.button
              type="button"
              layoutId={`trigger-${project.slug}`}
              onClick={() => openDetail(project.slug)}
              ref={(node) => setButtonRef(project.slug, node)}
              className="flex w-full flex-col gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-expanded={activeSlug === project.slug}
              aria-controls={`project-${project.slug}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <motion.span
                  layoutId={`title-${project.slug}`}
                  className="text-lg font-semibold leading-tight text-foreground"
                >
                  {project.title}
                </motion.span>
                <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {project.categories[0] ?? 'Project'}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">{project.summary}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{project.dates.year}</span>
                <StatusBadge status={project.status} />
                <span className="rounded-full border border-border/60 px-3 py-1">Updated {formatDate(project.dates.updated)}</span>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {activeProject && (
          <motion.div
            className="fixed inset-0 z-30 flex items-start justify-center bg-background/70 px-4 py-10 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: curve }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeDetail()
              }
            }}
          >
            <motion.article
              layoutId={`card-${activeProject.slug}`}
              transition={{ duration: 0.6, ease: curve }}
              className="relative w-full max-w-5xl max-h-[calc(100vh-80px)] overflow-y-auto rounded-3xl border border-border/70 bg-gradient-to-b from-background via-background-secondary/60 to-background/90 p-8 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label={`${activeProject.title} details`}
              id={`project-${activeProject.slug}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <motion.p
                    layoutId={`title-${activeProject.slug}`}
                    className="text-2xl font-semibold leading-tight text-foreground"
                  >
                    {activeProject.title}
                  </motion.p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{activeProject.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Started {formatDate(activeProject.dates.start)}</span>
                    {activeProject.dates.end && (
                      <span className="rounded-full bg-secondary/40 px-3 py-1 text-foreground">Finished {formatDate(activeProject.dates.end)}</span>
                    )}
                    <span className="rounded-full border border-border/60 px-3 py-1">Updated {formatDate(activeProject.dates.updated)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeDetail}
                  ref={closeRef}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close project details"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <StatusBadge status={activeProject.status} />
                {activeProject.categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-border/70 px-3 py-1 uppercase tracking-wide"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <StackPills stack={activeProject.stack} className="mt-4" />
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {activeProject.links?.repo && (
                  <Link
                    href={activeProject.links.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span>GitHub</span>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
                {activeProject.links?.live && (
                  <Link
                    href={activeProject.links.live}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span>Live</span>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
                {activeProject.links?.docs && (
                  <Link
                    href={activeProject.links.docs}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span>Docs</span>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeDetail}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Close
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openPrevious}
                    disabled={!previousProject}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    aria-disabled={!previousProject}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Previous
                  </button>
                  <Link
                    href={`/projects/${activeProject.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Full view
                  </Link>
                  <button
                    type="button"
                    onClick={openNext}
                    disabled={!nextProject}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    aria-disabled={!nextProject}
                  >
                    Next
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}
