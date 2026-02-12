"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { HeroPill } from "@/components/ui/hero-pill"
import { cn } from "@/lib/utils"
import { generateComponentJsx } from "@/components/component-studio/lib/jsx-utils"
import { COMPONENT_REGISTRY } from "@/components/component-studio/playground/component-registry"
import React from "react"

// --- Icons for Showcase ---
const PrismIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
  >
    <path d="M12 3L2 21h20L12 3z" />
    <path d="M12 8.5l-4.5 8h9l-4.5-8z" />
  </svg>
)

const AtomIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" transform="rotate(45 12 12)" />
    <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" transform="rotate(-45 12 12)" />
  </svg>
)

const NetworkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
  >
    <title>Network Icon</title>
    <rect x="9" y="9" width="6" height="6" rx="1" />
    <circle cx="5" cy="5" r="2" />
    <circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
    <path d="M5 7v12M19 7v12M7 5h12M7 19h12" opacity="0.5" />
  </svg>
)

// --- Types ---
type Category = "All" | "Styles" | "Icons" | "Animations"

interface VariantData {
  id: string
  label: string
  category: Exclude<Category, "All">
  props: React.ComponentProps<typeof HeroPill>
}

// --- Data ---
const VARIANTS: VariantData[] = [
  // Styles
  {
    id: "default",
    label: "Default",
    category: "Styles",
    props: { text: "Default", variant: "default" },
  },
  {
    id: "outline",
    label: "Outline",
    category: "Styles",
    props: { text: "Outline", variant: "outline" },
  },
  {
    id: "ghost",
    label: "Ghost",
    category: "Styles",
    props: { text: "Ghost", variant: "ghost" },
  },
  {
    id: "glow",
    label: "Glow",
    category: "Styles",
    props: { text: "Glow", variant: "glow" },
  },
  {
    id: "text-only",
    label: "Text Only",
    category: "Styles",
    props: { text: "v2.4.0", variant: "outline", className: "font-mono text-xs" },
  },
  // Icons
  {
    id: "refraction",
    label: "Refraction",
    category: "Icons",
    props: { text: "Refraction engine", icon: <PrismIcon /> },
  },
  {
    id: "all-systems",
    label: "All Systems",
    category: "Icons",
    props: { text: "All systems go", icon: <Check className="h-3.5 w-3.5" />, variant: "outline", className: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20" },
  },
  {
    id: "orbital",
    label: "Orbital",
    category: "Icons",
    props: { text: "Orbital sync", icon: <AtomIcon /> },
  },
  {
    id: "lattice",
    label: "Lattice",
    category: "Icons",
    props: { text: "Lattice network", icon: <NetworkIcon /> },
  },
  // Animations
  {
    id: "live",
    label: "Live Status",
    category: "Animations",
    props: {
      text: "Live",
      icon: <span className="relative flex h-2 w-2 mr-0"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span></span>,
      variant: "outline",
      className: "pl-2.5",
    },
  },
  {
    id: "processing",
    label: "Processing",
    category: "Animations",
    props: {
      text: "Processing",
      icon: <NetworkIcon />, // Using Network as placeholder
      variant: "ghost",
      className: "animate-pulse"
    },
  },
  {
    id: "ghost-idle",
    label: "Ghost on Idle",
    category: "Animations",
    props: {
      text: "Ghosts when idle",
      variant: "ghost",
      ghostBehavior: "idle",
      ghostIdleMs: 2000
    }
  }
]

const CATEGORIES: Category[] = ["All", "Styles", "Icons", "Animations"]

export function PillShowcase() {
  const [activeCategory, setActiveCategory] = useState<Category>("All")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredVariants =
    activeCategory === "All"
      ? VARIANTS
      : VARIANTS.filter((v) => v.category === activeCategory)

  const handleCopy = async (variant: VariantData) => {
    try {
      // Find HeroPill registration to get schema
      const registration = COMPONENT_REGISTRY.find(c => c.slug === 'hero-pill')
      if (!registration) return

      const propsForGen = { ...variant.props }
      if (propsForGen.icon) {
        // @ts-ignore
        propsForGen.icon = "<Icon />"
      }

      const code = generateComponentJsx(
        "HeroPill",
        propsForGen as Record<string, unknown>,
        {},
        registration
      )

      await navigator.clipboard.writeText(code)
      setCopiedId(variant.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy", err)
    }
  }

  return (
    <div className="flex w-full flex-col items-center justify-start bg-background px-6 py-12">
      {/* Category Tabs */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-300",
              activeCategory === cat
                ? "bg-foreground text-background"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filteredVariants.map((variant) => (
          <div
            key={variant.id}
            className="group relative flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-muted/10 p-4 transition-all hover:border-border/80 hover:bg-muted/30 cursor-pointer"
            onClick={() => handleCopy(variant)}
          >
            {/* Prevent HeroPill click from bubbling if needed, but wrapping div handles click */}
            <div className="pointer-events-none">
              <HeroPill {...variant.props} animate={false} />
            </div>

            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">
              {variant.label}
            </span>

            {/* Hover/Copy Overlay */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm transition-all duration-200",
              copiedId === variant.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              {copiedId === variant.id ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Copy className="h-3.5 w-3.5" />
                  <span>Click to Copy</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
