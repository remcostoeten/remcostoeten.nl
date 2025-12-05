'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AnimatedNumber } from './animated-number'

interface BlogPostClientProps {
  publishedAt: string
  categories?: string[]
  tags?: string[]
  topics?: string[]
}

export function BlogPostClient({ 
  publishedAt, 
  categories, 
  tags, 
  topics 
}: BlogPostClientProps) {
  const router = useRouter()
  
  // Format date for AnimatedNumber (extract day number)
  const dateObj = new Date(publishedAt)
  const dayNumber = dateObj.getDate()
  const monthYear = dateObj.toLocaleDateString('en-us', { month: 'long', year: 'numeric' })
  const dateDuration = 500

  // Combine all tags for display
  const allTags = [
    ...(categories || []),
    ...(tags || []),
    ...(topics || [])
  ]

  return (
    <div className="space-y-4 mt-2 mb-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back
      </button>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 tabular-nums">
          <AnimatedNumber value={dayNumber} duration={dateDuration} /> {monthYear}
        </p>
        
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Link
                key={tag}
                href={`/categories/${tag.toLowerCase()}`}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
