export function LatestActivitySkeleton() {
  return (
    <div className="mt-6 p-4 bg-gradient-to-br from-muted/30 to-muted/20 border border-border/50 rounded-xl backdrop-blur-sm">
      {/* Main activity section */}
      <div className="flex items-start gap-3 mb-3">
        <div className="p-1.5 bg-accent/10 rounded-lg">
          <div className="w-4 h-4 bg-accent/50 rounded animate-pulse"></div>
        </div>
        
        <div className="leading-relaxed min-w-0 flex-1 text-sm">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-muted-foreground">The latest thing I've done is</span>
            <div className="h-4 bg-muted/60 rounded-md w-32 animate-pulse inline-block"></div>
            <span className="text-muted-foreground">on</span>
            <div className="h-4 bg-muted/60 rounded-md w-24 animate-pulse inline-block"></div>
            <div className="h-3 bg-muted/40 rounded-md w-16 animate-pulse inline-block"></div>
          </div>
        </div>
      </div>

      {/* Project Statistics */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-muted/40 rounded animate-pulse"></div>
            <div className="h-3 bg-muted/40 rounded-md w-20 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-muted/40 rounded animate-pulse"></div>
            <div className="h-3 bg-muted/40 rounded-md w-16 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-muted/40 rounded animate-pulse"></div>
            <div className="h-3 bg-muted/40 rounded-md w-24 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Spotify section */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
        <div className="p-1.5 bg-green-500/10 rounded-lg">
          <div className="w-4 h-4 bg-green-500/50 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-muted-foreground leading-tight">
            <div className="h-4 bg-muted/60 rounded-md w-64 animate-pulse"></div>
          </div>
          <div className="text-xs text-muted-foreground leading-tight mt-1">
            <div className="h-3 bg-muted/40 rounded-md w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-muted/50 animate-pulse flex-shrink-0"></div>
      </div>
    </div>
  );
}