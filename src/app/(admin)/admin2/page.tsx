import Link from "next/link"
import { getSession } from "@/lib/auth-guard"
import { getProjects, getSettings } from "@/modules/projects/server/queries"

export default async function AdminPage() {
    const session = await getSession()
    const projects = await getProjects(true)
    const settings = await getSettings()

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-medium text-zinc-100">Admin Dashboard</h1>
                <p className="text-sm text-zinc-500 mt-1">Welcome back, {session?.user?.name}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/projects" className="p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <h2 className="text-lg font-medium text-zinc-100">Projects</h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        {projects.length} projects ({projects.filter((p) => !p.hidden).length} visible)
                    </p>
                    <p className="text-xs text-zinc-600 mt-2">Showing {settings.showN} when collapsed</p>
                </Link>
            </div>
        </div>
    )
}
