import type React from "react"
import { redirect } from "next/navigation"
import { isAdmin, getSession } from "@/lib/auth-guard"
import Link from "next/link"

type Props = {
    children: React.ReactNode
}

export default async function AdminLayout({ children }: Props) {
    const session = await getSession()
    const admin = await isAdmin()

    if (!session) {
        redirect("/api/auth/signin?callbackUrl=/admin")
    }

    if (!admin) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-xl font-medium text-zinc-100">Access Denied</h1>
                    <p className="text-sm text-zinc-500">You do not have permission to access this area.</p>
                    <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200 underline">
                        Return home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <header className="border-b border-zinc-800 px-6 py-4">
                <nav className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-6">
                        <Link href="/admin" className="text-sm font-medium text-zinc-100">
                            Admin
                        </Link>
                        <Link href="/admin/projects" className="text-sm text-zinc-400 hover:text-zinc-200">
                            Projects
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-zinc-500">{session.user?.email}</span>
                        <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-200">
                            View site
                        </Link>
                    </div>
                </nav>
            </header>
            <main className="max-w-7xl mx-auto">{children}</main>
        </div>
    )
}
