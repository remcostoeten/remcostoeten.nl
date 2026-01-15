import { ReactNode } from 'react'
import { Footer } from '@/components/layout/footer'
import { AnnouncementBanner } from '@/components/ui/announcement-banner'

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen w-full flex flex-col">
            <AnnouncementBanner />
            <main className="py-6 max-w-2xl mx-auto w-full grow border-x border-border/50">
                {children}
            </main>
            <Footer />
        </div>
    )
}
