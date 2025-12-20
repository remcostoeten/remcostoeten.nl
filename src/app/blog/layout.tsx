import { ReactNode } from 'react'
import { SearchBar } from '@/components/search/search-bar'

export default function BlogLayout({ children }: { children: ReactNode }) {
    return (
        <main className="px-4 md:px-5">
            {/* Search Section for Blog */}
            <div className="mb-8">
                <SearchBar placeholder="Search blog posts..." />
            </div>
            {children}
        </main>
    )
}
