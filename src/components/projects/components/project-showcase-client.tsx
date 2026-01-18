"use client"

import { useState, memo, useMemo, lazy, Suspense, useRef, useEffect } from "react"
import type { IProject } from "../types"
import { ProjectCard } from "./project-card"

const ProjectRow = lazy(() => import("./project-row").then((m) => ({ default: m.ProjectRow })))

type Props = {
  visibleRowCount: number
  featured: IProject[]
  other: IProject[]
}

const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)"
const ROW_HEIGHT = 40

export const ProjectShowcaseClient = memo(function ProjectShowcaseClient({ visibleRowCount, featured, other }: Props) {
  const [showAll, setShowAll] = useState(false)
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0)
  const [hasSwitched, setHasSwitched] = useState(false)
  const firstCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasSwitched || !firstCardRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger when scrolling down and element is 60% past the top
        if (entry.intersectionRatio < 0.4 && entry.boundingClientRect.top < 0) {
          setActiveFeaturedIndex(1)
          setHasSwitched(true)
        }
      },
      { threshold: [0.4] },
    )

    observer.observe(firstCardRef.current)
    return () => observer.disconnect()
  }, [hasSwitched])

  const collapsedHeight = useMemo(() => visibleRowCount * ROW_HEIGHT, [visibleRowCount])
  const expandedHeight = useMemo(() => other.length * ROW_HEIGHT, [other.length])
  const totalCount = useMemo(() => other.length + featured.length, [other.length, featured.length])

  return (
    <section className="w-full max-w-3xl px-3 sm:px-0">
      <div className="flex flex-col border-l border-r border-t border-border">
        {featured.map((project, index) => (
          <div key={project.name} className="border-b border-border" ref={index === 0 ? firstCardRef : null}>
            <ProjectCard project={project} forceShowPreview={index === activeFeaturedIndex} />
          </div>
        ))}
      </div>

      <div className="relative border-l border-r border-border">
        <div
          className="flex flex-col bg-card overflow-hidden transition-all duration-500"
          style={{
            maxHeight: showAll ? `${expandedHeight}px` : `${collapsedHeight}px`,
            transitionTimingFunction: EASE_OUT_EXPO,
          }}
        >
          <Suspense fallback={null}>
            {other.map((project) => (
              <ProjectRow key={project.name} project={project} />
            ))}
          </Suspense>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-background to-transparent transition-opacity duration-500"
          style={{ opacity: showAll ? 0 : 1, transitionTimingFunction: EASE_OUT_EXPO }}
        />
      </div>

      <button
        onClick={() => setShowAll(!showAll)}
        className="mt-2 text-xs text-muted-foreground transition-all duration-300 hover:text-foreground"
        style={{ transitionTimingFunction: EASE_OUT_EXPO }}
      >
        {showAll ? "Show less" : `View all (${totalCount})`}
      </button>
    </section>
  )
})
