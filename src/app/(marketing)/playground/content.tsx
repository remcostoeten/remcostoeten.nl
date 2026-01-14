'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Code2, Palette, Package, Terminal, Copy, Check, ExternalLink, Github, ArrowLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { motion, AnimatePresence } from 'framer-motion'

const bezier = [0.16, 1, 0.3, 1] as const // Smooth elastic-like bezier

type PlaygroundCategory = 'all' | 'snippets' | 'ui' | 'packages' | 'cli'

type PlaygroundItem = {
    id: string
    title: string
    description: string
    category: PlaygroundCategory
    language?: string
    preview?: React.ReactNode
    code?: string
    github?: string
    demo?: string
    tags: string[]
}

const categoryConfig: Record<Exclude<PlaygroundCategory, 'all'>, { label: string; icon: typeof Code2 }> = {
    snippets: { label: 'Snippets', icon: Code2 },
    ui: { label: 'UI', icon: Palette },
    packages: { label: 'Packages', icon: Package },
    cli: { label: 'CLI', icon: Terminal },
}

const demoItems: PlaygroundItem[] = [
    {
        id: 'copy-button',
        title: 'Animated Copy Button',
        description: 'A sleek copy-to-clipboard button with state transitions',
        category: 'ui',
        language: 'tsx',
        tags: ['React', 'Animation', 'Component'],
        code: `function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <button onClick={copy}>
      {copied ? <Check /> : <Copy />}
    </button>
  )
}`,
        preview: <CopyButtonDemo />,
    },
    {
        id: 'gradient-border',
        title: 'Gradient Border Card',
        description: 'CSS-only animated gradient border effect',
        category: 'ui',
        language: 'css',
        tags: ['CSS', 'Animation', 'Effect'],
        code: `.gradient-border {
  position: relative;
  background: var(--background);
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 50%,
    #f59e0b 100%
  );
  mask: linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
  mask-composite: exclude;
}`,
        preview: <GradientBorderDemo />,
    },
    {
        id: 'use-debounce',
        title: 'useDebounce Hook',
        description: 'Debounce any value with a custom delay',
        category: 'snippets',
        language: 'ts',
        tags: ['React', 'Hook', 'Utility'],
        code: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [value, delay])
  
  return debouncedValue
}`,
        preview: <DebounceDemo />,
    },
]

function CopyButtonDemo() {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex items-center justify-center p-6">
            <button
                onClick={handleCopy}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium",
                    "border border-border/50 bg-muted/30",
                    "hover:bg-muted/50 transition-all duration-200",
                    copied && "border-emerald-500/50 text-emerald-400"
                )}
            >
                <AnimatePresence mode="wait">
                    {copied ? (
                        <motion.span
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Copied!
                        </motion.span>
                    ) : (
                        <motion.span
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Copy code
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>
        </div>
    )
}

function GradientBorderDemo() {
    return (
        <div className="flex items-center justify-center p-6">
            <div className="relative p-[1px] overflow-hidden">
                <div
                    className="absolute inset-0 animate-spin-slow"
                    style={{
                        background: 'conic-gradient(from 0deg, #667eea, #764ba2, #f59e0b, #667eea)',
                        animationDuration: '3s',
                    }}
                />
                <div className="relative bg-background px-6 py-4">
                    <p className="text-sm text-foreground">Gradient border card</p>
                    <p className="text-xs text-muted-foreground/60">CSS animation effect</p>
                </div>
            </div>
        </div>
    )
}

function DebounceDemo() {
    const [value, setValue] = useState('')
    const [debouncedValue, setDebouncedValue] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setValue(newValue)
        const timeout = setTimeout(() => setDebouncedValue(newValue), 500)
        return () => clearTimeout(timeout)
    }

    return (
        <div className="p-6 space-y-3">
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder="Type something..."
                className={cn(
                    "w-full px-3 py-2 text-sm bg-transparent",
                    "border border-border/50 focus:border-border",
                    "outline-none placeholder:text-muted-foreground/40"
                )}
            />
            <div className="flex justify-between text-xs">
                <span className="text-muted-foreground/50">Debounced:</span>
                <span className="text-muted-foreground font-mono">{debouncedValue || '—'}</span>
            </div>
        </div>
    )
}

function PlaygroundCard({ item, onClick }: { item: PlaygroundItem; onClick: () => void }) {
    const config = categoryConfig[item.category as keyof typeof categoryConfig]
    const Icon = config?.icon || Code2

    return (
        <motion.button
            layout
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: 20, scale: 0.95 }}
            transition={{ 
                duration: 0.4,
                ease: bezier
            }}
            onClick={onClick}
            className={cn(
                "group text-left w-full",
                "border border-border/40 bg-card/30",
                "hover:border-border/60 hover:bg-muted/10",
                "transition-colors duration-200"
            )}
        >
            <div className="border-b border-border/30 bg-muted/20">
                {item.preview}
            </div>
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary/90 transition-colors">
                        {item.title}
                    </h3>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/30 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground/60 mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                        <span
                            key={tag}
                            className="text-[9px] font-mono text-muted-foreground/40 px-1.5 py-0.5 border border-border/30"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.button>
    )
}

function FilterTab({
    category,
    isActive,
    onClick,
    count,
    index
}: {
    category: PlaygroundCategory
    isActive: boolean
    onClick: () => void
    count: number
    index: number
}) {
    const label = category === 'all' ? 'All' : categoryConfig[category].label

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

export function PlaygroundContent() {
    const searchParams = useSearchParams()
    const filterParam = searchParams.get('filter') as PlaygroundCategory | null
    const [activeCategory, setActiveCategory] = useState<PlaygroundCategory>(filterParam || 'all')
    const [selectedItem, setSelectedItem] = useState<PlaygroundItem | null>(null)

    useEffect(() => {
        if (filterParam && ['snippets', 'ui', 'packages', 'cli'].includes(filterParam)) {
            setActiveCategory(filterParam)
        }
    }, [filterParam])

    useEffect(() => {
        const categories: PlaygroundCategory[] = ['all', 'snippets', 'ui', 'packages', 'cli']
        
        function handleKeyDown(e: KeyboardEvent) {
            if (selectedItem) return
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            
            const key = parseInt(e.key)
            if (key >= 1 && key <= categories.length) {
                setActiveCategory(categories[key - 1])
            }
        }
        
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedItem])

    const filteredItems = activeCategory === 'all'
        ? demoItems
        : demoItems.filter(item => item.category === activeCategory)

    const categoryCounts = {
        all: demoItems.length,
        snippets: demoItems.filter(i => i.category === 'snippets').length,
        ui: demoItems.filter(i => i.category === 'ui').length,
        packages: demoItems.filter(i => i.category === 'packages').length,
        cli: demoItems.filter(i => i.category === 'cli').length,
    }

    return (
        <div className="min-h-screen">
            <div className="border-b border-border/50">
                <div className="px-4 py-6">
                    <Breadcrumbs />
                    <h1 className="text-lg font-medium text-foreground mb-1">Playground</h1>
                    <p className="text-sm text-muted-foreground/70">
                        Code snippets, UI experiments, and assorted builds collected over time.
                    </p>
                </div>
            </div>

            <div className="border-b border-border/50">
                <div className="flex items-center gap-1 px-4">
                    {(['all', 'snippets', 'ui', 'packages', 'cli'] as PlaygroundCategory[]).map((category, index) => (
                        <FilterTab
                            key={category}
                            category={category}
                            isActive={activeCategory === category}
                            onClick={() => setActiveCategory(category)}
                            count={categoryCounts[category]}
                            index={index}
                        />
                    ))}
                </div>
            </div>

            <div className="p-4">
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <PlaygroundCard
                                key={item.id}
                                item={item}
                                onClick={() => setSelectedItem(item)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
                        <Code2 className="w-8 h-8 mb-2" />
                        <p className="text-sm">No items in this category yet</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ duration: 0.4, ease: bezier }}
                            className="absolute inset-4 sm:inset-8 lg:inset-16 border border-border/50 bg-background overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="border-b border-border/50 px-4 py-4 flex items-center justify-between sticky top-0 bg-background">
                                <div>
                                    <h2 className="text-sm font-medium text-foreground">{selectedItem.title}</h2>
                                    <p className="text-xs text-muted-foreground/60">{selectedItem.description}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
                                <div className="p-4">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-2">Preview</div>
                                    <div className="border border-border/30 bg-muted/10">
                                        {selectedItem.preview}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-2">Code</div>
                                    <pre className="text-xs font-mono text-muted-foreground/80 bg-muted/20 p-4 overflow-x-auto border border-border/30">
                                        <code>{selectedItem.code}</code>
                                    </pre>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
