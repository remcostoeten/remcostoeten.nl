'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface OptimizedPageTransitionProps {
  children: ReactNode
}

export function OptimizedPageTransition({ children }: OptimizedPageTransitionProps) {
  const pathname = usePathname()
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Mark initial load as complete after hydration
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
      setIsReady(true)
    }, 500) // Allow initial content to render first

    return () => clearTimeout(timer)
  }, [])

  // Skip animations during initial load for better perceived performance
  if (isInitialLoad) {
    return <div className="w-full">{children}</div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
        transition={{
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}