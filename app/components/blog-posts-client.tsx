'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { formatDate } from 'app/blog/client-utils'
import { AnimatedNumber } from './AnimatedNumber'

interface BlogPost {
  metadata: {
    title: string
    publishedAt: string
    summary: string
    categories?: string[]
  }
  slug: string
}

interface BlogCardProps {
  post: BlogPost
  index: number
}

function BlogCard({ post, index }: BlogCardProps) {
  const formattedIndex = (index + 1).toString().padStart(2, '0')
  const asciiRef = useRef<HTMLDivElement | null>(null)
  const asciiCharsRef = useRef<string[]>([])
  const frameRef = useRef<number | null>(null)

  // Calculate animation duration for index (staggered)
  const indexDuration = 800 + (index * 100)
  
  // Format date for AnimatedNumber (extract day number)
  const dateObj = new Date(post.metadata.publishedAt)
  const dayNumber = dateObj.getDate()
  const monthYear = dateObj.toLocaleDateString('en-us', { month: 'long', year: 'numeric' })
  const dateDuration = 1000 + (index * 50)

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

    const animate = () => {
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
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block active:scale-[0.995] transition-transform duration-200 overflow-hidden first:rounded-t-2xl last:rounded-b-2xl [&:last-child>article]:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
      >
        {/* Neutral gradient background on hover */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          aria-hidden="true"
        />

        {/* ASCII texture layer */}
        <div
          className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          aria-hidden="true"
        >
          <div
            ref={asciiRef}
            className="w-full h-full font-mono text-[10px] leading-[10px] text-lime-400/12 break-all select-none tracking-widest p-4"
          />
        </div>

        <article className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-8 px-6 border-b border-neutral-800/60 z-10">
          <div className="flex-1 min-w-0">
            <header className="flex items-start gap-3">
              <span
                className="text-4xl font-bold text-neutral-600/30 leading-none flex items-center min-h-[3.5rem] select-none tabular-nums"
                aria-hidden="true"
              >
                <AnimatedNumber value={formattedIndex} duration={indexDuration} />
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-lg text-neutral-50 group-hover:text-lime-400 transition-colors duration-200 leading-snug truncate">
                  {post.metadata.title}
                </p>

                {post.metadata.summary && (
                  <p className="text-xs text-neutral-400/80 line-clamp-2 mt-1.5 leading-relaxed">
                    {post.metadata.summary}
                  </p>
                )}

                {post.metadata.categories && post.metadata.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 mb-1" aria-label="Categories">
                    {post.metadata.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-900/60 text-neutral-400 border border-transparent group-hover:border-lime-400/30 group-hover:bg-lime-500/5 group-hover:text-lime-400 transition-colors duration-300 cursor-pointer"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <footer className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-500">
                  <time dateTime={post.metadata.publishedAt} className="tabular-nums">
                    <AnimatedNumber value={dayNumber} duration={dateDuration} /> {monthYear}
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
    </li>
  )
}

interface BlogPostsClientProps {
  posts: BlogPost[]
}

export function BlogPostsClient({ posts }: BlogPostsClientProps) {
  const [showAll, setShowAll] = useState(false)

  // Show max 3 posts if showAll is false, otherwise show all
  const displayedBlogs = showAll ? posts : posts.slice(0, 3)
  const hasMorePosts = posts.length > 3

  return (
    <div>
      <ul className="flex flex-col m-0 p-0 list-none" role="list">
        {displayedBlogs.map((post, index) => (
          <BlogCard key={post.slug} post={post} index={index} />
        ))}
      </ul>

      {hasMorePosts && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-6 px-4 py-2 bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 rounded-lg transition-colors duration-200 text-sm font-medium border border-lime-500/20 hover:border-lime-500/30"
        >
          {showAll ? 'Show Less' : `Read More (${posts.length - 3} more posts)`}
        </button>
      )}
    </div>
  )
}