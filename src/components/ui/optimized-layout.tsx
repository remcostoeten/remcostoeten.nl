'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface OptimizedLayoutProps {
  children: React.ReactNode
  className?: string
}

export function OptimizedLayout({ children, className = '' }: OptimizedLayoutProps) {
  const [isOptimized, setIsOptimized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Optimize layout after initial paint
    const timer = setTimeout(() => {
      setIsOptimized(true)
    }, 100) // Small delay to ensure initial paint is complete

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`optimized-layout ${className}`}
      style={{
        // Optimize for layout performance
        contain: 'layout style paint',
        willChange: isOptimized ? 'auto' : 'transform'
      }}
    >
      {/* Static version for SSR - no animations */}
      <div className="layout-static">
        {children}
      </div>

      {/* Animated version for client-side - only after hydration */}
      {isOptimized && (
        <motion.div
          className="layout-animated"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  )
}

// Hook to defer expensive operations
export function useDeferredValue<T>(value: T, delay: number = 300): T {
  const [deferredValue, setDeferredValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferredValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return deferredValue
}

// Component to wrap expensive animations
export function DeferredAnimation({
  children,
  delay = 200
}: {
  children: React.ReactNode
  delay?: number
}) {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!shouldAnimate) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  )
}