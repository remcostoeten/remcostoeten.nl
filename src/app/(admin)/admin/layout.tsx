import { checkAdminStatus } from "@/actions/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const isAdmin = await checkAdminStatus();

    if (!isAdmin) {
        redirect("/");
    }

    const lastUpdated = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="min-h-screen pt-16 md:pt-20 px-3 md:px-8 max-w-7xl mx-auto pb-12">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Welcome back, Remco</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden md:block">
                        Last updated: {lastUpdated}
                    </span>
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border hover:bg-muted transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Refresh</span>
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border hover:bg-muted transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Home</span>
                    </Link>
                </div>
            </div>
            {children}
        </div>
    );
}
