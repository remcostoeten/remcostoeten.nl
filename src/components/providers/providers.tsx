'use client'

import { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import { CustomQueryClientProvider } from '@/components/providers/query-client-provider'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { Footer } from '@/components/layout/footer'
import { ThemeSwitch } from '@/components/theme-switch'
import { StaggerProvider } from '@/components/ui/stagger-system'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { DevWidget } from '@/components/dev/dev-widget'

type TProps = {
    children: ReactNode
}

export function AppProviders({ children }: TProps) {
    return (
        <PostHogProvider>
            <CustomQueryClientProvider>
                <VimAuthProvider>
                    <StaggerProvider config={{ baseDelay: 80, initialDelay: 0 }}>
                        {children}
                        <Toaster />
                        <ThemeSwitch position="fixed" offset={20} side="right" />
                        <Analytics />
                        <SpeedInsights />
                        <DevWidget />
                    </StaggerProvider>
                </VimAuthProvider>
            </CustomQueryClientProvider>
        </PostHogProvider>
    )
}
