'use client'
import { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react'
import { cn } from '@/shared/utilities/cn'
import type { ViewportSize, ViewportPreset } from './models/types'
import { viewportPresets } from './models/types'
import {
  getInitial,
  getInterval,
  getLabelInterval,
  applyViewportStyles,
  resetViewportStyles,
  detectCurrentViewport,
  getViewportDimensions
} from './repositories/viewport'

const breakpoints = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
}

// --- Sub-components ---

type RulerProps = {
  orientation: 'horizontal' | 'vertical'
  size: number
}

const Ruler = memo(function Ruler(props: RulerProps) {
  const { orientation, size } = props
  const isHorizontal = orientation === 'horizontal'

  const interval = getInterval(size)
  const labelInterval = getLabelInterval(size)

  const ticks = useMemo(
    () => Array.from({ length: Math.floor(size / interval) + 1 }, (_, i) => i * interval),
    [size, interval],
  )

  return (
    <div
      className={cn(
        'fixed z-40 pointer-events-none bg-background/95 border-border/80 supports-backdrop-filter:backdrop-blur-sm shadow-sm',
        isHorizontal
          ? 'h-6 top-0 border-b'
          : 'w-6 top-6 border-l',
      )}
      style={
        isHorizontal
          ? {
              width: `${size}px`,
              left: '50%',
              transform: 'translateX(-50%)'
            }
          : {
              height: `${size}px`,
              left: 'calc(50% - ${size / 2}px)',
              transform: 'translateX(0)'
            }
      }
    >
      <div className={cn('relative', isHorizontal ? 'w-full h-full' : 'w-full h-full')}>
        {/* Zero tick */}
        <div
          className={cn(
            'absolute',
            isHorizontal ? 'left-0 top-0 h-full' : 'top-0 left-0 w-full',
          )}
        >
          <div className={cn('bg-border', isHorizontal ? 'w-px h-full' : 'h-px w-full')} />
          <span
            className={cn(
              'absolute text-[10px] font-mono text-muted-foreground/90',
              isHorizontal ? 'left-1 top-0.5' : 'top-1 left-0.5',
            )}
          >
            0
          </span>
        </div>

        {/* Ticks and Labels */}
        {ticks.map((tick) => {
          if (tick === 0) return null
          const isMajorTick = tick % labelInterval === 0
          return (
            <div
              key={tick}
              className="absolute"
              style={
                isHorizontal
                  ? { left: `${tick}px`, top: 0, height: '100%' }
                  : { top: `${tick}px`, left: 0, width: '100%' }
              }
            >
              <div
                className={cn(
                  'bg-border',
                  isHorizontal
                    ? `w-px ${isMajorTick ? 'h-2.5' : 'h-1.5'}`
                    : `h-px ${isMajorTick ? 'w-2.5' : 'w-1.5'}`,
                )}
              />
              {isMajorTick && (
                <span
                  className={cn(
                    'absolute text-[10px] font-mono text-muted-foreground/90',
                    isHorizontal ? 'left-1 top-0.5' : 'top-1 left-0.5',
                  )}
                >
                  {tick}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

function RulerCorner({ viewportWidth }: { viewportWidth: number }) {
  return (
    <div
      className="fixed z-40 top-0 w-6 h-6 bg-background/95 border-b border-r border-border/80"
      style={{
        left: `calc(50% - ${viewportWidth / 2}px)`,
        transform: 'translateX(0)',
      }}
    />
  )
}

// Resize handle component
type ResizeHandleProps = {
  onResize: (width: number) => void
  currentWidth: number
}

const ResizeHandle = memo(function ResizeHandle({ onResize, currentWidth }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - startX.current
      const newWidth = Math.max(280, Math.min(window.innerWidth - 40, startWidth.current - deltaX))
      onResize(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, onResize])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startX.current = e.clientX
    startWidth.current = currentWidth
    e.preventDefault()
  }

  return (
    <div
      className={cn(
        'fixed top-1/2 -translate-y-1/2 w-3 h-16 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full cursor-ew-resize hover:bg-emerald-500/30 hover:border-emerald-500/60 transition-all duration-200 z-50',
        'flex items-center justify-center',
        isDragging && 'bg-emerald-500/40 border-emerald-500/70 scale-110'
      )}
      style={{
        left: `calc(50% - ${currentWidth / 2}px - 18px)`,
      }}
      onMouseDown={handleMouseDown}
      title="Drag to resize viewport (Shift+R to reset)"
    >
      <div className="w-1 h-8 bg-emerald-500/60 rounded-full" />
    </div>
  )
})

type ViewportControlsProps = {
  isOpen: boolean
  toggleDropdown: () => void
  resetViewport: () => void
  setViewport: (viewport: ViewportSize) => void
  selectedViewport: ViewportSize | null
  displayViewport: ViewportSize
  windowSize: { width: number; height: number }
  buttonRef: React.RefObject<HTMLButtonElement | null>
  dropdownRef: React.RefObject<HTMLDivElement | null>
  customWidth: number
}

const ViewportControls = memo(function ViewportControls(props: ViewportControlsProps) {
  const {
    isOpen,
    toggleDropdown,
    resetViewport,
    setViewport,
    selectedViewport,
    displayViewport,
    windowSize,
    buttonRef,
    dropdownRef,
    customWidth,
  } = props

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={dropdownRef}>
      {isOpen && (
        <div
          className="absolute bottom-full right-0 mb-2 w-56 rounded-lg border border-border/60 bg-background/80 shadow-lg shadow-emerald-500/10 backdrop-blur-sm"
        >
          <div className="p-1">
            <button
              onClick={resetViewport}
              className={cn(
                'w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-colors hover:bg-foreground/5 flex justify-between items-center',
                selectedViewport === null ? 'bg-emerald-500/10 text-emerald-500' : 'text-foreground',
              )}
            >
              <span>Responsive</span>
              <span className="text-muted-foreground/60 text-xs">
                {windowSize.width > 0 && `${windowSize.width}px`}
              </span>
            </button>
            <div className="my-1 border-t border-border/60" />
            {Object.values(viewportPresets).map((preset) => {
              const displayWidth = preset.id === 'custom' ? customWidth : preset.width
              return (
                <button
                  key={preset.id}
                  onClick={() => setViewport(preset.id)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-colors hover:bg-foreground/5 flex justify-between items-center',
                    selectedViewport === preset.id
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'text-foreground',
                  )}
                >
                  <span>{preset.name}</span>
                  <span className="text-muted-foreground/60 text-xs">
                    {preset.id === 'custom' ? `${displayWidth}px` : `${preset.width}x${preset.height}`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={cn(
          'w-9 h-9 rounded-full border flex items-center justify-center text-sm font-bold transition-all duration-200',
          'border-border/60 bg-background/80 backdrop-blur-sm shadow-sm hover:scale-110 hover:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
          selectedViewport ? 'ring-2 ring-emerald-500/70' : 'hover:border-foreground/20',
          isOpen && 'ring-2 ring-emerald-500/70 scale-110',
        )}
        title={`Viewport: ${displayViewport}`}
      >
        {getInitial(displayViewport)}
      </button>
    </div>
  )
})

export function ViewportIndicator() {
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>('desktop')
  const [selectedViewport, setSelectedViewport] = useState<ViewportSize | null>(null)
  const [customWidth, setCustomWidth] = useState(800)
  const [isOpen, setIsOpen] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Effects for viewport detection and window size
  useEffect(() => {
    const updateViewport = () => {
      setCurrentViewport(detectCurrentViewport())
    }
    const updateWindowSize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })

    updateViewport()
    updateWindowSize()

    const mediaQueries = Object.values(breakpoints).map(q => window.matchMedia(q))
    mediaQueries.forEach(mq => mq.addEventListener('change', updateViewport))
    window.addEventListener('resize', updateWindowSize)

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', updateViewport))
      window.removeEventListener('resize', updateWindowSize)
    }
  }, [])

  // --- Viewport Actions ---

  const setViewport = useCallback((viewport: ViewportSize) => {
    setSelectedViewport(viewport)
    setIsOpen(false)
    const preset = viewportPresets[viewport]
    const width = viewport === 'custom' ? customWidth : parseInt(preset.width, 10)
    applyViewportStyles(width)
  }, [customWidth])

  const handleCustomResize = useCallback((width: number) => {
    setCustomWidth(width)
    setSelectedViewport('custom')
    applyViewportStyles(width)
  }, [])

  const resetViewport = useCallback(() => {
    setSelectedViewport(null)
    setIsOpen(false)
    resetViewportStyles()
  }, [])

  // Effects for closing dropdown and keyboard shortcuts
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.shiftKey) return
      if (['m', 't', 'd', 'r'].includes(event.key.toLowerCase())) event.preventDefault()

      switch (event.key.toLowerCase()) {
        case 'm': setViewport('mobile'); break
        case 't': setViewport('tablet'); break
        case 'd': setViewport('desktop'); break
        case 'r': resetViewport(); break
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, setViewport, resetViewport])

  const toggleDropdown = useCallback(() => setIsOpen(!isOpen), [isOpen])

  // --- Render ---

  const displayViewport = selectedViewport || currentViewport
  const { width: viewportWidth, height: viewportHeight } = getViewportDimensions(selectedViewport, customWidth)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      {selectedViewport && (
        <>
          <RulerCorner viewportWidth={viewportWidth} />
          <Ruler orientation="horizontal" size={viewportWidth} />
          <Ruler orientation="vertical" size={viewportHeight} />
          <ResizeHandle
            onResize={handleCustomResize}
            currentWidth={viewportWidth}
          />
        </>
      )}
      <ViewportControls
        isOpen={isOpen}
        toggleDropdown={toggleDropdown}
        resetViewport={resetViewport}
        setViewport={setViewport}
        selectedViewport={selectedViewport}
        displayViewport={displayViewport}
        windowSize={windowSize}
        buttonRef={buttonRef}
        dropdownRef={dropdownRef}
        customWidth={customWidth}
      />
    </>
  )
}