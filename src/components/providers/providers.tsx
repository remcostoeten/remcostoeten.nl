'use client'

import { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import { CustomQueryClientProvider } from '@/components/providers/query-client-provider'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { Footer } from '@/components/layout/footer'
import { ThemeSwitch } from '@/components/theme-switch'
import { AnimatedNumberProvider } from '@/components/ui/animated-number'
import { StaggerProvider } from '@/components/ui/stagger-system'
import { PostHogProvider } from '@/components/providers/posthog-provider'

type TProps = {
    children: ReactNode
}

export function AppProviders({ children }: TProps) {
    return (
        <PostHogProvider>
            <CustomQueryClientProvider>
                <VimAuthProvider>
                    <StaggerProvider config={{ baseDelay: 80, initialDelay: 0 }}>
                        <AnimatedNumberProvider>
                            <div className="min-h-screen w-full flex flex-col">
                                <main className="py-8 md:py-12 max-w-2xl mx-auto w-full grow border-x border-border/50">
                                    {children}
                                    <Toaster />
                                </main>
                                <Footer />
                            </div>
                            <ThemeSwitch position="fixed" offset={20} side="right" />
                            <Analytics />
                            <SpeedInsights />
                        </AnimatedNumberProvider>
                    </StaggerProvider>
                </VimAuthProvider>
            </CustomQueryClientProvider>
        </PostHogProvider>
    )
}
