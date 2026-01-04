'use client'

import { ReactNode, lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { CustomQueryClientProvider } from '@/components/providers/query-client-provider'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { Footer } from '@/components/layout/footer'
import { ThemeSwitch } from '@/components/theme-switch'
import { StaggerProvider } from '@/components/ui/stagger-system'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { DevWidget } from '@/components/dev/dev-widget'

const Analytics = lazy(() => import('@vercel/analytics/react').then(m => ({ default: m.Analytics })))
const SpeedInsights = lazy(() => import('@vercel/speed-insights/next').then(m => ({ default: m.SpeedInsights })))

type TProps = {
    children: ReactNode
}

export function AppProviders({ children }: TProps) {
    return (
        <PostHogProvider>
            <CustomQueryClientProvider>
                <VimAuthProvider>
                    <StaggerProvider config={{ baseDelay: 80, initialDelay: 0, strategy: 'mount-order' }}>
                        {children}
                        <Toaster />
                        <ThemeSwitch position="fixed" offset={20} side="right" />
                        <Suspense fallback={null}>
                            <Analytics />
                        </Suspense>
                        <Suspense fallback={null}>
                            <SpeedInsights />
                        </Suspense>
                        <DevWidget />
                    </StaggerProvider>
                </VimAuthProvider>
            </CustomQueryClientProvider>
        </PostHogProvider>
    )
}
