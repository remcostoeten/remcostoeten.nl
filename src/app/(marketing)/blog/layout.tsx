import { ReactNode } from 'react'
import { SearchBarServer } from '@/components/search/search-bar-server'

export default function BlogLayout({ children }: { children: ReactNode }) {
    return (
        <main className="px-4 md:px-5">
            {/* Search Section for Blog */}
            <div className="mb-8">
                <SearchBarServer placeholder="Search blog posts..." />
            </div>
            {children}
        </main>
    )
}
