'use client'

import { Zap, Home, FileText, Code, Shield, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Props = {
	pathname: string
}

type RouteItem = {
	path: string
	label: string
	isDynamic: boolean
}

type RouteResponse = {
	routes: RouteItem[]
}

const CATEGORY_CONFIG = {
	core: { icon: Home, label: 'core', matcher: (path: string) => ['/', '/dashboard', '/playground'].includes(path) },
	blog: { icon: FileText, label: 'blog', matcher: (path: string) => path.startsWith('/blog') },
	dev: { icon: Code, label: 'dev', matcher: (path: string) => path.startsWith('/dev') || path.startsWith('/admin') },
	legal: { icon: Shield, label: 'legal', matcher: (path: string) => ['/privacy', '/terms'].includes(path) },
	other: { icon: Zap, label: 'other', matcher: () => true } // Fallback
} as const

function RouteLink({ route, pathname }: Props & { route: RouteItem }) {
	const isActive = pathname === route.path

	if (route.isDynamic) {
		return (
			<div
				className="text-[10px] px-2 py-1 text-muted-foreground/60 flex items-center justify-between group/route cursor-not-allowed"
				title={`Dynamic route: ${route.path}`}
			>
				<span className="truncate">{route.label}</span>
				<Zap className="w-2.5 h-2.5 opacity-30" />
			</div>
		)
	}

	return (
		<Link
			href={route.path}
			className={`flex items-center justify-between text-[10px] px-2 py-1 transition-colors rounded-sm mx-1 ${isActive
					? 'bg-primary/10 text-primary font-medium'
					: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
				}`}
		>
			<span className="truncate">{route.label}</span>
			{isActive && (
				<div className="w-1 h-1 rounded-full bg-primary" />
			)}
		</Link>
	)
}

export function RoutesSection({ pathname }: Props) {
	const [routes, setRoutes] = useState<RouteItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)

	const fetchRoutes = async () => {
		try {
			setLoading(true)
			const res = await fetch('/api/dev/routes')
			if (!res.ok) throw new Error('Failed to fetch')
			const data: RouteResponse = await res.json()
			setRoutes(data.routes)
			setError(false)
		} catch (e) {
			console.error(e)
			setError(true)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchRoutes()
	}, [])

	const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			const target = e.currentTarget.value.trim()
			if (target.startsWith('/')) {
				window.location.href = target
			} else if (target) {
				window.location.href = `/${target}`
			}
		}
	}

	// Categorize routes
	const categorized = {
		core: [] as RouteItem[],
		blog: [] as RouteItem[],
		dev: [] as RouteItem[],
		legal: [] as RouteItem[],
		other: [] as RouteItem[]
	}

	routes.forEach(route => {
		if (CATEGORY_CONFIG.core.matcher(route.path)) categorized.core.push(route)
		else if (CATEGORY_CONFIG.blog.matcher(route.path)) categorized.blog.push(route)
		else if (CATEGORY_CONFIG.dev.matcher(route.path)) categorized.dev.push(route)
		else if (CATEGORY_CONFIG.legal.matcher(route.path)) categorized.legal.push(route)
		else categorized.other.push(route)
	})

	return (
		<div className="p-2">
			<div className="flex items-center gap-1 mb-2 px-1">
				<input
					type="text"
					placeholder="Go to /..."
					className="flex-1 bg-muted/20 border border-border/40 px-2 py-1 text-[10px] rounded focus:outline-none focus:border-primary/50 transition-colors h-6"
					onKeyDown={handleJump}
				/>
				<button
					onClick={fetchRoutes}
					className="p-1 hover:bg-muted/20 rounded text-muted-foreground hover:text-foreground transition-colors"
					title="Refresh Routes"
				>
					<RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
				</button>
			</div>

			<div className="text-[9px] text-muted-foreground px-2 py-1 mb-1 border-b border-border/20 flex items-center justify-between">
				<span className="font-mono text-primary/80 truncate max-w-[150px]">{pathname}</span>
			</div>

			{loading && routes.length === 0 ? (
				<div className="flex items-center justify-center py-4 text-muted-foreground">
					<Loader2 className="w-4 h-4 animate-spin" />
				</div>
			) : error ? (
				<div className="px-2 py-2 text-[10px] text-red-400 text-center">
					Failed to load routes
				</div>
			) : (
				<div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide mt-1 pb-4">
					{(Object.entries(categorized) as [keyof typeof CATEGORY_CONFIG, RouteItem[]][]).map(([key, items]) => {
						if (items.length === 0) return null
						const { icon: Icon, label } = CATEGORY_CONFIG[key]

						return (
							<div key={key}>
								<div className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground/50 select-none">
									<Icon className="w-3 h-3" />
									<span className="text-[9px] uppercase tracking-wider font-semibold">
										{label}
									</span>
								</div>
								<div className="space-y-0.5">
									{items.map(route => (
										<RouteLink
											key={route.path}
											route={route}
											pathname={pathname}
										/>
									))}
								</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}
