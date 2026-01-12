'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDemo } from '@/lib/demos'
import type { Demo } from '@/lib/demos'

type DemoPopoverProps = {
  id: string
  title?: string
  trigger?: 'hover' | 'click'
  children?: React.ReactNode
}

export function DemoPopover({ 
  id, 
  title, 
  trigger = 'hover',
  children 
}: DemoPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [demo, setDemo] = useState<Demo | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !triggerRef.current) return

    const node = triggerRef.current

    const handleOpen = () => {
      if (!hasLoaded) {
        const demoData = getDemo(id)
        setDemo(demoData)
        setHasLoaded(true)
      }
      setIsOpen(true)
    }

    const handleClose = () => {
      setIsOpen(false)
    }

    const handleClick = () => {
      if (!hasLoaded) {
        const demoData = getDemo(id)
        setDemo(demoData)
        setHasLoaded(true)
      }
      setIsOpen(prev => !prev)
    }

    if (trigger === 'hover') {
      node.addEventListener('mouseenter', handleOpen)
      node.addEventListener('mouseleave', handleClose)
    } else {
      node.addEventListener('click', handleClick)
    }

    return () => {
      if (trigger === 'hover') {
        node.removeEventListener('mouseenter', handleOpen)
        node.removeEventListener('mouseleave', handleClose)
      } else {
        node.removeEventListener('click', handleClick)
      }
    }
  }, [isMounted, trigger, id, hasLoaded])

  useEffect(() => {
    if (!isMounted || !popoverRef.current || trigger !== 'hover') return

    const node = popoverRef.current

    const handleOpen = () => {
      setIsOpen(true)
    }

    const handleClose = () => {
      setIsOpen(false)
    }

    node.addEventListener('mouseenter', handleOpen)
    node.addEventListener('mouseleave', handleClose)

    return () => {
      node.removeEventListener('mouseenter', handleOpen)
      node.removeEventListener('mouseleave', handleClose)
    }
  }, [isMounted, trigger, isOpen])

  return (
    <span className="relative inline-block">
      <span 
        ref={triggerRef}
        className="demo-trigger cursor-pointer"
      >
        {children || title || id}
      </span>
      
      <AnimatePresence>
        {isOpen && demo && (
          <motion.div 
            ref={popoverRef}
            className="demo-popover absolute z-50 mt-2 left-1/2"
            initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.16, 1, 0.3, 1] // Smooth bezier curve
            }}
          >
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden w-[400px] md:w-[560px]">
              <div 
                className="relative bg-black max-h-[60vh] overflow-y-auto scrollbar-hide"
                style={{ overscrollBehavior: 'contain' }}
                onWheel={(e) => e.stopPropagation()}
              >
                {demo.media.type === 'gif' ? (
                  <img
                    src={demo.media.src}
                    alt={demo.title}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={demo.media.src}
                    className="w-full h-auto block"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

