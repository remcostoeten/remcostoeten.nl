'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, ChevronRight, Home } from 'lucide-react'
import { AnimatedNumber } from '../ui/animated-number'
import { useEffect } from 'react'
import { trackBlogView } from '@/actions/analytics'

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
  categories?: string[]
  tags?: string[]
  topics?: string[]
  title: string
  readTime: string
  slug: string
  uniqueViews?: number
  totalViews?: number
}

export function BlogPostClient({
  publishedAt,
  categories,
  tags,
  topics,
  title,
  readTime,
  slug,
  uniqueViews = 0,
  totalViews = 0
}: Props) {
  const router = useRouter()

  const dateObj = new Date(publishedAt)
  const dayNumber = dateObj.getDate()
  const monthYear = dateObj.toLocaleDateString('en-us', { month: 'long', year: 'numeric' })
  const dateDuration = 500

  const allTags = [
    ...(categories || []),
    ...(tags || []),
    ...(topics || [])
  ]


  useEffect(() => {
    if (slug) {
      trackBlogView(slug)
    }
  }, [slug])

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-col">
        <div className='flex items-center gap-1.5 w-full text-sm text-muted-foreground'>
          <nav className="flex items-center w-full">
            <Link
              href="/"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <span className="text-foreground/70 truncate max-w-[200px]">
              {title}
            </span>
          </nav>

          <button
            onClick={() => router.back()}
            className="w-full  flex-end inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded-lg transition-all group justify-end"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back
          </button>
        </div>
        <div className="flex items-center gap-3 w-full justify-between">
          <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 tabular-nums">
            <p className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 tabular-nums">
              <AnimatedNumber value={dayNumber} duration={dateDuration} /> {monthYear}
            </p>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <p className="text-neutral-500 dark:text-neutral-400">
              {readTime}
            </p>
            {uniqueViews > 0 && (
              <>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="text-neutral-500 dark:text-neutral-400" title={`${totalViews} total views`}>
                  <AnimatedNumber value={uniqueViews} duration={500} /> unique views
                </span>
              </>
            )}
          </div>


          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/topics/${tag.toLowerCase()}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                  bg-neutral-100 dark:bg-neutral-800/60 
                  text-neutral-600 dark:text-neutral-400 
                  hover:bg-neutral-200 dark:hover:bg-neutral-700/60 
                  border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600
                  transition-all duration-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
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
            <span className="font-medium text-foreground group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors line-clamp-2">
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
            <span className="font-medium text-foreground group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors line-clamp-2">
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
