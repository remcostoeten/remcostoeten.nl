import type { UiEntry } from '../types'
import { CopyButtonDemo } from '@/components/playground/demos/copy-button'
import { GradientBorderDemo } from '@/components/playground/demos/gradient-border'
import { SkeletonDemo } from '@/components/playground/demos/skeleton'

export const uiEntries: UiEntry[] = [
    {
        id: 'copy-button',
        title: 'Animated Copy Button',
        description: 'A sleek copy-to-clipboard button with state transitions',
        category: 'ui',
        language: 'tsx',
        tags: ['React', 'Animation', 'Component'],
        preview: CopyButtonDemo,
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
    },
    {
        id: 'gradient-border',
        title: 'Gradient Border Card',
        description: 'CSS-only animated gradient border effect',
        category: 'ui',
        language: 'css',
        tags: ['CSS', 'Animation', 'Effect'],
        preview: GradientBorderDemo,
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
    },
    {
        id: 'loading-skeleton',
        title: 'Loading Skeleton',
        description: 'Animated shimmer skeleton for loading states',
        category: 'ui',
        language: 'tsx',
        tags: ['React', 'CSS', 'Loading'],
        preview: SkeletonDemo,
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
    },
]
