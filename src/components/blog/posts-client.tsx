'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, ArrowRight, EyeOff } from 'lucide-react'

import { getDateParts, readMinutes } from '@/lib/blog-format'
import { useBlogFilter } from '@/hooks/use-blog-filter'

export function PostCountHeader({ count }: { count: number }) {
  return (
    <span className="text-muted-foreground/60 inline-flex items-baseline gap-1">
      {count}
      <span>posts</span>
    </span>
  )
}

type BlogPost = {
  metadata: {
    title: string
    publishedAt: string
    summary: string
    categories?: string[]
    tags?: string[]
    topics?: string[]
    readTime?: string
    draft?: boolean
  }
  slug: string
  views?: number
  uniqueViews?: number
}

type Props = {
  post: BlogPost
  index: number
}

function BlogCard({ post, index }: Props) {
  const formattedIndex = (index + 1).toString().padStart(2, '0')

  const dateParts = getDateParts(post.metadata.publishedAt)
  const dayNumber = dateParts.day
  const monthYear = `${dateParts.month} ${dateParts.year}`
  const readTimeMinutes = readMinutes(post.metadata.readTime || '')

  const allTags = [
    ...(post.metadata.categories || []),
    ...(post.metadata.tags || []),
    ...(post.metadata.topics || [])
  ]
  const extraTags = Math.max(allTags.length - 3, 0)

  return (
    <li className="block p-0 m-0">
      <div>
        <Link
          href={`/blog/${post.slug}`}
          className="group relative block active:scale-[0.995] transition-transform duration-200 overflow-hidden first:rounded-t-2xl last:rounded-b-2xl [&:last-child>article]:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"

        >
          <div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            aria-hidden="true"
          />

          <article className="relative flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 py-5 sm:py-6 px-2 border-b border-neutral-200 dark:border-neutral-800/60 z-10">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <span
                className="text-4xl sm:text-5xl font-bold text-neutral-300 dark:text-neutral-700/40 leading-none select-none tabular-nums shrink-0 w-12 sm:w-16 text-right"
                aria-hidden="true"
                >
                {formattedIndex}
              </span>

              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-50 group-hover:text-emerald-600 dark:group-hover:text-lime-400 transition-colors duration-200 leading-snug pr-4">
                  {post.metadata.draft && (
                    <span className="inline-flex items-center mr-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                      Draft
                    </span>
                  )}
                  {post.metadata.title}
                </h2>

                {post.metadata.summary && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400/80 line-clamp-2 mt-2 leading-relaxed max-w-xl">
                    {post.metadata.summary}
                  </p>
                )}

                {allTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Tags">
                    {allTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/80 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                     {extraTags > 0 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-neutral-900/60 text-neutral-500 dark:text-neutral-500 border border-neutral-300 dark:border-neutral-800">
                        +{extraTags}
                      </span>
                    )}
                  </div>
                ) : null}

                <footer className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 text-xs text-neutral-500 dark:text-neutral-500">
                  <time dateTime={post.metadata.publishedAt} className="tabular-nums">
                    {dayNumber} {monthYear}
                  </time>
                  {post.metadata.readTime && (
                    <>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <span>
                        {readTimeMinutes} min read
                      </span>
                    </>
                  )}
                  {typeof post.uniqueViews === 'number' && (
                    <>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <span title={`${post.views} total views`}>
                        {post.uniqueViews} unique views
                      </span>
                    </>
                  )}
                </footer>
              </div>
            </div>

            <div className="shrink-0 self-center" aria-hidden="true">
              <div className="relative w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-transparent group-hover:bg-emerald-100 dark:group-hover:bg-lime-500/20 group-hover:border-emerald-200 dark:group-hover:border-transparent flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-110">
                <ArrowUpRight className="absolute w-4 h-4 text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-lime-400 transition-all duration-300 group-hover:-translate-y-6 group-hover:translate-x-6" />
                <ArrowUpRight className="absolute w-4 h-4 text-emerald-600 dark:text-lime-400 -translate-x-6 translate-y-6 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0" />
              </div>
            </div>
          </article>
        </Link>
      </div>
    </li>
  )
}

