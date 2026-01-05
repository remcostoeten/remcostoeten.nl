'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, ChevronRight, Home, Eye } from 'lucide-react'
import { AnimatedNumber } from '../ui/effects/animated-number'
import { useEffect } from 'react'
import { trackBlogView } from '@/actions/analytics'
import { getDateParts, readMinutes } from '@/lib/blog-format'

type BlogPost = {
  metadata: {
    title: string
    publishedAt: string
    summary: string
    categories?: string[]
    tags?: string[]
    topics?: string[]
  }
  slug: string
}

type Props = {
  publishedAt: string
  tags?: string[]
  title: string
  summary: string
  readTime: string
  slug: string
  uniqueViews?: number
  totalViews?: number
}

export function BlogPostClient({
  publishedAt,
  tags,
  title,
  summary,
  readTime,
  slug,
  uniqueViews = 0,
  totalViews = 0
}: Props) {
  const router = useRouter()

  const dateParts = getDateParts(publishedAt)
  const readTimeMinutes = readMinutes(readTime)
  const dateDuration = 500

  const allTags = tags || []

  useEffect(() => {
    if (slug) {
      trackBlogView(slug)
    }
  }, [slug])

  return (
    <header className="mb-16">
      {/* Navigation Row */}
      <div className="flex items-center justify-between mb-8">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground transition-colors p-1 -ml-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <Link
            href="/blog"
            className="hover:text-foreground transition-colors px-1.5 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
          >
            Blog
          </Link>
        </nav>

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight mb-4">
        {title}
      </h1>

      {/* Summary */}
      {summary && (
        <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mb-6">
          {summary}
        </p>
      )}

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        <time className="flex items-center gap-1 tabular-nums">
          <AnimatedNumber value={dateParts.day} duration={dateDuration} initialProgress={0} />
          <span>{dateParts.month}</span>
          <AnimatedNumber value={dateParts.year} duration={dateDuration} initialProgress={0} />
        </time>

        <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />

        <span className="flex items-center gap-1">
          <AnimatedNumber value={readTimeMinutes} duration={dateDuration} initialProgress={0} />
          <span>min read</span>
        </span>

        {uniqueViews > 0 && (
          <>
            <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="flex items-center gap-1.5" title={`${totalViews} total views`}>
              <Eye className="w-3.5 h-3.5" />
              <AnimatedNumber value={uniqueViews} duration={500} initialProgress={0} />
              <span>views</span>
            </span>
          </>
        )}
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tags/${tag.toLowerCase()}`}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium
                bg-neutral-50 dark:bg-neutral-900/60
                text-neutral-600 dark:text-neutral-400
                border border-neutral-200 dark:border-neutral-800
                hover:bg-neutral-100 dark:hover:bg-neutral-800/60
                hover:border-neutral-300 dark:hover:border-neutral-700
                hover:text-neutral-900 dark:hover:text-neutral-200
                rounded-md transition-all duration-200"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

interface PostNavigationProps {
  prevPost: BlogPost | null
  nextPost: BlogPost | null
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  if (!prevPost && !nextPost) return null

  return (
    <nav className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevPost ? (
          <Link
            href={`/blog/${prevPost.slug}`}
            className="group flex flex-col p-4 rounded-xl 
              bg-neutral-50 dark:bg-neutral-900/50 
              border border-neutral-200 dark:border-neutral-800
              hover:border-neutral-300 dark:hover:border-neutral-700
              hover:bg-neutral-100 dark:hover:bg-neutral-800/50
              transition-all duration-200"
          >
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
              Previous
            </span>
            <span className="font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
              {prevPost.metadata.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextPost ? (
          <Link
            href={`/blog/${nextPost.slug}`}
            className="group flex flex-col p-4 rounded-xl text-right
              bg-neutral-50 dark:bg-neutral-900/50 
              border border-neutral-200 dark:border-neutral-800
              hover:border-neutral-300 dark:hover:border-neutral-700
              hover:bg-neutral-100 dark:hover:bg-neutral-800/50
              transition-all duration-200"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mb-2">
              Next
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
              {nextPost.metadata.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  )
}
