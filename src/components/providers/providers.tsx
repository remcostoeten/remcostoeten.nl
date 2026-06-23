"use client";

import nextDynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { CustomQueryClientProvider } from "@/components/providers/query-client-provider";

import { StaggerProvider } from "@/components/ui/stagger-system";
import { BlogFilterProvider } from "@/hooks/use-blog-filter";

const AppChrome = nextDynamic(
    () =>
        import("@/components/providers/app-chrome").then((m) => ({
            default: m.AppChrome,
        })),
    { ssr: false },
);

type TProps = {
    children: ReactNode;
};

function useIdleAppChrome() {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        if (shouldLoad) return;

        if ("requestIdleCallback" in window) {
            const idleId = window.requestIdleCallback(() => setShouldLoad(true), {
                timeout: 2500,
            });
            return () => window.cancelIdleCallback(idleId);
        }

        const timer = globalThis.setTimeout(() => setShouldLoad(true), 1500);
        return () => globalThis.clearTimeout(timer);
    }, [shouldLoad]);

    return shouldLoad;
}

export function AppProviders({ children }: TProps) {
    const shouldLoadAppChrome = useIdleAppChrome();

    return (
        <CustomQueryClientProvider>
            <BlogFilterProvider>
                <StaggerProvider
                    config={{
                        baseDelay: 80,
                        initialDelay: 0,
                        strategy: "mount-order",
                    }}
                >
                    {children}
                    {shouldLoadAppChrome && <AppChrome />}
                </StaggerProvider>
            </BlogFilterProvider>
        </CustomQueryClientProvider>
    );
}
