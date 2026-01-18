'use client'

export function LogUtilsDemo() {
    const logs = [
        { level: 'info', color: '#22d3ee', message: 'Server started on port 3000' },
        { level: 'success', color: '#4ade80', message: 'Database connected' },
        { level: 'warn', color: '#fbbf24', message: 'Cache miss for user:123' },
        { level: 'error', color: '#f87171', message: 'Failed to fetch /api/data' },
    ]

    return (
        <div className="p-4 font-mono text-xs space-y-1 bg-zinc-950/50">
            {logs.map(function renderLog(log, i) {
                return (
                    <div key={i} className="flex items-center gap-2">
                        <span style={{ color: log.color }}>[app]</span>
                        <span className="text-muted-foreground/70">{log.message}</span>
                    </div>
                )
            })}
        </div>
    )
}
