'use client'

export function DrizzleHelpersDemo() {
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
