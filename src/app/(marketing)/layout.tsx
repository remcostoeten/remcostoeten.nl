import { ReactNode } from 'react'
import { Footer } from '@/components/layout/footer'

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen w-full flex flex-col">
            <main className="py-8 md:py-12 max-w-2xl mx-auto w-full grow border-x border-border/50">
                {children}
            </main>
            <Footer />
        </div>
    )
}
