'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  posts?: SearchResult[]
}

export function SearchBar({ placeholder = "Search posts...", className = "", posts = [] }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [allPosts, setAllPosts] = useState<SearchResult[]>(posts)
  const [activeIndex, setActiveIndex] = useState(-1)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const listboxId = `${id}-search-results`
  const getOptionId = (index: number) => `${id}-search-option-${index}`

  // Load all posts on mount
  useEffect(() => {
    setAllPosts(posts)
  }, [posts])

  // Search functionality
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      setIsLoading(false)
      setActiveIndex(-1)
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
    setIsOpen(true)
    setActiveIndex(searchResults.length > 0 ? 0 : -1)
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && query.trim() && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setIsOpen(true)
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (results.length === 0) return
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (results.length === 0) return
      setActiveIndex((prev) => Math.max(prev - 1, 0))
      return
    }

    if (event.key === 'Home') {
      if (results.length === 0) return
      event.preventDefault()
      setActiveIndex(0)
      return
    }

    if (event.key === 'End') {
      if (results.length === 0) return
      event.preventDefault()
      setActiveIndex(results.length - 1)
      return
    }

    if (event.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && activeIndex < results.length) {
        event.preventDefault()
        handleResultClick(results[activeIndex].slug)
      }
      return
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim()) setIsOpen(true)
              setActiveIndex(results.length > 0 ? 0 : -1)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={
              isOpen && activeIndex >= 0 && activeIndex < results.length
                ? getOptionId(activeIndex)
                : undefined
            }
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
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          aria-busy={isLoading}
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider" aria-hidden="true">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((result, index) => (
                <div
                  key={result.slug}
                  id={getOptionId(index)}
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleResultClick(result.slug)}
                  className={`w-full px-4 py-3 text-left cursor-pointer transition-colors ${
                    activeIndex === index ? 'bg-muted/50' : 'hover:bg-muted/50'
                  }`}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}