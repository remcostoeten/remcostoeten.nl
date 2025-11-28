'use client'

import { useState, useEffect, useRef } from 'react'

type ViewportSize = 'mobile' | 'tablet' | 'desktop'

const breakpoints = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)'
}

type ViewportPreset = {
  id: ViewportSize
  name: string
  width: string
  height: string
  initial: string
}

const viewportPresets: Record<ViewportSize, ViewportPreset> = {
  mobile: {
    id: 'mobile',
    name: 'Mobile',
    width: '375',
    height: '667',
    initial: 'M'
  },
  tablet: {
    id: 'tablet',
    name: 'Tablet',
    width: '768',
    height: '1024',
    initial: 'T'
  },
  desktop: {
    id: 'desktop',
    name: 'Desktop',
    width: '1024',
    height: '768',
    initial: 'D'
  }
}

const viewportWidths = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px'
}

export function ViewportIndicator() {
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>('desktop')
  const [selectedViewport, setSelectedViewport] = useState<ViewportSize | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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

    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    updateViewport()
    updateWindowSize()

    const mediaQueries = Object.values(breakpoints).map(query =>
      window.matchMedia(query)
    )

    mediaQueries.forEach(mq => mq.addEventListener('change', updateViewport))
    window.addEventListener('resize', updateWindowSize)

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', updateViewport))
      window.removeEventListener('resize', updateWindowSize)
    }
  }, [])

  const setViewport = (viewport: ViewportSize) => {
    setSelectedViewport(viewport)
    setIsOpen(false)
    document.body.style.maxWidth = viewportWidths[viewport]
    document.body.style.margin = '0 auto'
    
    // Viewport-specific frame colors
    const frameColors = {
      mobile: 'hsl(var(--foreground))',
      tablet: 'hsl(var(--muted-foreground))',
      desktop: 'hsl(var(--accent))'
    }
    
    const frameColor = frameColors[viewport]
    document.body.style.border = `3px solid ${frameColor}`
    document.body.style.boxShadow = `0 0 0 1px ${frameColor}20, 0 0 0 4px ${frameColor}10`
    document.body.style.borderRadius = '8px'
  }

  const resetViewport = () => {
    setSelectedViewport(null)
    setIsOpen(false)
    document.body.style.maxWidth = ''
    document.body.style.margin = ''
    document.body.style.border = ''
    document.body.style.boxShadow = ''
    document.body.style.borderRadius = ''
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Keyboard shortcuts
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
  const currentPreset = viewportPresets[displayViewport]
  
  const getInitial = (viewport: ViewportSize) => {
    return viewportPresets[viewport].initial
  }

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={dropdownRef}>
      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`
            absolute bottom-full right-0 mb-2
            min-w-[200px] rounded-lg border
            border-border/60 bg-background/80 supports-backdrop-filter:backdrop-blur-sm
            shadow-lg shadow-emerald-500/10
            overflow-hidden
            transition-all duration-200
            opacity-100 scale-100
          `}
        >
          {/* Responsive option */}
          <button
            onClick={resetViewport}
            className={`
              w-full px-4 py-2.5 text-left text-xs font-medium
              transition-colors hover:bg-foreground/5
              ${selectedViewport === null ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-foreground'}
            `}
          >
            <div className="flex items-center justify-between">
              <span>Responsive</span>
              <span className="text-muted-foreground/60">
                {windowSize.width > 0 ? `${windowSize.width} x ${windowSize.height}` : ''}
              </span>
            </div>
          </button>

          <div className="border-t border-border/60" />

          {/* Viewport presets */}
          {Object.values(viewportPresets).map((preset) => {
            const isActive = selectedViewport === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => setViewport(preset.id)}
                className={`
                  w-full px-4 py-2.5 text-left text-xs font-medium
                  transition-colors hover:bg-foreground/5
                  ${isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-foreground'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{preset.name}</span>
                  <span className="text-muted-foreground/60">
                    {preset.width} x {preset.height}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Toggle Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={`
          w-8 h-8 rounded-full border
          flex items-center justify-center
          text-xs font-medium
          transition-all duration-200 hover:scale-110
          border-border/60 bg-background/80 supports-backdrop-filter:backdrop-blur-sm
          shadow-sm shadow-emerald-500/10
          hover:shadow-md hover:shadow-emerald-500/20
          text-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          ${selectedViewport ? 'ring-2 ring-emerald-500/50' : ''}
          ${isOpen ? 'ring-2 ring-emerald-500/50' : ''}
        `}
        title={`Viewport: ${currentPreset.name} (${currentPreset.width} x ${currentPreset.height})${selectedViewport ? ' (locked)' : ''}`}
      >
        {getInitial(displayViewport)}
      </button>
    </div>
  )
}