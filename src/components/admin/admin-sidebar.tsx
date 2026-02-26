'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    Mail,
    BarChart3,
    FolderKanban,
    PanelLeftClose,
    PanelLeft
} from 'lucide-react'

const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin#blogs', label: 'Blog Posts', icon: FileText },
    { href: '/admin#messages', label: 'Messages', icon: Mail },
    { href: '/admin#analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/projects', label: 'Projects', icon: FolderKanban }
]

export function AdminSidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    function isActive(item: (typeof navItems)[0]) {
        if (item.exact) return pathname === item.href
        if (item.href.includes('#')) return pathname === '/admin'
        return pathname.startsWith(item.href)
    }

    return (
        <>
            <aside
                className={`admin-sidebar hidden md:flex flex-col border-r border-border/50 bg-background/80 backdrop-blur-sm transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'
                    }`}
            >
                <div className="flex items-center justify-end p-3 border-b border-border/30">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        {collapsed ? (
                            <PanelLeft className="w-4 h-4" />
                        ) : (
                            <PanelLeftClose className="w-4 h-4" />
                        )}
                    </button>
                </div>

                <nav className="flex-1 py-3 space-y-0.5 px-2">
                    {navItems.map(item => {
                        const active = isActive(item)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`admin-nav-item flex items-center gap-3 px-3 py-2.5 text-sm transition-all relative ${active
                                        ? 'text-[hsl(var(--brand-400))] bg-[hsl(var(--brand-500)/0.08)]'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    } ${collapsed ? 'justify-center px-0' : ''}`}
                            >
                                {active && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[hsl(var(--brand-400))] rounded-r" />
                                )}
                                <item.icon className={`shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </aside>
        </>
    )
}
