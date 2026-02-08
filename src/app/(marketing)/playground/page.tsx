"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Layers, Code, Package, Terminal } from "lucide-react"
import {
	COMPONENT_REGISTRY,
	CATEGORIES,
	getComponentsByCategory,
} from "@/components/component-studio/playground/component-registry"
import { PlaygroundLayout } from "@/components/component-studio/playground/playground-layout"
import { cn } from "@/lib/utils"
import { GooeyFilter } from "@/components/ui/gooey-toggle"

const CATEGORY_ICONS: Record<string, React.ElementType> = {
	Layers,
	Code,
	Package,
	Terminal,
}

type ViewState =
	| { level: "categories" }
	| { level: "components"; category: string }
	| { level: "studio"; slug: string }

export default function PlaygroundPage() {
	const [view, setView] = useState<ViewState>({ level: "categories" })

	// --- Level 1: Category Overview ---
	if (view.level === "categories") {
		return (
			<main className="min-h-screen">
				<header className="border-b border-border/50 px-6 py-8">
					<div className="flex items-center gap-2 text-xs text-muted-foreground/50 mb-2">
						<Link href="/" className="hover:text-foreground transition-colors">
							~
						</Link>
						<span>/</span>
						<span>playground</span>
					</div>
					<h1 className="text-2xl font-semibold tracking-tight">Playground</h1>
					<p className="mt-2 max-w-2xl text-sm text-muted-foreground/70 font-mono leading-relaxed">
						A collection of components, utilities, and experiments. These artifacts are intentionally small or experimental and do not warrant their own repositories. Browse, copy, and adapt as needed.
					</p>
				</header>

				<div className="divide-y divide-border/40">
					{CATEGORIES.map((cat) => {
						const Icon = CATEGORY_ICONS[cat.icon] || Layers
						const count = getComponentsByCategory(cat.slug).length
						const isDisabled = cat.disabled || count === 0

						return (
							<button
								key={cat.slug}
								onClick={() => !isDisabled && setView({ level: "components", category: cat.slug })}
								disabled={isDisabled}
								className={cn(
									"w-full flex items-center gap-4 px-6 py-5 text-left transition-colors",
									isDisabled
										? "opacity-40 cursor-not-allowed"
										: "hover:bg-muted/20 cursor-pointer"
								)}
							>
								<div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/50 bg-muted/30">
									<Icon className="h-4 w-4 text-muted-foreground" />
								</div>
								<div className="flex-1 min-w-0">
									<h2 className="text-sm font-medium">{cat.label}</h2>
									<p className="text-xs text-muted-foreground/60">{cat.description}</p>
								</div>
								{count > 0 && (
									<span className="text-xs font-mono text-muted-foreground/40">
										{count} {count === 1 ? "item" : "items"}
									</span>
								)}
							</button>
						)
					})}
				</div>
			</main>
		)
	}

	// --- Level 2: Components in Category ---
	if (view.level === "components") {
		const category = CATEGORIES.find((c) => c.slug === view.category)
		const components = getComponentsByCategory(view.category)

		return (
			<main className="min-h-screen">
				<header className="border-b border-border/50 px-6 py-6">
					<div className="flex items-center gap-2 text-xs text-muted-foreground/50 mb-2">
						<Link href="/" className="hover:text-foreground transition-colors">
							~
						</Link>
						<span>/</span>
						<button
							onClick={() => setView({ level: "categories" })}
							className="hover:text-foreground transition-colors"
						>
							playground
						</button>
						<span>/</span>
						<span className="text-foreground">{category?.label}</span>
					</div>
					<div className="flex items-center gap-3">
						<button
							onClick={() => setView({ level: "categories" })}
							className="h-8 w-8 flex items-center justify-center rounded-sm border border-border/50 hover:bg-muted/30 transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
						</button>
						<div>
							<h1 className="text-xl font-semibold tracking-tight">{category?.label}</h1>
							<p className="text-xs text-muted-foreground/60">{category?.description}</p>
						</div>
					</div>
				</header>

				{/* SVG Filter for GooeyToggle preview */}
				<GooeyFilter />

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
					{components.map((comp) => {
						const Component = comp.component
						const previewProps = comp.previewProps ?? {}

						return (
							<button
								key={comp.slug}
								onClick={() => setView({ level: "studio", slug: comp.slug })}
								className="group flex flex-col rounded-lg border border-border/40 bg-muted/10 overflow-hidden text-left transition-all hover:border-border/80 hover:bg-muted/20"
							>
								{/* Preview Area */}
								<div className="flex h-36 items-center justify-center bg-background/50 border-b border-border/30">
									<div className="pointer-events-none scale-90">
										<Component {...previewProps} />
									</div>
								</div>

								{/* Info Footer */}
								<div className="p-4 space-y-2">
									<div className="flex items-center justify-between gap-2">
										<h3 className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors">
											{comp.name}
										</h3>
										<span className="text-[10px] text-muted-foreground/40 font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
											→ Open
										</span>
									</div>
									<p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2">
										{comp.description}
									</p>
								</div>
							</button>
						)
					})}
				</div>
			</main>
		)
	}

	// --- Level 3: Full Studio ---
	if (view.level === "studio") {
		const component = COMPONENT_REGISTRY.find((c) => c.slug === view.slug)
		const category = component ? CATEGORIES.find((c) => c.slug === component.category) : null

		if (!component) {
			return (
				<div className="flex h-screen items-center justify-center text-muted-foreground">
					Component not found
				</div>
			)
		}

		return (
			<main className="min-h-screen flex flex-col">
				{/* Breadcrumb Bar */}
				<div className="flex items-center gap-2 border-b border-border/50 px-4 py-2 text-xs text-muted-foreground/50 bg-muted/10">
					<Link href="/" className="hover:text-foreground transition-colors">
						~
					</Link>
					<span>/</span>
					<button
						onClick={() => setView({ level: "categories" })}
						className="hover:text-foreground transition-colors"
					>
						playground
					</button>
					<span>/</span>
					<button
						onClick={() => setView({ level: "components", category: component.category })}
						className="hover:text-foreground transition-colors"
					>
						{category?.label}
					</button>
					<span>/</span>
					<span className="text-foreground font-medium">{component.name}</span>
				</div>

				{/* Studio */}
				<div className="flex-1">
					<PlaygroundLayout key={view.slug} registration={component} />
				</div>
			</main>
		)
	}

	return null
}
