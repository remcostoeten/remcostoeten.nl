'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getBlogPosts, getAllBlogPosts } from '@/utils/utils'
import { Suspense } from 'react'

// Search results type
interface SearchResult {
  slug: string
  title: string
  summary?: string
  categories?: string[]
  tags?: string[]
}

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export function SearchBar({ placeholder = "Search posts...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [allPosts, setAllPosts] = useState<SearchResult[]>([])
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load all posts on mount
  useEffect(() => {
    const posts = getAllBlogPosts().map(post => ({
      slug: post.slug,
      title: post.metadata.title,
      summary: post.metadata.summary,
      categories: post.metadata.categories,
      tags: post.metadata.tags
    }))
    setAllPosts(posts)
  }, [])

  // Search functionality
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)

    // Simple search implementation
    const searchResults = allPosts.filter(post => {
      const searchTerm = query.toLowerCase()
      const title = post.title.toLowerCase()
      const summary = post.summary?.toLowerCase() || ''
      const categories = post.categories?.join(' ').toLowerCase() || ''
      const tags = post.tags?.join(' ').toLowerCase() || ''

      return (
        title.includes(searchTerm) ||
        summary.includes(searchTerm) ||
        categories.includes(searchTerm) ||
        tags.includes(searchTerm)
      )
    }).slice(0, 8) // Limit to 8 results

    setResults(searchResults)
    setIsOpen(searchResults.length > 0)
    setIsLoading(false)
  }, [query, allPosts])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleResultClick = (slug: string) => {
    router.push(`/blog/${slug}`)
    setIsOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (results.length > 0) {
      handleResultClick(results[0].slug)
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(results.length > 0)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            aria-label="Search blog posts"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setIsOpen(false)
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((result) => (
                <button
                  key={result.slug}
                  onClick={() => handleResultClick(result.slug)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors focus:bg-muted/50 focus:outline-none"
                >
                  <div className="font-medium text-foreground">{result.title}</div>
                  {result.summary && (
                    <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {result.summary}
                    </div>
                  )}
                  {(result.categories || result.tags) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.categories?.slice(0, 2).map((category) => (
                        <span key={category} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                          {category}
                        </span>
                      ))}
                      {result.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}