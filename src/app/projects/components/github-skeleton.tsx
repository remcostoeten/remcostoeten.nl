export function GithubSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-sm">
      <div className="h-5 w-32 rounded bg-muted/40" />
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground md:grid-cols-3">
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-muted/30" />
          <div className="h-4 w-16 rounded bg-muted/20" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-muted/30" />
          <div className="h-4 w-16 rounded bg-muted/20" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-muted/30" />
          <div className="h-4 w-16 rounded bg-muted/20" />
        </div>
      </div>
    </div>
  )
}
