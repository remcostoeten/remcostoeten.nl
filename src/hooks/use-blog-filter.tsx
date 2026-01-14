'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type BlogFilter = 'all' | 'drafts' | 'published'

type BlogFilterContextType = {
    filter: BlogFilter
    setFilter: (filter: BlogFilter) => void
}

const BlogFilterContext = createContext<BlogFilterContextType | null>(null)

export function BlogFilterProvider({ children }: { children: ReactNode }) {
    const [filter, setFilter] = useState<BlogFilter>('all')

    return (
        <BlogFilterContext.Provider value={{ filter, setFilter }}>
            {children}
        </BlogFilterContext.Provider>
    )
}

export function useBlogFilter() {
    const context = useContext(BlogFilterContext)
    if (!context) {
        return { filter: 'all' as BlogFilter, setFilter: () => {} }
    }
    return context
}
