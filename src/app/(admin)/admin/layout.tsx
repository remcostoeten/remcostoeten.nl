import { checkAdminStatus } from "@/actions/auth"
import { redirect } from "next/navigation"
import { ReactNode } from "react"
import { RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { AdminSessionStatus } from "@/components/admin/admin-session-status"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
    children
}: {
    children: ReactNode
}) {
    const isAdmin = await checkAdminStatus()

    if (!isAdmin) {
        redirect("/")
    }

    const lastUpdated = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
    })

    return (
        <div className="min-h-screen flex">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky z-30 border-b border-border/40 bg-background/90 backdrop-blur-md">
                    <div className="flex items-center justify-between px-4 md:px-8 h-14">
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight">
                                Admin Dashboard
                            </h1>
                            <p className="text-xs text-muted-foreground -mt-0.5 hidden md:block">
                                Welcome back, Remco
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <AdminSessionStatus />
                            <span className="text-[10px] text-muted-foreground/60 hidden lg:block border-l border-border/30 pl-2 ml-1">
                                {lastUpdated}
                            </span>
                            <div className="flex items-center gap-1 border-l border-border/30 pl-2 ml-1">
                                <Link
                                    href="/admin"
                                    className="admin-header-btn"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </Link>
                                <Link href="/" className="admin-header-btn">
                                    <Home className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
