'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      // Extract headings from the article
      const article = document.querySelector('article')
      if (!article) return

      const headingElements = Array.from(
        article.querySelectorAll('h2, h3, h4, h5, h6')
      ) as HTMLElement[]

      const extractedHeadings: Heading[] = headingElements
        .filter(element => element.id)
        .map((element) => ({
          id: element.id || '',
          text: element.textContent || '',
          level: parseInt(element.tagName[1]),
        }))

      setHeadings(extractedHeadings)

      // Set up intersection observer for active heading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id)
            }
          })
        },
        { rootMargin: '-50% 0px -50% 0px' }
      )

      headingElements.forEach((element) => {
        if (element.id) {
          observer.observe(element)
        }
      })

      return () => {
        headingElements.forEach((element) => {
          observer.unobserve(element)
        })
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (!mounted || headings.length === 0) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="max-w-2xl mx-auto h-full relative">
        <aside className="hidden 2xl:block absolute right-full top-32 mr-12 w-56 max-h-[calc(100vh-140px)] overflow-y-auto pointer-events-auto">
          <div className="sticky top-0">
            <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-4">
              On this page
            </h2>
            <ul className="space-y-2.5 text-sm">
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  style={{ marginLeft: `${(heading.level - 2) * 14}px` }}
                >
                  <Link
                    href={`#${heading.id}`}
                    className={`block py-1.5 px-2 rounded transition-all duration-200 ${activeId === heading.id
                        ? 'text-lime-600 dark:text-lime-400 font-semibold bg-lime-500/10 dark:bg-lime-500/5 border-l-2 border-lime-600 dark:border-lime-400 pl-1.5'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900/50'
                      }`}
                  >
                    {heading.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>,
    document.body
  )
}
