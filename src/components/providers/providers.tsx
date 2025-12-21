'use client'

import { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import { PosthogProvider } from '@/components/providers/posthog-provider'
import { CustomQueryClientProvider } from '@/components/providers/query-client-provider'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { Footer } from '@/components/layout/footer'
import { ThemeSwitch } from '@/components/theme-switch'

type TProps = {
    children: ReactNode
}

export function AppProviders({ children }: TProps) {
    return (
        <PosthogProvider>
            <CustomQueryClientProvider>
                <VimAuthProvider>
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
                </VimAuthProvider>
            </CustomQueryClientProvider>
        </PosthogProvider>
    )
}