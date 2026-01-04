import { ReactNode } from 'react'
import { SearchBarServer } from '@/components/search/search-bar-server'

export default function BlogLayout({ children }: { children: ReactNode }) {
    return (
        <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
            {/* Search Section for Blog */}
            <div className="mb-5 sm:mb-6 md:mb-8">
                <SearchBarServer placeholder="Search blog posts..." />
            </div>
            {children}
        </main>
    )
}
