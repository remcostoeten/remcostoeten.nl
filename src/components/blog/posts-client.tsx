'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

import { AnimatedNumber } from '../ui/animated-number'

export function PostCountHeader({ count }: { count: number }) {
  return (
    <span className="text-muted-foreground/60 inline-flex items-baseline">
      <span className="-translate-y-[1px]">
        <AnimatedNumber value={count} duration={600} />
      </span>
      {' '}posts
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
  }
  slug: string
}

type Props = {
  post: BlogPost
  index: number
}

function BlogCard({ post, index }: Props) {
  const formattedIndex = (index + 1).toString().padStart(2, '0')
  const asciiRef = useRef<HTMLDivElement | null>(null)
  const asciiCharsRef = useRef<string[]>([])
  const frameRef = useRef<number | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-100px" })
  const [shouldAnimateNumbers, setShouldAnimateNumbers] = useState(false)

  const indexDuration = 800 + (index * 100)

  const dateObj = new Date(post.metadata.publishedAt)
  const dayNumber = dateObj.getDate()
  const monthYear = dateObj.toLocaleDateString('en-us', { month: 'long', year: 'numeric' })
  const dateDuration = 1000 + (index * 50)

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShouldAnimateNumbers(true), 200)
      return () => clearTimeout(timer)
    }
  }, [isInView])

  useEffect(() => {
    const chars = ['+', '.', ':', '-', '·', ' ']
    asciiCharsRef.current = Array.from({ length: 1200 }, () => {
      return Math.random() > 0.85
        ? ' '
        : chars[Math.floor(Math.random() * chars.length)]
    })

    if (asciiRef.current) {
      asciiRef.current.innerText = asciiCharsRef.current.join('')
    }

    function animate() {

      const asciiChars = ['+', '.', ':', '-', '·', ' ']

      if (asciiRef.current && asciiCharsRef.current.length > 0) {
        for (let i = 0; i < 5; i++) {
          const idx = Math.floor(
            Math.random() * asciiCharsRef.current.length,
          )
          if (Math.random() > 0.5) {
            asciiCharsRef.current[idx] =
              asciiChars[
              Math.floor(Math.random() * asciiChars.length)
              ]
          }
        }
        asciiRef.current.innerText = asciiCharsRef.current.join('')
      }

      frameRef.current = window.requestAnimationFrame(animate)
    }

    frameRef.current = window.requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return (
    <li className="block p-0 m-0">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
        animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 40, filter: 'blur(8px)' }}
        transition={{
          duration: 0.6,
          delay: index * 0.1,
          ease: [0.16, 1, 0.3, 1]
        }}
      >
        <Link
          href={`/blog/${post.slug}`}
          className="group relative block active:scale-[0.995] transition-transform duration-200 overflow-hidden first:rounded-t-2xl last:rounded-b-2xl [&:last-child>article]:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
          style={{ contain: 'layout style paint' }} // Prevent layout shifts
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <div
              ref={asciiRef}
              className="w-full h-full font-mono text-[10px] leading-[10px] text-lime-400/12 break-all select-none tracking-widest"
              style={{ contain: 'strict' }} // Contain ASCII animation
            />
          </div>

          <article className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 py-8 px-6 border-b border-neutral-800/60 z-10 min-h-[120px]">
            <div className="flex-1 min-w-0">
              <header className="flex items-start gap-3">
                <span
                  className="text-4xl font-bold text-neutral-600/30 leading-none flex items-center min-h-[3.5rem] w-[3rem] select-none tabular-nums flex-shrink-0"
                  aria-hidden="true"
                >
                  {shouldAnimateNumbers && <AnimatedNumber value={formattedIndex} duration={indexDuration} />}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-lg text-neutral-50 group-hover:text-lime-400 transition-colors duration-200 leading-snug truncate min-h-[1.5rem]">
                    {post.metadata.title}
                  </p>

                  {post.metadata.summary && (
                    <p className="text-xs text-neutral-400/80 line-clamp-2 mt-1.5 leading-relaxed min-h-[2.5rem]">
                      {post.metadata.summary}
                    </p>
                  )}

                  {(() => {
                    const allTags = [
                      ...(post.metadata.categories || []),
                      ...(post.metadata.tags || []),
                      ...(post.metadata.topics || [])
                    ]
                    return allTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-3 mb-1" aria-label="Tags">
                        {allTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-900/60 text-neutral-400 cursor-default"
                          >
                            {tag}
                          </span>
                        ))}
                        {allTags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-900/60 text-neutral-500">
                            +{allTags.length - 3}
                          </span>
                        )}
                      </div>
                    ) : null
                  })()}

                  <footer className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-500">
                    <time dateTime={post.metadata.publishedAt} className="tabular-nums">
                      {shouldAnimateNumbers && <AnimatedNumber value={dayNumber} duration={dateDuration} />} {monthYear}
                    </time>
                  </footer>
                </div>
              </header>
            </div>

            <div className="flex-shrink-0 ml-auto sm:ml-0" aria-hidden="true">
              <div className="relative w-10 h-10 rounded-full bg-neutral-900/60 group-hover:bg-lime-500/20 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-110">
                <ArrowUpRight className="absolute w-4 h-4 text-neutral-400 group-hover:text-lime-400 transition-all duration-300 group-hover:-translate-y-6 group-hover:translate-x-6" />
                <ArrowUpRight className="absolute w-4 h-4 text-lime-400 -translate-x-6 translate-y-6 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0" />
              </div>
            </div>
          </article>
        </Link>
      </motion.div>
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
        <article className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-8 px-6 border-b border-neutral-800/60 min-h-[120px]">
          <div className="flex-1 min-w-0">
            <header className="flex items-start gap-3">
              <div className="w-[3rem] h-[3.5rem] bg-neutral-800/40 rounded animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-6 bg-neutral-800/40 rounded animate-pulse mb-2 min-h-[1.5rem]" />
                <div className="h-10 bg-neutral-800/40 rounded animate-pulse min-h-[2.5rem]" />
                <div className="flex gap-2 mt-3 mb-1">
                  <div className="h-5 w-16 bg-neutral-800/40 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-neutral-800/40 rounded animate-pulse" />
                </div>
                <div className="h-4 bg-neutral-800/40 rounded animate-pulse mt-3 w-24" />
              </div>
            </header>
          </div>
          <div className="flex-shrink-0 ml-auto sm:ml-0">
            <div className="w-10 h-10 rounded-full bg-neutral-800/40 animate-pulse" />
          </div>
        </article>
      </div>
    </li>
  )
}

export function BlogPostsClient({ posts }: BlogPostsProps) {
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const displayedBlogs = showAll ? posts : posts.slice(0, 3)
  const hasMorePosts = posts.length > 3

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div style={{ contain: 'layout' }}>
        <ul className="flex flex-col m-0 p-0 list-none" role="list" style={{ contain: 'layout' }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div style={{ contain: 'layout' }}>
      <ul className="flex flex-col m-0 p-0 list-none" role="list" style={{ contain: 'layout' }}>
        {displayedBlogs.map((post, index) => (
          <BlogCard key={post.slug} post={post} index={index} />
        ))}
      </ul>

      {hasMorePosts && (
        <div className="mt-8 flex justify-end animate-enter" style={{ animationDelay: '400ms', contain: 'layout' }}>
          <button
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-100 transition-colors"
          >
            {showAll ? 'Show less posts' : 'View all posts'}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  )
}