"use client"

import Link from "next/link"
import { ArrowUpRight, Sparkles } from "lucide-react"
import { Section } from "@/components/ui/section"
import { cn } from "@/lib/utils"
import { HeroPill } from "@/components/ui/hero-pill"

export function Playground() {
	return (
		<Section
			title="Component Studio"
			headerAction={
				<Link
					href="/playground"
					className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
				>
					<Sparkles className="w-3 h-3" />
					Open Studio
				</Link>
			}
		>
			<div className="pt-4 space-y-4">
				<p className="text-sm px-4 text-muted-foreground/80 leading-relaxed font-mono tracking-tight">
					A collection of interactive components and experiments. Explore,
					customize, and copy-paste into your projects.
				</p>
				<Link
					href="/playground"
					className={cn(
						"group block px-4 py-6",
						"border-b border-border/40",
						"hover:bg-muted/10 transition-colors cursor-pointer"
					)}
				>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							{/* Live Preview */}
							<div className="flex items-center justify-center w-20 h-12 border border-border/50 bg-muted/20 rounded-sm">
								<HeroPill
									text="Preview"
									variant="default"
									animate={false}
									className="scale-75"
								/>
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-medium text-foreground group-hover:text-primary/90 transition-colors">
										Interactive Design Environment
									</h3>
									<ArrowUpRight className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
								</div>
								<p className="text-xs text-muted-foreground/60">
									Explore and customize UI components with live preview, animation controls, and code export.
								</p>
							</div>
						</div>

						<div className="hidden sm:flex gap-2">
							<span className="text-[10px] font-mono text-muted-foreground/40">HeroPill</span>
							<span className="text-[10px] font-mono text-muted-foreground/40">GooeyToggle</span>
						</div>
					</div>
				</Link>
			</div>
		</Section>
	)
}
