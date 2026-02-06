'use client'

import { useState, useMemo, ComponentType } from 'react'
import { X, Copy, Check, Code2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import {
    getEnabled,
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

function PlaygroundCard({
    entry,
    isExpanded,
    onToggle
}: {
    entry: RegistryEntry
    isExpanded: boolean
    onToggle: () => void
}) {
    const [copied, setCopied] = useState(false)
    const meta = CATEGORY_META[entry.category]
    const Icon = meta?.icon || Code2
    const PreviewComponent = 'preview' in entry && entry.preview ? entry.preview as ComponentType : null
    const FullComponent = 'component' in entry && entry.component ? entry.component as ComponentType : null

    const copyCode = async () => {
        if (entry.code) {
            await navigator.clipboard.writeText(entry.code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: BEZIER }}
            className={cn(
                "group text-left w-full",
                "border border-border/40 bg-card/30",
                "hover:border-border/60 hover:bg-muted/10",
                "transition-colors duration-200",
                isExpanded && "col-span-full"
            )}
        >
            <button
                onClick={onToggle}
                className="w-full text-left"
            >
                {PreviewComponent && !isExpanded && (
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
                        {isExpanded ? (
                            <X className="w-3 h-3 text-muted-foreground/50 ml-auto" />
                        ) : (
                            <span className="text-[10px] text-muted-foreground/40 ml-auto">Click to expand</span>
                        )}
                    </div>
                    {!isExpanded && (
                        <>
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
                        </>
                    )}
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: BEZIER }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border/30">
                            {FullComponent ? (
                                <div className="bg-muted/10">
                                    <FullComponent />
                                </div>
                            ) : PreviewComponent ? (
                                <div className="bg-muted/10 p-6">
                                    <PreviewComponent />
                                </div>
                            ) : null}

                            {entry.code && (
                                <div className="border-t border-border/30 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-muted-foreground">Source</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                copyCode()
                                            }}
                                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-3 h-3" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <pre className="text-xs font-mono text-muted-foreground bg-muted/30 p-3 overflow-x-auto">
                                        <code>{entry.code}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
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
    const [activeCategory, setActiveCategory] = useState<FilterCategory>('all')
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const enabledEntries = useMemo(function getEnabledEntries() {
        return getEnabled(PLAYGROUND_CONFIG.enabled)
    }, [])

    const filteredEntries = useMemo(function filterEntries() {
        if (activeCategory === 'all') return enabledEntries
        return enabledEntries.filter(function matchCategory(e) {
            return e.category === activeCategory
        })
    }, [enabledEntries, activeCategory])

    const availableCategories = useMemo(function getAvailableCategories() {
        const cats = new Set(enabledEntries.map(e => e.category))
        const result: FilterCategory[] = ['all']
        if (cats.has('ui')) result.push('ui')
        return result
    }, [enabledEntries])

    const counts = useMemo(function computeCounts() {
        return {
            all: enabledEntries.length,
            ui: enabledEntries.filter(e => e.category === 'ui').length,
        }
    }, [enabledEntries])

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id)
    }

    return (
        <div className="min-h-screen">
            <PlaygroundIntro />

            {availableCategories.length > 1 && (
                <div className="border-b border-border/50">
                    <div className="flex items-center gap-1 px-4">
                        {availableCategories.map(function renderTab(category, index) {
                            return (
                                <FilterTab
                                    key={category}
                                    category={category}
                                    isActive={activeCategory === category}
                                    onClick={function selectCategory() { setActiveCategory(category) }}
                                    count={counts[category] || 0}
                                    index={index}
                                />
                            )
                        })}
                    </div>
                </div>
            )}

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
                                        isExpanded={expandedId === entry.id}
                                        onToggle={() => toggleExpand(entry.id)}
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
