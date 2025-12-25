import { checkAdminStatus } from "@/actions/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const isAdmin = await checkAdminStatus();

    if (!isAdmin) {
        redirect("/");
    }

    return (
        <div className="min-h-screen pt-20 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, Remco.</p>
            </div>
            {children}
        </div>
    );
}
