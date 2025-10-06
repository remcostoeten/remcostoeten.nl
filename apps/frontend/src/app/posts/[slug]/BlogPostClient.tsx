"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { BlogPost } from "@/lib/blog/filesystem-utils"
import { Search, Calendar, Clock } from "lucide-react"

interface BlogPostsClientProps {
  allPosts: BlogPost[]
}

export function BlogPostsClient({ allPosts }: BlogPostsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(allPosts.map((post) => post.category))
    return ["all", ...Array.from(cats)]
  }, [allPosts])

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [allPosts, searchQuery, selectedCategory])

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    allPosts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  }, [allPosts])

  return (
    <div className="space-y-8">
      {/* Search and Filter Section */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search blog posts"
          />
        </div>

        {/* Category Filter - Mobile optimized horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${selectedCategory === category
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent/50"
                }
              `}
              aria-pressed={selectedCategory === category}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Blog Posts List - Mobile-first card layout */}
      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="group relative rounded-lg border border-border bg-card p-6 transition-all hover:border-accent/50 hover:shadow-lg"
            >
              <Link href={`/posts/${post.slug}`} className="block space-y-3">
                {/* Post Header */}
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground group-hover:text-accent transition-colors text-balance">
                    {post.title}
                  </h2>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <time dateTime={post.publishedAt} className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime} min read
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-muted-foreground leading-relaxed text-pretty">{post.excerpt}</p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </article>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No articles found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              className="mt-4 text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Popular Tags Section - Hidden on mobile, shown on larger screens */}
      {allTags.length > 0 && (
        <aside className="hidden lg:block mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Popular Topics</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 15).map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="text-sm px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  )
}
