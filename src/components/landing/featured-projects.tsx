'use client'

import { useState } from 'react'
import { ExternalLink, Github, ChevronDown } from 'lucide-react'
import { Section } from '@/components/ui/section'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Project = {
    title: string
    description: string
    tech: string[]
    github?: string
    live?: string
    details?: string
    status?: string
}

const projects: Project[] = [
    {
        title: 'Dora',
        description: 'Database manager & query runner for PostgreSQL, LibSQL, and SQLite compiled NATIVELY to macOS, Windows, and Linux. No chromeium instances',
        tech: ['Rust', 'Tauri 2.0', 'Next.js'],
        github: 'https://github.com/remcostoeten/dora',
        live: 'https://doradb.vercel.app',
        status: 'In Development',
    },
    {
        title: 'Skriuw',
        description: 'Notion-like block-based workspace fully private and self-hostable native desktop application or in the cloud on the web.',
        tech: ['Next.js', 'React', 'Tailwind', 'TypeScript', 'Tauri 2.0', 'Rust'],
        github: 'https://github.com/remcostoeten/skriuw',
        live: 'https://skriuw.vercel.app',
        status: 'In Development',
    },
    {
        title: 'Beautiful Interactive File Tree',
        description: 'Highly performant and clear file tree visualization',
        tech: ['React', 'Framer Motion', 'TypeScript'],
        github: 'https://github.com/remcostoeten/Beautiful-interactive-file-tree',
        live: 'https://beautiful-file-tree-v2.vercel.app/'
    },
    {
        title: 'React UI Sandbox Preview',
        description: 'Preview React UI components in isolation without having to spin up a sandbox environment',
        tech: ['React', 'Vite', 'Storybook'],
        github: 'https://github.com/remcostoeten/react-ui-sandbox-preview',
        live: 'https://react-ui-sandbox-preview.vercel.app',
        status: 'In Development',
    }
]

export function FeaturedProjects() {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    return (
        <Section title="Featured Projects" noHeaderMargin>
            <div className="divide-y divide-border/50">
                {projects.map((project) => {
                    const isExpanded = expandedId === project.title

                    return (
                        <div key={project.title}>
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : project.title)}
                                className="w-full px-4 py-5 flex items-start justify-between gap-4 text-left hover:bg-muted/20 transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-sm font-medium text-foreground">
                                            {project.title}
                                        </h3>
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            {project.github && (
                                                <Link
                                                    href={project.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground/50 hover:text-foreground transition-colors"
                                                >
                                                    <Github className="w-3.5 h-3.5" />
                                                </Link>
                                            )}
                                            {project.live && (
                                                <Link
                                                    href={project.live}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground/50 hover:text-foreground transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground/70">
                                        {project.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="hidden sm:flex flex-wrap gap-1.5 justify-end">
                                        {project.tech.map((tech) => (
                                            <span
                                                key={tech}
                                                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground/60"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            "w-4 h-4 text-muted-foreground/40 transition-transform duration-200",
                                            isExpanded && "rotate-180"
                                        )}
                                    />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isExpanded && project.details && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 1 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 1 }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-5 pt-0">
                                            <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                                                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                                                    {project.details}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        </Section>
    )
}
