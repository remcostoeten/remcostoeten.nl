'use client'

import { ReactNode, lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { CustomQueryClientProvider } from '@/components/providers/query-client-provider'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { Footer } from '@/components/layout/footer'

import { StaggerProvider } from '@/components/ui/stagger-system'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { DevWidget } from '../../../tools/dev-menu'
import { useSession } from '@/lib/auth-client'
import { signOut } from '@/lib/auth-client'
import { ThemeSwitch } from '@/components/theme-switch'

const Analytics = lazy(() => import('@vercel/analytics/react').then(m => ({ default: m.Analytics })))
const SpeedInsights = lazy(() => import('@vercel/speed-insights/next').then(m => ({ default: m.SpeedInsights })))

type TProps = {
    children: ReactNode
}

function DevWidgetWrapper() {
    const { data: session } = useSession()

    return (
        <DevWidget
            session={session}
            onSignOut={signOut}
            showAuth={true}
            showRoutes={true}
            showSystemInfo={true}
            showSettings={true}
            routes={[
                '/',
                '/admin',
                '/blog',
                '/blog/[...slug]',
                '/blog/topics',
                '/blog/topics/[topic]',
                '/projects',
                '/projects/[slug]',
                '/auth/callback',
                '/api/auth/[...all]',
                '/api/auth/providers',
                '/api/example',
                '/api/github/activity',
                '/api/github/commits',
                '/api/github/contributions',
                '/api/github/events',
                '/api/github/repo',
                '/api/spotify/auth-url',
                '/api/spotify/callback',
                '/api/spotify/now-playing',
                '/api/spotify/recent',
                '/api/spotify/token',
                '/api/sync',
                '/og',
                '/privacy',
                '/terms',
                '/rss',
                '/sitemap-pages.xml',
                '/sitemap-posts.xml',
                '/sitemap-tags.xml',
                '/sitemap.xml',
                '/robots.txt',
                '/heading-showcase',
                '/posthog-demo'
            ]}
        />
    )
}

export function AppProviders({ children }: TProps) {
    return (
        <PostHogProvider>
            <CustomQueryClientProvider>
                <VimAuthProvider>
                    <StaggerProvider config={{ baseDelay: 80, initialDelay: 0, strategy: 'mount-order' }}>
                        <ThemeSwitch />
                        {children}
                        <Toaster />

                        <Suspense fallback={null}>
                            <Analytics />
                        </Suspense>
                        <Suspense fallback={null}>
                            <SpeedInsights />
                        </Suspense>
                        <DevWidgetWrapper />
                    </StaggerProvider>
                </VimAuthProvider>
            </CustomQueryClientProvider>
        </PostHogProvider>
    )
}
