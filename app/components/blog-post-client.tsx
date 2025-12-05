'use client'

import { AnimatedNumber } from './AnimatedNumber'

interface BlogPostClientProps {
  publishedAt: string
}

export function BlogPostClient({ publishedAt }: BlogPostClientProps) {
  // Format date for AnimatedNumber (extract day number)
  const dateObj = new Date(publishedAt)
  const dayNumber = dateObj.getDate()
  const monthYear = dateObj.toLocaleDateString('en-us', { month: 'long', year: 'numeric' })
  const dateDuration = 800

  return (
    <div className="flex justify-between items-center mt-2 mb-8 text-sm">
      <p className="text-sm text-neutral-600 dark:text-neutral-400 tabular-nums">
        <AnimatedNumber value={dayNumber} duration={dateDuration} /> {monthYear}
      </p>
    </div>
  )
}
