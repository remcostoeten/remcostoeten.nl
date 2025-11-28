'use client'

import { useState, useEffect } from 'react'

type ViewportSize = 'mobile' | 'tablet' | 'desktop'

const breakpoints = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)'
}

const viewportWidths = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px'
}

export function ViewportIndicator() {
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>('desktop')
  const [selectedViewport, setSelectedViewport] = useState<ViewportSize | null>(null)

  useEffect(() => {
    const updateViewport = () => {
      if (window.matchMedia(breakpoints.mobile).matches) {
        setCurrentViewport('mobile')
      } else if (window.matchMedia(breakpoints.tablet).matches) {
        setCurrentViewport('tablet')
      } else {
        setCurrentViewport('desktop')
      }
    }

    updateViewport()

    const mediaQueries = Object.values(breakpoints).map(query =>
      window.matchMedia(query)
    )

    mediaQueries.forEach(mq => mq.addEventListener('change', updateViewport))

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', updateViewport))
    }
  }, [])

  const setViewport = (viewport: ViewportSize) => {
    setSelectedViewport(viewport)
    document.body.style.maxWidth = viewportWidths[viewport]
    document.body.style.margin = '0 auto'
    document.body.style.border = '2px solid hsl(var(--border))'
    document.body.style.boxShadow = '0 0 0 4px hsl(var(--border) / 0.1)'
  }

  const resetViewport = () => {
    setSelectedViewport(null)
    document.body.style.maxWidth = ''
    document.body.style.margin = ''
    document.body.style.border = ''
    document.body.style.boxShadow = ''
  }

  const toggleViewport = () => {
    if (selectedViewport === null) {
      // First click - set to mobile
      setViewport('mobile')
    } else {
      // Cycle through viewports
      const nextViewport = selectedViewport === 'mobile' ? 'tablet'
        : selectedViewport === 'tablet' ? 'desktop'
        : null

      if (nextViewport === null) {
        // Reset to normal
        resetViewport()
      } else {
        setViewport(nextViewport)
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Shift is pressed
      if (!event.shiftKey) return

      // Prevent default behavior for these shortcuts
      if (['m', 'M', 't', 'T', 'd', 'D', 'r', 'R'].includes(event.key)) {
        event.preventDefault()
      }

      // Handle shortcuts
      if (event.key === 'm' || event.key === 'M') {
        setViewport('mobile')
      } else if (event.key === 't' || event.key === 'T') {
        setViewport('tablet')
      } else if (event.key === 'd' || event.key === 'D') {
        setViewport('desktop')
      } else if (event.key === 'r' || event.key === 'R') {
        resetViewport()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const displayViewport = selectedViewport || currentViewport

  const colors = {
    mobile: 'bg-foreground',
    tablet: 'bg-muted',
    desktop: 'bg-accent'
  }

  return (
    <button
      onClick={toggleViewport}
      className={`
        fixed bottom-4 right-4 z-50 px-3 py-2 rounded-full text-xs font-mono
        transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md
        ${colors[displayViewport]} text-background
        ${selectedViewport ? 'ring-2 ring-offset-2 ring-accent' : ''}
      `}
    >
      {displayViewport.toUpperCase()}
      {selectedViewport && (
        <span className="ml-1 opacity-75">●</span>
      )}
    </button>
  )
}