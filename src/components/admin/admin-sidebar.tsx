'use client'

import { useEffect, useState } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	ArrowUpRight,
	BarChart3,
	BriefcaseBusiness,
	FileText,
	FolderKanban,
	LayoutDashboard,
	Mail,
	Menu,
	Settings,
	UserRound,
	X,
	type LucideIcon
} from 'lucide-react'
import { AdminSessionStatus } from '@/components/admin/admin-session-status'

type NavItem = {
	href: string
	label: string
	icon: LucideIcon
	exact?: boolean
	badge?: 'messages'
}

type NavSection = {
	label: string
	items: NavItem[]
}

const navSections: NavSection[] = [
	{
		label: 'Workspace',
		items: [
			{
				href: '/admin',
				label: 'Overview',
				icon: LayoutDashboard,
				exact: true
			},
			{ href: '/admin#blogs', label: 'Blog posts', icon: FileText },
			{
				href: '/admin#messages',
				label: 'Messages',
				icon: Mail,
				badge: 'messages'
			},
			{ href: '/admin#analytics', label: 'Analytics', icon: BarChart3 }
		]
	},
	{
		label: 'Content',
		items: [
			{ href: '/admin/intro', label: 'Intro', icon: UserRound },
			{
				href: '/admin/experience',
				label: 'Experience',
				icon: BriefcaseBusiness
			},
			{ href: '/admin/projects', label: 'Projects', icon: FolderKanban }
		]
	},
	{
		label: 'Manage',
		items: [{ href: '/admin/settings', label: 'Settings', icon: Settings }]
	}
]

const pageTitles: Record<string, string> = {
	'/admin': 'Overview',
	'/admin/intro': 'Intro',
	'/admin/experience': 'Experience',
	'/admin/projects': 'Projects',
	'/admin/settings': 'Settings'
}

function isActive(item: NavItem, pathname: string) {
	if (item.href.includes('#')) return false
	if (item.exact) return pathname === item.href
	return pathname.startsWith(item.href)
}

function getPageTitle(pathname: string) {
	if (pathname.startsWith('/admin/blog/')) return 'Post preview'
	return pageTitles[pathname] ?? 'Admin'
}

function AdminNav({
	unreadMessages,
	onNavigate
}: {
	unreadMessages: number
	onNavigate?: () => void
}) {
	const pathname = usePathname()

	return (
		<nav className="flex flex-col gap-6">
			{navSections.map(section => (
				<div key={section.label}>
					<p className="admin-section-label">{section.label}</p>
					<div className="flex flex-col gap-0.5">
						{section.items.map(item => (
							<Link
								key={item.href}
								href={item.href as Route}
								onClick={onNavigate}
								data-active={isActive(item, pathname)}
								className="admin-nav-item"
							>
								<item.icon className="size-4 shrink-0" />
								<span className="flex-1">{item.label}</span>
								{item.badge === 'messages' &&
									unreadMessages > 0 && (
										<span className="rounded-full bg-secondary px-1.5 text-[10px] tabular-nums text-foreground">
											{unreadMessages}
										</span>
									)}
							</Link>
						))}
					</div>
				</div>
			))}
			<div>
				<p className="admin-section-label">Site</p>
				<Link href="/" onClick={onNavigate} className="admin-nav-item">
					<ArrowUpRight className="size-4 shrink-0" />
					<span>View site</span>
				</Link>
			</div>
		</nav>
	)
}

function Brand() {
	return (
		<Link href="/admin" className="flex items-center gap-2 px-3">
			<span
				aria-hidden="true"
				className="size-0 border-x-[7px] border-b-[12px] border-x-transparent border-b-foreground"
			/>
			<span className="admin-display text-[15px] font-medium">remco</span>
			<span className="text-xs text-muted-foreground">/ admin</span>
		</Link>
	)
}

function SidebarBody({
	unreadMessages,
	onNavigate
}: {
	unreadMessages: number
	onNavigate?: () => void
}) {
	return (
		<div className="flex h-full flex-col gap-8">
			<Brand />
			<div className="flex-1 overflow-y-auto">
				<AdminNav
					unreadMessages={unreadMessages}
					onNavigate={onNavigate}
				/>
			</div>
			<AdminSessionStatus />
		</div>
	)
}

export function AdminSidebar({ unreadMessages }: { unreadMessages: number }) {
	return (
		<aside className="admin-sidebar hidden md:block">
			<SidebarBody unreadMessages={unreadMessages} />
		</aside>
	)
}

export function AdminTopbar({ unreadMessages }: { unreadMessages: number }) {
	const pathname = usePathname()
	const [open, setOpen] = useState(false)
	const isProduction = process.env.NODE_ENV === 'production'

	useEffect(() => {
		if (!open) return
		function handleKey(event: KeyboardEvent) {
			if (event.key === 'Escape') setOpen(false)
		}
		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [open])

	return (
		<>
			<header className="admin-topbar">
				<div className="flex min-w-0 items-center gap-3">
					<button
						type="button"
						onClick={() => setOpen(true)}
						className="admin-icon-btn md:hidden"
						aria-label="Open navigation"
					>
						<Menu className="size-4" />
					</button>
					<nav
						aria-label="Breadcrumb"
						className="flex min-w-0 items-center gap-2 text-[13px]"
					>
						<Link
							href="/admin"
							className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
						>
							Remco&rsquo;s workspace
						</Link>
						<span
							aria-hidden="true"
							className="hidden text-muted-foreground/50 sm:inline"
						>
							/
						</span>
						<span className="truncate font-medium">
							{getPageTitle(pathname)}
						</span>
					</nav>
				</div>
				<div className="flex items-center gap-2">
					<span className="admin-pill" data-tone="plain">
						<span
							className="size-1.5 rounded-full"
							style={{
								background: isProduction
									? 'var(--admin-success)'
									: 'var(--admin-warning)'
							}}
						/>
						{isProduction ? 'Production' : 'Development'}
					</span>
					<Link
						href="/"
						className="admin-icon-btn"
						aria-label="View site"
						title="View site"
					>
						<ArrowUpRight className="size-4" />
					</Link>
				</div>
			</header>

			{open && (
				<div className="fixed inset-0 z-50 md:hidden">
					<button
						type="button"
						aria-label="Close navigation"
						onClick={() => setOpen(false)}
						className="absolute inset-0 bg-black/60"
					/>
					<div className="admin-sidebar absolute inset-y-0 left-0 !block">
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="admin-icon-btn absolute right-3 top-5"
							aria-label="Close navigation"
						>
							<X className="size-4" />
						</button>
						<SidebarBody
							unreadMessages={unreadMessages}
							onNavigate={() => setOpen(false)}
						/>
					</div>
				</div>
			)}
		</>
	)
}