type BlogPostsProps = {
  posts: BlogPost[]
}

function BlogCardSkeleton() {
  return (
    <li className="block p-0 m-0">
      <div className="relative block overflow-hidden first:rounded-t-2xl last:rounded-b-2xl [&:last-child>article]:border-b-0">
        <article className="relative flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 py-5 sm:py-6 px-2 border-b border-neutral-200 dark:border-neutral-800/60">
          {/* Main content area with index number and content */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Index number skeleton */}
            <div className="text-4xl sm:text-5xl font-bold text-neutral-300 dark:text-neutral-700/40 leading-none select-none tabular-nums shrink-0 w-12 sm:w-16 text-right">
              <div className="bg-neutral-100 dark:bg-neutral-700/40 rounded animate-pulse h-12 w-12 ml-auto" />
            </div>

            {/* Content area */}
            <div className="flex-1 min-w-0 pt-1">
              {/* Title skeleton */}
              <div className="font-medium text-lg leading-snug pr-4 mb-2">
                <div className="h-6 bg-neutral-100 dark:bg-neutral-700/40 rounded animate-pulse min-h-[24px]" />
              </div>

              {/* Summary skeleton */}
              <div className="text-sm leading-relaxed max-w-xl mb-3">
                <div className="h-4 bg-neutral-100 dark:bg-neutral-700/40 rounded animate-pulse mb-2" />
                <div className="h-4 bg-neutral-100 dark:bg-neutral-700/40 rounded animate-pulse w-3/4" />
              </div>

              {/* Tags skeleton */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <div className="h-6 w-16 bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/50 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/50 rounded-full animate-pulse" />
                <div className="h-6 w-12 bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/50 rounded-full animate-pulse" />
              </div>

              {/* Footer metadata */}
              <footer className="flex flex-wrap items-center gap-3 text-xs">
                <div className="h-4 w-24 bg-neutral-50 dark:bg-neutral-700/40 rounded animate-pulse" />
                <div className="h-4 w-20 bg-neutral-50 dark:bg-neutral-700/40 rounded animate-pulse" />
                <div className="h-4 w-16 bg-neutral-50 dark:bg-neutral-700/40 rounded animate-pulse" />
              </footer>
            </div>
          </div>
        </article>
      </div>
    </li>
  )
}

export function BlogPostsClient({ posts }: BlogPostsProps) {
  const [showAll, setShowAll] = useState(false)
  const { filter, setFilter } = useBlogFilter()

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true
    if (filter === 'drafts') return post.metadata.draft === true
    if (filter === 'published') return !post.metadata.draft
    return true
  })

  const displayedBlogs = showAll ? filteredPosts : filteredPosts.slice(0, 3)
  const hasMorePosts = filteredPosts.length > 3

  return (
    <div>
      {filter !== 'all' && (
        <div className="mb-4 flex items-center gap-2 px-2 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
          <EyeOff className="w-3 h-3" />
          <span>Filtering: showing {filter === 'drafts' ? 'drafts only' : 'published only'}</span>
          <button
            onClick={() => setFilter('all')}
            className="ml-auto px-2 py-0.5 hover:bg-amber-500/20 transition-colors"
          >
            Clear (:show all)
          </button>
        </div>
      )}

      <ul className="flex flex-col m-0 p-0 list-none" role="list">
        {displayedBlogs.map((post, index) => (
          <BlogCard key={post.slug} post={post} index={index} />
        ))}
      </ul>

      {filteredPosts.length === 0 && (
        <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
          <p className="text-sm">No posts match the current filter.</p>
          <button
            onClick={() => setFilter('all')}
            className="mt-2 text-xs text-amber-400 hover:underline"
          >
            :show all
          </button>
        </div>
      )}

      {hasMorePosts && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {showAll ? 'Show less posts' : 'View all posts'}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  )
}
