'use client'

import { useState, useEffect, useMemo, ComponentType } from 'react'
import { useSearchParams } from 'next/navigation'
import { Code2, ChevronRight, ExternalLink, Github } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import {
    getAll,
    getEnabled,
    getCounts,
    CATEGORY_META,
    PLAYGROUND_CONFIG,
} from '@/core/playground'
import type { PlaygroundCategory as CategoryType, RegistryEntry } from '@/core/playground'
import { initializeRegistry } from '@/core/playground/entries'

initializeRegistry()

type FilterCategory = CategoryType | 'all'

const BEZIER = [0.16, 1, 0.3, 1] as const

function PlaygroundIntro() {
    return (
        <div className="border-b border-border/50">
            <div className="px-4 py-6">
                <Breadcrumbs />
                <h1 className="text-lg font-medium text-foreground mb-2">Playground</h1>
                <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xl">
                    A collection of components, utilities, and experiments. These artifacts are
                    intentionally small or experimental and do not warrant their own repositories.
                    Browse, copy, and adapt as needed.
                </p>
            </div>
        </div>
    )
}

function FilterTab({
    category,
    isActive,
    onClick,
    count,
    index,
}: {
    category: FilterCategory
    isActive: boolean
    onClick: () => void
    count: number
    index: number
}) {
    const label = category === 'all' ? 'All' : CATEGORY_META[category].label

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative px-3 py-2 text-xs font-medium transition-colors",
                isActive
                    ? "text-foreground"
                    : "text-muted-foreground/60 hover:text-muted-foreground"
            )}
        >
            <span className="relative z-10 flex items-center gap-1.5">
                <kbd className={cn(
                    "hidden sm:inline-flex items-center justify-center w-4 h-4 text-[9px] font-mono border",
                    isActive
                        ? "border-foreground/20 text-foreground/60"
                        : "border-border/40 text-muted-foreground/30"
                )}>
                    {index + 1}
                </kbd>
                {label}
                <span className={cn(
                    "text-[10px] tabular-nums",
                    isActive ? "text-muted-foreground" : "text-muted-foreground/40"
                )}>
                    {count}
                </span>
            </span>
            {isActive && (
                <motion.div
                    layoutId="playgroundFilter"
                    className="absolute inset-x-0 -bottom-px h-px bg-foreground"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
            )}
        </button>
    )
}

function PlaygroundCard({ entry, onClick }: { entry: RegistryEntry; onClick: () => void }) {
    const meta = CATEGORY_META[entry.category]
    const Icon = meta?.icon || Code2
    const PreviewComponent = 'preview' in entry && entry.preview ? entry.preview as ComponentType : null

    return (
        <motion.button
            layout
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: 20, scale: 0.95 }}
            transition={{
                duration: 0.4,
                ease: BEZIER,
            }}
            onClick={onClick}
            className={cn(
                "group text-left w-full",
                "border border-border/40 bg-card/30",
                "hover:border-border/60 hover:bg-muted/10",
                "transition-colors duration-200"
            )}
        >
            {PreviewComponent && (
                <div className="border-b border-border/30 bg-muted/20">
                    <PreviewComponent />
                </div>
            )}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary/90 transition-colors">
                        {entry.title}
                    </h3>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/30 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground/60 mb-3">{entry.description}</p>
                <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map(function renderTag(tag) {
                        return (
                            <span
                                key={tag}
                                className="text-[9px] font-mono text-muted-foreground/40 px-1.5 py-0.5 border border-border/30"
                            >
                                {tag}
                            </span>
                        )
                    })}
                </div>
                {entry.github && (
                    <a
                        href={entry.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={function stopPropagation(e) { e.stopPropagation() }}
                        className="inline-flex items-center gap-1 mt-3 text-[10px] text-muted-foreground/50 hover:text-foreground transition-colors"
                    >
                        <Github className="w-3 h-3" />
                        View on GitHub
                        <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                )}
            </div>
        </motion.button>
    )
}

function EmptyState() {
    return (
        <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground/60">
                No items enabled. Edit <code className="text-xs bg-muted/30 px-1.5 py-0.5">config.ts</code> to enable entries.
            </p>
        </div>
    )
}

export function PlaygroundView() {
    const searchParams = useSearchParams()
    const filterParam = searchParams.get('filter') as FilterCategory | null
    const [activeCategory, setActiveCategory] = useState<FilterCategory>(filterParam || 'all')
    const [selectedEntry, setSelectedEntry] = useState<RegistryEntry | null>(null)

    useEffect(function syncFilter() {
        const categories: FilterCategory[] = ['all', 'snippet', 'ui', 'package', 'cli']
        if (filterParam && categories.includes(filterParam as FilterCategory)) {
            setActiveCategory(filterParam as FilterCategory)
        }
    }, [filterParam])

    useEffect(function handleKeyboard() {
        const categories: FilterCategory[] = ['all', 'snippet', 'ui', 'package', 'cli']

        function handleKeyDown(e: KeyboardEvent) {
            if (selectedEntry) return
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            const key = parseInt(e.key)
            if (key >= 1 && key <= categories.length) {
                setActiveCategory(categories[key - 1])
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return function cleanup() {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [selectedEntry])

    const allEntries = useMemo(function getAllEntries() {
        return getAll()
    }, [])

    const enabledEntries = useMemo(function getEnabledEntries() {
        return getEnabled(PLAYGROUND_CONFIG.enabled)
    }, [])

    const filteredEntries = useMemo(function filterEntries() {
        const source = enabledEntries
        if (activeCategory === 'all') return source
        return source.filter(function matchCategory(e) {
            return e.category === activeCategory
        })
    }, [enabledEntries, activeCategory])

    const counts = useMemo(function computeCounts() {
        const enabledCounts = {
            all: enabledEntries.length,
            snippet: enabledEntries.filter(function isSnippet(e) { return e.category === 'snippet' }).length,
            ui: enabledEntries.filter(function isUi(e) { return e.category === 'ui' }).length,
            package: enabledEntries.filter(function isPackage(e) { return e.category === 'package' }).length,
            cli: enabledEntries.filter(function isCli(e) { return e.category === 'cli' }).length,
        }
        return enabledCounts
    }, [enabledEntries])

    const categories: FilterCategory[] = ['all', 'snippet', 'ui', 'package', 'cli']

    return (
        <div className="min-h-screen">
            <PlaygroundIntro />

            <div className="border-b border-border/50">
                <div className="flex items-center gap-1 px-4">
                    {categories.map(function renderTab(category, index) {
                        return (
                            <FilterTab
                                key={category}
                                category={category}
                                isActive={activeCategory === category}
                                onClick={function selectCategory() { setActiveCategory(category) }}
                                count={counts[category]}
                                index={index}
                            />
                        )
                    })}
                </div>
            </div>

            <div className="p-4">
                {filteredEntries.length === 0 ? (
                    <EmptyState />
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredEntries.map(function renderCard(entry) {
                                return (
                                    <PlaygroundCard
                                        key={entry.id}
                                        entry={entry}
                                        onClick={function selectEntry() { setSelectedEntry(entry) }}
                                    />
                                )
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
