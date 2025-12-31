'use client'

import { useSession } from '@/lib/auth-client'
import { useState, useEffect } from 'react'
import { X, Terminal, LogOut, Activity, Route, Clock, Zap } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { usePathname } from 'next/navigation'

interface MemoryPerformance extends Performance {
    memory?: {
        jsHeapSizeLimit: number;
        totalJSHeapSize: number;
        usedJSHeapSize: number;
    }
}

export function DevWidget() {
    const { data: session } = useSession()
    const [isMinimized, setIsMinimized] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [performanceMetrics, setPerformanceMetrics] = useState({
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0
    })
    const pathname = usePathname()

    // Check if user is admin or if we're in development
    const isAdmin = session?.user?.email && process.env.NEXT_PUBLIC_ADMIN_EMAIL && session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    const isDev = process.env.NODE_ENV === 'development'
    const shouldShow = isAdmin || isDev

    // Available routes in the project
    const availableRoutes = [
        '/',
        '/admin',
        '/blog',
        '/blog/[...slug]',
        '/blog/topics',
        '/blog/topics/[topic]',
        '/projects',
        '/projects/[slug]',
        '/auth/callback',
        '/api/auth/[...all]',
        '/api/auth/providers',
        '/api/example',
        '/api/github/activity',
        '/api/github/commits',
        '/api/github/contributions',
        '/api/github/events',
        '/api/github/repo',
        '/api/spotify/auth-url',
        '/api/spotify/callback',
        '/api/spotify/now-playing',
        '/api/spotify/recent',
        '/api/spotify/token',
        '/api/sync',
        '/og',
        '/privacy',
        '/terms',
        '/rss',
        '/sitemap-pages.xml',
        '/sitemap-posts.xml',
        '/sitemap-tags.xml',
        '/sitemap.xml',
        '/robots.txt',
        '/heading-showcase',
        '/posthog-demo'
    ]

    // Collect performance metrics
    useEffect(() => {
        if (typeof window !== 'undefined' && 'performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

            if (navigation) {
                const loadTime = navigation.loadEventEnd - navigation.loadEventStart
                const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart

                setPerformanceMetrics({
                    loadTime: Math.round(loadTime),
                    renderTime: Math.round(domContentLoaded),
                    memoryUsage: (performance as MemoryPerformance)?.memory ? Math.round((performance as MemoryPerformance).memory!.usedJSHeapSize / 1048576) : 0
                })
            }
        }
    }, [pathname])

    if (!shouldShow) return null

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="bg-black/80 text-white p-2 rounded-lg shadow-lg hover:bg-black/90 transition-colors backdrop-blur-sm border border-white/10"
                    title="Dev Tools"
                >
                    <Terminal className="w-4 h-4" />
                </button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white rounded-lg shadow-xl backdrop-blur-sm border border-white/10 min-w-[280px] max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">
                        {isDev ? 'Dev Mode' : 'Admin Tools'}
                    </span>
                </div>
                <button
                    onClick={() => setIsMinimized(true)}
                    className="text-white/60 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Auth Section */}
            <div className="p-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <div className="text-sm font-medium text-white">
                            {session?.user?.name || 'Not authenticated'}
                        </div>
                        <div className="text-xs text-white/60">
                            {session?.user?.email || 'No email'}
                        </div>
                    </div>
                    {session && (
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="w-3 h-3" />
                            Logout
                        </button>
                    )}
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="p-3 border-b border-white/10">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium">Performance Metrics</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/60" />
                        <span className="text-white/60">Load:</span>
                        <span className="text-white font-mono">{performanceMetrics.loadTime}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-white/60" />
                        <span className="text-white/60">Render:</span>
                        <span className="text-white font-mono">{performanceMetrics.renderTime}ms</span>
                    </div>
                    {performanceMetrics.memoryUsage > 0 && (
                        <div className="flex items-center gap-1 col-span-2">
                            <Activity className="w-3 h-3 text-white/60" />
                            <span className="text-white/60">Memory:</span>
                            <span className="text-white font-mono">{performanceMetrics.memoryUsage}MB</span>
                        </div>
                    )}
                </div>
                <div className="text-xs text-white/40 mt-2">
                    Current route: <span className="text-white/60 font-mono">{pathname}</span>
                </div>
            </div>

            {/* Routes Section */}
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <Route className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Available Routes ({availableRoutes.length})</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                    {availableRoutes.map((route) => (
                        <div
                            key={route}
                            className={`text-xs px-2 py-1 rounded transition-colors ${pathname === route
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <code className="font-mono">{route}</code>
                        </div>
                    ))}
                </div>
            </div>

            {/* Expand/Collapse */}
            <div className="px-3 py-2 border-t border-white/10">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-white/60 hover:text-white transition-colors"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            </div>

            {isExpanded && (
                <div className="px-3 py-2 border-t border-white/10 space-y-2">
                    <div className="text-xs text-white/60">
                        <div>Environment: {process.env.NODE_ENV}</div>
                        <div>Admin Email: {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'Not set'}</div>
                        <div>User Agent: {typeof window !== 'undefined' ? navigator.userAgent.slice(0, 50) + '...' : 'N/A'}</div>
                    </div>
                </div>
            )}
        </div>
    )
}
