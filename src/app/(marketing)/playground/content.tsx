'use client'

import { useState, useEffect, useCallback } from 'react'
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
        id: 'loading-skeleton',
        title: 'Loading Skeleton',
        description: 'Animated shimmer skeleton for loading states',
        category: 'ui',
        language: 'tsx',
        tags: ['React', 'CSS', 'Loading'],
        code: `function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted/50 rounded",
        className
      )}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  )
}`,
        preview: <SkeletonDemo />,
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
    {
        id: 'use-local-storage',
        title: 'useLocalStorage Hook',
        description: 'Persist React state to localStorage with SSR support',
        category: 'snippets',
        language: 'ts',
        tags: ['React', 'Hook', 'Storage'],
        code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch { return initialValue }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function 
      ? value(storedValue) 
      : value
    setStoredValue(valueToStore)
    window.localStorage.setItem(key, JSON.stringify(valueToStore))
  }

  return [storedValue, setValue] as const
}`,
        preview: <LocalStorageDemo />,
    },
    {
        id: 'use-copy-to-clipboard',
        title: 'useCopyToClipboard Hook',
        description: 'Copy text with automatic reset and error handling',
        category: 'snippets',
        language: 'ts',
        tags: ['React', 'Hook', 'Clipboard'],
        code: `function useCopyToClipboard(resetDelay = 2000) {
  const [state, setState] = useState<{
    value?: string
    error?: Error
    copied: boolean
  }>({ copied: false })

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setState({ value: text, copied: true })
      setTimeout(() => setState(s => ({ ...s, copied: false })), resetDelay)
    } catch (error) {
      setState({ error: error as Error, copied: false })
    }
  }, [resetDelay])

  return { ...state, copy }
}`,
        preview: <CopyToClipboardDemo />,
    },
    {
        id: 'ts-log-utils',
        title: 'ts-log-utils',
        description: 'Type-safe colored console logging with prefixes',
        category: 'packages',
        language: 'ts',
        tags: ['TypeScript', 'Logging', 'Utils'],
        github: 'https://github.com/remcostoeten/ts-log-utils',
        code: `type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

const colors: Record<LogLevel, string> = {
  info: '\\x1b[36m',
  warn: '\\x1b[33m', 
  error: '\\x1b[31m',
  debug: '\\x1b[90m',
  success: '\\x1b[32m'
}

