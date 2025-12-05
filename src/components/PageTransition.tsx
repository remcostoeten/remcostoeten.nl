'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState, useRef } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter')
  const [displayChildren, setDisplayChildren] = useState(children)
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      // Start exit
      setPhase('exit')
      
      const exitTimer = setTimeout(() => {
        setDisplayChildren(children)
        setPhase('enter')
        window.scrollTo({ top: 0, behavior: 'instant' })
        previousPathname.current = pathname
        
        // After enter animation, go idle
        const enterTimer = setTimeout(() => setPhase('idle'), 350)
        return () => clearTimeout(enterTimer)
      }, 150) // Short exit duration
      
      return () => clearTimeout(exitTimer)
    } else {
      setDisplayChildren(children)
      // Initial enter
      const timer = setTimeout(() => setPhase('idle'), 350)
      return () => clearTimeout(timer)
    }
  }, [pathname, children])

  return (
    <div
      className={
        phase === 'exit' 
          ? 'animate-exit' 
          : phase === 'enter' 
            ? 'animate-enter' 
            : ''
      }
    >
      {displayChildren}
    </div>
  )
}