function createLogger(prefix: string) {
  return Object.fromEntries(
    (Object.keys(colors) as LogLevel[]).map(level => [
      level,
      (...args: unknown[]) => 
        console.log(\`\${colors[level]}[\${prefix}]\`, ...args, '\\x1b[0m')
    ])
  ) as Record<LogLevel, (...args: unknown[]) => void>
}

export const log = createLogger('app')
// log.info('Server started')
// log.error('Failed to connect')`,
        preview: <LogUtilsDemo />,
    },
    {
        id: 'drizzle-helpers',
        title: 'drizzle-helpers',
        description: 'Common Drizzle ORM schema patterns and utilities',
        category: 'packages',
        language: 'ts',
        tags: ['Drizzle', 'Database', 'ORM'],
        github: 'https://github.com/remcostoeten/drizzle-helpers',
        code: `import { sql } from 'drizzle-orm'
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql\`(unixepoch())\`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql\`(unixepoch())\`)
}

export const withId = {
  id: text('id').primaryKey().$defaultFn(() => createId())
}

export const users = sqliteTable('users', {
  ...withId,
  email: text('email').notNull().unique(),
  name: text('name'),
  ...timestamps
})`,
        preview: <DrizzleHelpersDemo />,
    },
    {
        id: 'env-generator',
        title: 'env-generator',
        description: 'Generate .env files from .env.example with prompts',
        category: 'cli',
        language: 'bash',
        tags: ['CLI', 'DevOps', 'Automation'],
        github: 'https://github.com/remcostoeten/env-generator',
        code: `#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createInterface } from 'readline'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const prompt = (q: string) => new Promise<string>(r => rl.question(q, r))

async function generateEnv() {
  if (!existsSync('.env.example')) {
    console.log('No .env.example found')
    process.exit(1)
  }
  
  const template = readFileSync('.env.example', 'utf-8')
  const lines = template.split('\\n')
  const result: string[] = []
  
  for (const line of lines) {
    if (!line.includes('=') || line.startsWith('#')) {
      result.push(line)
      continue
    }
    const [key] = line.split('=')
    const value = await prompt(\`\${key}: \`)
    result.push(\`\${key}=\${value}\`)
  }
  
  writeFileSync('.env', result.join('\\n'))
  console.log('✓ .env generated')
  rl.close()
}`,
        preview: <EnvGeneratorDemo />,
    },
    {
        id: 'port-killer',
        title: 'port-killer',
        description: 'Kill processes running on specified ports',
        category: 'cli',
        language: 'bash',
        tags: ['CLI', 'DevOps', 'Utility'],
        github: 'https://github.com/remcostoeten/port-killer',
        code: `#!/usr/bin/env node
import { execSync } from 'child_process'

const ports = process.argv.slice(2).map(Number).filter(Boolean)

if (ports.length === 0) {
  console.log('Usage: port-killer <port> [port2] [port3]...')
  process.exit(1)
}

for (const port of ports) {
  try {
    const pid = execSync(\`lsof -ti:\${port}\`).toString().trim()
    if (pid) {
      execSync(\`kill -9 \${pid}\`)
      console.log(\`✓ Killed process \${pid} on port \${port}\`)
    }
  } catch {
    console.log(\`○ No process on port \${port}\`)
  }
}`,
        preview: <PortKillerDemo />,
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

function SkeletonDemo() {
    return (
        <div className="p-6 space-y-3">
            <div className="animate-pulse bg-muted/50 h-4 w-3/4 rounded" />
            <div className="animate-pulse bg-muted/50 h-3 w-1/2 rounded" />
            <div className="flex gap-2 mt-4">
                <div className="animate-pulse bg-muted/50 h-6 w-16 rounded" />
                <div className="animate-pulse bg-muted/50 h-6 w-12 rounded" />
            </div>
        </div>
    )
}

function LocalStorageDemo() {
    const [count, setCount] = useState(0)
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('demo-count')
        if (stored) setCount(parseInt(stored, 10))
        setHydrated(true)
    }, [])

    const increment = () => {
        const newCount = count + 1
        setCount(newCount)
        localStorage.setItem('demo-count', String(newCount))
    }

    const reset = () => {
        setCount(0)
        localStorage.removeItem('demo-count')
    }

    if (!hydrated) return <div className="p-6 h-[88px]" />

    return (
        <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Persisted count:</span>
                <span className="font-mono text-foreground">{count}</span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={increment}
                    className="px-3 py-1.5 text-xs border border-border/50 hover:bg-muted/30 transition-colors"
                >
                    Increment
                </button>
                <button
                    onClick={reset}
                    className="px-3 py-1.5 text-xs border border-border/50 hover:bg-muted/30 transition-colors text-muted-foreground"
                >
                    Reset
                </button>
            </div>
        </div>
    )
}

function CopyToClipboardDemo() {
    const [copied, setCopied] = useState(false)
    const textToCopy = "npm install my-awesome-package"

    const handleCopy = async () => {
        await navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="p-6 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-border/50 bg-muted/20">
                <code className="text-xs text-muted-foreground flex-1 font-mono">{textToCopy}</code>
                <button
                    onClick={handleCopy}
                    className="text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>
            <p className="text-[10px] text-muted-foreground/40">Click to copy • Auto-resets after 2s</p>
        </div>
    )
}

function LogUtilsDemo() {
    const logs = [
        { level: 'info', color: '#22d3ee', message: 'Server started on port 3000' },
        { level: 'success', color: '#4ade80', message: 'Database connected' },
        { level: 'warn', color: '#fbbf24', message: 'Cache miss for user:123' },
        { level: 'error', color: '#f87171', message: 'Failed to fetch /api/data' },
    ]

    return (
        <div className="p-4 font-mono text-xs space-y-1 bg-zinc-950/50">
            {logs.map((log, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span style={{ color: log.color }}>[app]</span>
                    <span className="text-muted-foreground/70">{log.message}</span>
                </div>
            ))}
        </div>
    )
}

function DrizzleHelpersDemo() {
    return (
        <div className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-2">Schema Preview</div>
            <div className="font-mono text-xs space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-purple-400">users</span>
                    <span className="text-muted-foreground/40">→</span>
                    <span className="text-muted-foreground/60">id, email, name, created_at, updated_at</span>
                </div>
                <div className="mt-3 p-2 bg-muted/20 border border-border/30">
                    <div className="text-emerald-400/80 text-[10px] mb-1">Includes:</div>
                    <div className="text-muted-foreground/60 text-[10px]">• CUID2 auto-generated IDs</div>
                    <div className="text-muted-foreground/60 text-[10px]">• Unix timestamp columns</div>
                </div>
            </div>
        </div>
    )
}

function EnvGeneratorDemo() {
    const [step, setStep] = useState(0)
    const steps = [
        { prompt: 'DATABASE_URL:', value: 'postgresql://...' },
        { prompt: 'API_KEY:', value: 'sk_live_xxx' },
        { prompt: 'NODE_ENV:', value: 'production' },
    ]

    useEffect(() => {
        const timer = setInterval(() => {
            setStep(s => (s + 1) % (steps.length + 1))
        }, 1500)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="p-4 font-mono text-xs bg-zinc-950/50 space-y-1">
            <div className="text-muted-foreground/40">$ npx env-generator</div>
            {steps.slice(0, step).map((s, i) => (
                <div key={i} className="flex gap-2">
                    <span className="text-cyan-400">{s.prompt}</span>
                    <span className="text-muted-foreground/60">{s.value}</span>
                </div>
            ))}
            {step === steps.length && (
                <div className="text-emerald-400 mt-2">✓ .env generated</div>
            )}
        </div>
    )
}

function PortKillerDemo() {
    const [killed, setKilled] = useState<number[]>([])

    useEffect(() => {
        const ports = [3000, 5173, 8080]
        let i = 0
        const timer = setInterval(() => {
            if (i < ports.length) {
                setKilled(k => [...k, ports[i]])
                i++
            } else {
                setKilled([])
                i = 0
            }
        }, 800)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="p-4 font-mono text-xs bg-zinc-950/50 space-y-1">
            <div className="text-muted-foreground/40">$ npx port-killer 3000 5173 8080</div>
            {killed.map(port => (
                <div key={port} className="text-emerald-400">✓ Killed process on port {port}</div>
            ))}
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
