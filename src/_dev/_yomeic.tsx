'use client'

/**
 * @name Yomeic
 * @alias [yo]ur-[me]mory-[i]s-[c]ooked
 * @description A developer-first backlog overlay connecting tasks to DOM elements.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

const SHOW_TODOS = process.env.NEXT_PUBLIC_SHOW_TODOS === 'true'
const STORAGE_PREFIX = 'yomeic-state-'
const MAX_VISIBLE_ITEMS = 3
const UNDO_WINDOW_MS = 8000

const theme = {
  colors: {
    primary: 'hsl(var(--primary))',
    primaryDim: 'hsl(var(--primary) / 0.1)',
    freeroam: 'hsl(var(--accent))',
    textMain: 'text-foreground',
    textDim: 'text-muted-foreground',
    bgPanel: 'bg-background',
    borderPanel: 'border-border',
    // Removed strict overlay background to allow click-through logic
    bgOverlay: 'rgba(0, 0, 0, 0.0)',
  },
  layout: {
    panel:
      'fixed flex flex-col gap-2 rounded-lg border px-4 pb-4 pt-0 w-96 shadow-2xl transition-all backdrop-blur-md z-50',
    item: 'relative flex items-center gap-3 p-1.5 px-2 rounded transition-colors w-full',
    header: 'flex items-center justify-between gap-2 min-w-0 border-b pb-1',
    badge: 'shrink-0 rounded px-1.5 py-0.5 text-xs font-medium',
  },
  z: {
    lines: 9990,
    overlay: 9995,
    panel: 9999,
  },
}

const styles = {
  panel: `${theme.layout.panel} ${theme.colors.textMain} ${theme.colors.bgPanel} ${theme.colors.borderPanel}`,
  item: `${theme.layout.item} hover:bg-accent/10`,
  header: `${theme.layout.header} ${theme.colors.borderPanel}`,
  badge: `${theme.layout.badge} bg-primary/20 text-primary`,
  connectorDot: {
    fill: theme.colors.primary,
    r: 4,
  },
  freeroamDot: {
    fill: theme.colors.freeroam,
    stroke: theme.colors.freeroam,
    strokeWidth: 1.5,
    r: 3.5,
    opacity: 0.9,
  },
}

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type Pos = {
  x: number
  y: number
}

type TodoStatus = 'todo' | 'working' | 'done'

type TodoItem = {
  text: string
  action?: string
  info?: string
  description?: string
  notes?: string
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

type CategoryConfig = {
  id: string
  displayName?: string
  items: TodoItem[]
}

type Connection = {
  todoIndex: number
  targetSelector?: string
  targetLabel?: string
  targetPosition?: Pos
}

type DisplayMode = 'full' | 'compact' | 'minimal'

type UndoSnapshot = {
  displayMode: DisplayMode
  isHidden: boolean
}

type Props = {
  category: string
  /**
   * Optional identifier to distinguish multiple Yomeic instances
   * that share the same category.
   */
  instanceId?: string
}

/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */

const categories: CategoryConfig[] = [
  {
    id: 'blog-feature',
    displayName: 'Blog Feature Tasks',
    items: [
      {
        text: 'Implement view count analytics with custom back-end',
        action: 'develop',
      },
      {
        text: 'Add a read duration counter to blog posts meta-info',
        action: 'build',
      },
    ],
  },
  {
    id: 'dev',
    displayName: 'Development Tasks',
    items: [
      {
        text: 'Create environment validator tool',
        action: 'create',
        info: 'Try to build agnostic in a primitive style way. v0 demo app repo has good ideas.',
      },
    ],
  },
  {
    id: 'blog-post',
    displayName: 'Blog Post Ideas',
    items: [
      { text: 'Write about env var validator tool', action: 'write' },
      { text: 'Write about internal todo component workflow', action: 'write' },
    ],
  },
  {
    id: 'blog-detail',
    items: [
      { text: 'Add read time per blog', action: 'add' },
      { text: 'Add view count per blog', action: 'add' },
      { text: 'Add category per blog', action: 'add' },
      { text: 'Add tags per blog', action: 'add' },
      { text: 'Style code block more aesthetically', action: 'style' },
      { text: 'Implement a sharing system', action: 'implement' },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

function isValidSelector(selector: string): boolean {
  try {
    return !!document.querySelector(selector)
  } catch {
    return false
  }
}

function generateSelector(element: Element): string {
  if (element.id) {
    const s = `#${element.id}`
    if (isValidSelector(s)) return s
  }
  const parent = element.parentElement
  if (parent) {
    const siblings = Array.from(parent.children)
    const index = siblings.indexOf(element)
    const parentSel = parent.id
      ? `#${parent.id}`
      : parent.tagName.toLowerCase()
    const s = `${parentSel} > ${element.tagName.toLowerCase()}:nth-child(${index + 1
      })`
    if (isValidSelector(s)) return s
  }
  return element.tagName.toLowerCase()
}

function getElementLabel(element: Element): string {
  if (element.id) return `#${element.id}`
  return (
    element.textContent?.trim().slice(0, 30) || element.tagName.toLowerCase()
  )
}

function calculateBezier(start: Pos, end: Pos): string {
  const distance = Math.abs(end.x - start.x)
  const offset = Math.min(distance / 2, 150)
  return `M ${start.x} ${start.y} C ${start.x + offset} ${start.y}, ${end.x - offset
    } ${end.y}, ${end.x} ${end.y}`
}

/* -------------------------------------------------------------------------- */
/*                                  COMPONENT                                 */
/* -------------------------------------------------------------------------- */

function YomeicCore({ category, instanceId }: Props) {
  const categoryData = useMemo(
    () => categories.find((c) => c.id === category),
    [category]
  )

  const instanceKey = useMemo(
    () => instanceId || category,
    [instanceId, category]
  )

  const keys = useMemo(
    () => ({
      pos: `${STORAGE_PREFIX}pos-${instanceKey}`,
      col: `${STORAGE_PREFIX}col-${instanceKey}`,
      con: `${STORAGE_PREFIX}con-${instanceKey}`,
      mode: `${STORAGE_PREFIX}mode-${instanceKey}`,
      hidden: `${STORAGE_PREFIX}hidden-${instanceKey}`,
      lines: `${STORAGE_PREFIX}lines-${instanceKey}`,
      badges: `${STORAGE_PREFIX}badges-${instanceKey}`,
      lineColor: `${STORAGE_PREFIX}lineColor-${instanceKey}`,
      lineOpacity: `${STORAGE_PREFIX}lineOpacity-${instanceKey}`,
      componentOpacity: `${STORAGE_PREFIX}componentOpacity-${instanceKey}`,
      statuses: `${STORAGE_PREFIX}statuses-${instanceKey}`,
    }),
    [instanceKey]
  )

  // State
  const [isMounted, setIsMounted] = useState(false)
  const [pos, setPos] = useState<Pos>({ x: 20, y: 20 })
  const [connections, setConnections] = useState<Connection[]>([])
  const [displayMode, setDisplayMode] = useState<DisplayMode>('full')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showLines, setShowLines] = useState(true)
  const [showBadges, setShowBadges] = useState(true)
  const [lineColor, setLineColor] = useState(theme.colors.primary)
  const [lineOpacity, setLineOpacity] = useState(0.6)
  const [componentOpacity, setComponentOpacity] = useState(1)
  const [canUndo, setCanUndo] = useState(false)
  const [statuses, setStatuses] = useState<Map<number, TodoStatus>>(new Map())
  const [openIssueIndex, setOpenIssueIndex] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Interaction
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<Pos>({ x: 0, y: 0 })
  const [selectingIndex, setSelectingIndex] = useState<number | null>(null)
  const [hoveredTarget, setHoveredTarget] = useState<Element | null>(null)
  const [isFreeroam, setIsFreeroam] = useState(false)
  const [previewPosition, setPreviewPosition] = useState<Pos | null>(null)
  const [editingConnection, setEditingConnection] = useState<number | null>(null)
  const [hoveredConnection, setHoveredConnection] = useState<number | null>(null)
  const [, setTick] = useState(0)

  const panelRef = useRef<HTMLDivElement>(null)
  const todoRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const connectionPointRefs = useRef<Map<number, SVGCircleElement>>(new Map())
  const rafRef = useRef<number | null>(null)
  const undoSnapshotRef = useRef<UndoSnapshot | null>(null)
  const undoTimeoutRef = useRef<number | null>(null)

  // Initialization
  useEffect(() => {
    function loadState() {
      try {
        const savedPos = localStorage.getItem(keys.pos)
        const savedCon = localStorage.getItem(keys.con)
        const savedCol = localStorage.getItem(keys.col)
        const savedMode = localStorage.getItem(keys.mode)
        const savedHidden = localStorage.getItem(keys.hidden)
        const savedLines = localStorage.getItem(keys.lines)
        const savedBadges = localStorage.getItem(keys.badges)
        const savedLineColor = localStorage.getItem(keys.lineColor)
        const savedLineOpacity = localStorage.getItem(keys.lineOpacity)
        const savedComponentOpacity = localStorage.getItem(keys.componentOpacity)

        if (savedPos) setPos(JSON.parse(savedPos))
        if (savedCon) setConnections(JSON.parse(savedCon))

        // Prefer explicit mode, fall back to legacy collapsed flag
        if (savedMode) {
          try {
            const parsed = JSON.parse(savedMode) as DisplayMode
            if (
              parsed === 'full' ||
              parsed === 'compact' ||
              parsed === 'minimal'
            ) {
              setDisplayMode(parsed)
            }
          } catch {
            // ignore malformed mode
          }
        } else if (savedCol) {
          try {
            const collapsed = JSON.parse(savedCol) as boolean
            setDisplayMode(collapsed ? 'compact' : 'full')
          } catch {
            // ignore malformed collapsed flag
          }
        }

        if (savedHidden) {
          try {
            setIsHidden(JSON.parse(savedHidden))
          } catch {
            // ignore malformed hidden flag
          }
        }

        if (savedLines) {
          try {
            setShowLines(JSON.parse(savedLines))
          } catch {
            // ignore malformed lines flag
          }
        }

        if (savedBadges) {
          try {
            setShowBadges(JSON.parse(savedBadges))
          } catch {
            // ignore malformed badges flag
          }
        }

        if (savedLineColor) {
          try {
            setLineColor(JSON.parse(savedLineColor))
          } catch {
            // ignore malformed line color
          }
        }

        if (savedLineOpacity) {
          try {
            const opacity = JSON.parse(savedLineOpacity)
            if (typeof opacity === 'number' && opacity >= 0 && opacity <= 1) {
              setLineOpacity(opacity)
            }
          } catch {
            // ignore malformed line opacity
          }
        }

        if (savedComponentOpacity) {
          try {
            const opacity = JSON.parse(savedComponentOpacity)
            if (typeof opacity === 'number' && opacity >= 0 && opacity <= 1) {
              setComponentOpacity(opacity)
            }
          } catch {
            // ignore malformed component opacity
          }
        }

        if (keys.statuses) {
          const savedStatuses = localStorage.getItem(keys.statuses)
          if (savedStatuses) {
            try {
              const parsed = JSON.parse(savedStatuses) as Record<string, TodoStatus>
              const statusMap = new Map<number, TodoStatus>()
              for (const [key, value] of Object.entries(parsed)) {
                const index = parseInt(key, 10)
                if (!isNaN(index) && (value === 'todo' || value === 'working' || value === 'done')) {
                  statusMap.set(index, value)
                }
              }
              setStatuses(statusMap)
            } catch {
              // ignore malformed statuses
            }
          }
        }
      } catch (e) {
        console.error('Yomeic storage read error', e)
      }
      setIsMounted(true)
    }
    loadState()
  }, [keys])

  // Global Listeners - optimized for drag performance
  useEffect(() => {
    let ticking = false

    function handleTick() {
      if (ticking || isDragging) return // Skip RAF updates during drag for better performance
      ticking = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setTick((t) => (t + 1) % 100)
        ticking = false
      })
    }

    window.addEventListener('scroll', handleTick, { passive: true })
    window.addEventListener('resize', handleTick, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleTick)
      window.removeEventListener('resize', handleTick)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isDragging])

  // Drag Logic - optimized for performance
  useEffect(() => {
    if (!isDragging) return

    let rafId: number | null = null
    let lastSaveTime = 0
    const SAVE_THROTTLE = 100 // Save position every 100ms max

    function onMove(e: MouseEvent) {
      if (rafId) return // Skip if we already have a pending frame

      rafId = requestAnimationFrame(() => {
        const newPos = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        }
        setPos(newPos)

        // Throttle localStorage writes during drag
        const now = Date.now()
        if (now - lastSaveTime > SAVE_THROTTLE) {
          localStorage.setItem(keys.pos, JSON.stringify(newPos))
          lastSaveTime = now
        }

        rafId = null
      })
    }

    function onUp() {
      // Final save on mouse up
      localStorage.setItem(keys.pos, JSON.stringify(pos))
      setIsDragging(false)
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isDragging, dragOffset, keys.pos, pos])

  // Selection Logic
  useEffect(() => {
    if (selectingIndex === null) {
      setHoveredTarget(null)
      setIsFreeroam(false)
      setPreviewPosition(null)
      return
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectingIndex(null)
      if (e.key === 'Shift') setIsFreeroam(true)
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'Shift') setIsFreeroam(false)
    }

    function onClick(e: MouseEvent) {
      e.preventDefault()
      e.stopPropagation()
      const target = e.target as Element

      if (panelRef.current?.contains(target)) {
        setSelectingIndex(null)
        return
      }

      let newConn: Connection

      if (isFreeroam || !target || target === document.body) {
        newConn = {
          todoIndex: selectingIndex!,
          targetPosition: { x: e.clientX, y: e.clientY },
        }
      } else {
        newConn = {
          todoIndex: selectingIndex!,
          targetSelector: generateSelector(target),
          targetLabel: getElementLabel(target),
        }
      }

      const next = connections.filter((c) => c.todoIndex !== selectingIndex!)
      next.push(newConn)
      setConnections(next)
      localStorage.setItem(keys.con, JSON.stringify(next))
      setSelectingIndex(null)
    }

    function onMove(e: MouseEvent) {
      if (isFreeroam) {
        setHoveredTarget(null)
        setPreviewPosition({ x: e.clientX, y: e.clientY })
        return
      }
      setPreviewPosition(null)
      const t = e.target as Element
      if (t && !panelRef.current?.contains(t)) setHoveredTarget(t)
    }

    function killLinks(e: MouseEvent) {
      if ((e.target as Element).closest('a')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('click', onClick, true)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('click', killLinks, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('click', killLinks, true)
    }
  }, [selectingIndex, isFreeroam, connections, keys.con])

  // Selection Visuals
  useEffect(() => {
    if (!hoveredTarget) return
    hoveredTarget.classList.add('yomeic-target-hover')
    return () => hoveredTarget.classList.remove('yomeic-target-hover')
  }, [hoveredTarget])

  // Connection Point Editing Logic
  useEffect(() => {
    if (editingConnection === null) return

    function onMove(e: MouseEvent) {
      setConnections((prev) => {
        const conn = prev.find((c) => c.todoIndex === editingConnection)
        if (!conn) return prev

        const updated = { ...conn, targetPosition: { x: e.clientX, y: e.clientY } }
        // Convert DOM selector connections to freeroam when editing
        if (conn.targetSelector) {
          delete updated.targetSelector
          delete updated.targetLabel
        }

        const next = prev.filter((c) => c.todoIndex !== editingConnection)
        next.push(updated)
        localStorage.setItem(keys.con, JSON.stringify(next))
        return next
      })
    }

    function onUp() {
      setEditingConnection(null)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [editingConnection, keys.con])

  // Connection Point Interaction Handlers
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as SVGCircleElement
      if (!target) return

      // Find which connection this circle belongs to
      for (const [todoIndex, circle] of Array.from(connectionPointRefs.current.entries())) {
        if (circle === target) {
          e.preventDefault()
          e.stopPropagation()
          setEditingConnection(todoIndex)
          break
        }
      }
    }

    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as SVGCircleElement
      if (!target) return

      // Find which connection this circle belongs to
      for (const [todoIndex, circle] of Array.from(connectionPointRefs.current.entries())) {
        if (circle === target) {
          e.preventDefault()
          e.stopPropagation()
          removeConnection(todoIndex)
          break
        }
      }
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as SVGCircleElement
      if (!target) return

      for (const [todoIndex, circle] of Array.from(connectionPointRefs.current.entries())) {
        if (circle === target) {
          setHoveredConnection(todoIndex)
          break
        }
      }
    }

    const handleMouseLeave = () => {
      setHoveredConnection(null)
    }

    for (const circle of Array.from(connectionPointRefs.current.values())) {
      circle.addEventListener('mousedown', handleMouseDown)
      circle.addEventListener('dblclick', handleDoubleClick)
      circle.addEventListener('mouseenter', handleMouseEnter)
      circle.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      for (const circle of Array.from(connectionPointRefs.current.values())) {
        circle.removeEventListener('mousedown', handleMouseDown)
        circle.removeEventListener('dblclick', handleDoubleClick)
        circle.removeEventListener('mouseenter', handleMouseEnter)
        circle.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [connections])

  /* -------------------------------------------------------------------------- */
  /*                                   ACTIONS                                  */
  /* -------------------------------------------------------------------------- */

  function prepareUndo() {
    const snapshot: UndoSnapshot = {
      displayMode,
      isHidden,
    }
    undoSnapshotRef.current = snapshot
    setCanUndo(true)

    if (undoTimeoutRef.current !== null) {
      window.clearTimeout(undoTimeoutRef.current)
    }

    undoTimeoutRef.current = window.setTimeout(() => {
      undoSnapshotRef.current = null
      undoTimeoutRef.current = null
      setCanUndo(false)
    }, UNDO_WINDOW_MS)
  }

  function performUndo() {
    const snapshot = undoSnapshotRef.current
    if (!snapshot) return

    setDisplayMode(snapshot.displayMode)
    setIsHidden(snapshot.isHidden)

    try {
      localStorage.setItem(keys.mode, JSON.stringify(snapshot.displayMode))
      localStorage.setItem(keys.hidden, JSON.stringify(snapshot.isHidden))
    } catch (e) {
      console.error('Yomeic undo write error', e)
    }

    if (undoTimeoutRef.current !== null) {
      window.clearTimeout(undoTimeoutRef.current)
      undoTimeoutRef.current = null
    }

    undoSnapshotRef.current = null
    setCanUndo(false)
  }

  function setAndPersistMode(mode: DisplayMode) {
    setDisplayMode(mode)
    try {
      localStorage.setItem(keys.mode, JSON.stringify(mode))
    } catch (e) {
      console.error('Yomeic mode write error', e)
    }
  }

  function handleHide() {
    setIsHidden(true)
    setIsSettingsOpen(false)
    try {
      localStorage.setItem(keys.hidden, JSON.stringify(true))
    } catch (e) {
      console.error('Yomeic hidden write error', e)
    }
  }


  function handleSetMode(mode: DisplayMode) {
    setAndPersistMode(mode)
    setIsSettingsOpen(false)
  }

  function handleToggleLines() {
    setShowLines((prev) => {
      const next = !prev
      try {
        localStorage.setItem(keys.lines, JSON.stringify(next))
      } catch (e) {
        console.error('Yomeic lines write error', e)
      }
      return next
    })
  }

  function handleToggleBadges() {
    setShowBadges((prev) => {
      const next = !prev
      try {
        localStorage.setItem(keys.badges, JSON.stringify(next))
      } catch (e) {
        console.error('Yomeic badges write error', e)
      }
      return next
    })
  }

  function handleSetLineColor(color: string) {
    setLineColor(color)
    try {
      localStorage.setItem(keys.lineColor, JSON.stringify(color))
    } catch (e) {
      console.error('Yomeic line color write error', e)
    }
  }

  function handleSetLineOpacity(opacity: number) {
    setLineOpacity(opacity)
    try {
      localStorage.setItem(keys.lineOpacity, JSON.stringify(opacity))
    } catch (e) {
      console.error('Yomeic line opacity write error', e)
    }
  }

  function handleSetComponentOpacity(opacity: number) {
    setComponentOpacity(opacity)
    try {
      localStorage.setItem(keys.componentOpacity, JSON.stringify(opacity))
    } catch (e) {
      console.error('Yomeic component opacity write error', e)
    }
  }

  // Global keyboard shortcuts - instance-aware
  useEffect(() => {
    if (isHidden || !isMounted || openIssueIndex !== null) return

    function onKeyDown(e: KeyboardEvent) {
      // Only trigger if not typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Don't trigger if modifier keys are pressed (except for specific shortcuts)
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey

      // Check if this is the target instance for 's' key
      // Only open settings if:
      // 1. Panel is focused (mouse is over it) OR
      // 2. This is the only visible instance
      const panelElement = panelRef.current
      const isPanelHovered = panelElement?.matches(':hover')
      const isPanelFocused = panelElement?.contains(document.activeElement)

      // Simple heuristic: only handle 's' if this instance is being interacted with
      const shouldHandleShortcut = isPanelHovered || isPanelFocused

      // Open settings with 's' key (only if this instance should handle it)
      if ((e.key === 's' || e.key === 'S') && !hasModifier && shouldHandleShortcut) {
        e.preventDefault()
        e.stopPropagation()
        setIsSettingsOpen(true)
        return
      }

      // Show keyboard help with '?' key (global, not instance-specific)
      if (e.key === '?' && !hasModifier) {
        e.preventDefault()
        e.stopPropagation()
        setShowKeyboardHelp(true)
        return
      }

      // Search with '/' key - only if there are more than MAX_VISIBLE_ITEMS and this instance is active
      if (e.key === '/' && !hasModifier && categoryData && categoryData.items.length > MAX_VISIBLE_ITEMS && shouldHandleShortcut) {
        e.preventDefault()
        e.stopPropagation()
        setIsSearchOpen(true)
        // Focus search input after it appears
        setTimeout(() => {
          const searchInput = document.querySelector('[data-yomeic-search]') as HTMLInputElement
          if (searchInput) searchInput.focus()
        }, 0)
        return
      }

      // Escape to close this instance's modals
      if (e.key === 'Escape' && !hasModifier) {
        if (isSettingsOpen) {
          setIsSettingsOpen(false)
          return
        }
        if (showKeyboardHelp) {
          setShowKeyboardHelp(false)
          return
        }
        if (isSearchOpen) {
          setIsSearchOpen(false)
          setSearchQuery('')
          return
        }
      }

      // Export with Ctrl+E / Cmd+E - instance specific
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && shouldHandleShortcut) {
        e.preventDefault()
        e.stopPropagation()
        exportConfig()
        return
      }

      // Import with Ctrl+I / Cmd+I - instance specific
      if ((e.ctrlKey || e.metaKey) && e.key === 'i' && shouldHandleShortcut) {
        e.preventDefault()
        e.stopPropagation()
        importConfig()
        return
      }

      // Toggle lines with 'l' - instance specific
      if (e.key === 'l' && !hasModifier && shouldHandleShortcut) {
        e.preventDefault()
        e.stopPropagation()
        handleToggleLines()
        return
      }

      // Toggle badges with 'b' - instance specific
      if (e.key === 'b' && !hasModifier && shouldHandleShortcut) {
        e.preventDefault()
        e.stopPropagation()
        handleToggleBadges()
        return
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isHidden, isMounted, isSettingsOpen, showKeyboardHelp, searchQuery, openIssueIndex, displayMode, handleToggleLines, handleToggleBadges, isSearchOpen, categoryData])

  // Close issue view on Escape
  useEffect(() => {
    if (openIssueIndex === null) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setOpenIssueIndex(null)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openIssueIndex])

  // Settings menu keyboard accessibility
  useEffect(() => {
    if (!isSettingsOpen) return

    function onKeyDown(e: KeyboardEvent) {
      // Close on Escape
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setIsSettingsOpen(false)
        return
      }

      // Undo window: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (canUndo) {
          e.preventDefault()
          e.stopPropagation()
          performUndo()
        }
        return
      }

      // Only handle plain key presses beyond this point
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Numeric shortcuts for display modes when menu is open
      if (e.key === '1') {
        e.preventDefault()
        prepareUndo()
        setAndPersistMode('full')
        setIsSettingsOpen(false)
        return
      }

      if (e.key === '2') {
        e.preventDefault()
        prepareUndo()
        setAndPersistMode('compact')
        setIsSettingsOpen(false)
        return
      }

      if (e.key === '3') {
        e.preventDefault()
        prepareUndo()
        setAndPersistMode('minimal')
        setIsSettingsOpen(false)
        return
      }

      // "d" to hide while menu is open
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        prepareUndo()
        handleHide()
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isSettingsOpen, canUndo, displayMode, isHidden, keys.mode, keys.hidden])

  function startDrag(e: React.MouseEvent) {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setIsDragging(true)
    }
  }

  function toggleViewMore() {
    setIsExpanded(!isExpanded)
  }

  function removeConnection(idx: number) {
    const next = connections.filter((c) => c.todoIndex !== idx)
    setConnections(next)
    localStorage.setItem(keys.con, JSON.stringify(next))
    showToast('Connection removed', 'info')
  }

  function exportConfig() {
    try {
      const config = {
        position: pos,
        displayMode,
        connections,
        statuses: Object.fromEntries(statuses),
        showLines,
        showBadges,
        lineColor,
        lineOpacity,
        componentOpacity,
        exportedAt: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `yomeic-${instanceKey}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('Configuration exported', 'success')
    } catch (e) {
      console.error('Export error', e)
      showToast('Failed to export', 'error')
    }
  }

  function importConfig() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string)
          if (config.position) setPos(config.position)
          if (config.displayMode) setAndPersistMode(config.displayMode)
          if (config.connections) {
            setConnections(config.connections)
            localStorage.setItem(keys.con, JSON.stringify(config.connections))
          }
          if (config.statuses) {
            const statusMap = new Map<number, TodoStatus>()
            for (const [key, value] of Object.entries(config.statuses)) {
              const index = parseInt(key, 10)
              if (!isNaN(index) && (value === 'todo' || value === 'working' || value === 'done')) {
                statusMap.set(index, value as TodoStatus)
              }
            }
            setStatuses(statusMap)
            localStorage.setItem(keys.statuses, JSON.stringify(config.statuses))
          }
          if (config.showLines !== undefined) {
            setShowLines(config.showLines)
            localStorage.setItem(keys.lines, JSON.stringify(config.showLines))
          }
          if (config.showBadges !== undefined) {
            setShowBadges(config.showBadges)
            localStorage.setItem(keys.badges, JSON.stringify(config.showBadges))
          }
          if (config.lineColor) {
            setLineColor(config.lineColor)
            localStorage.setItem(keys.lineColor, JSON.stringify(config.lineColor))
          }
          if (config.lineOpacity !== undefined) {
            setLineOpacity(config.lineOpacity)
            localStorage.setItem(keys.lineOpacity, JSON.stringify(config.lineOpacity))
          }
          if (config.componentOpacity !== undefined) {
            setComponentOpacity(config.componentOpacity)
            localStorage.setItem(keys.componentOpacity, JSON.stringify(config.componentOpacity))
          }
          showToast('Configuration imported', 'success')
        } catch (e) {
          console.error('Import error', e)
          showToast('Failed to import configuration', 'error')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  function showToast(message: string, type: 'success' | 'info' | 'error' = 'info') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  function setItemStatus(index: number, status: TodoStatus) {
    setStatuses((prev) => {
      const next = new Map(prev)
      next.set(index, status)

      // Persist to localStorage
      try {
        const statusObj: Record<string, TodoStatus> = {}
        for (const [idx, stat] of Array.from(next.entries())) {
          statusObj[idx.toString()] = stat
        }
        localStorage.setItem(keys.statuses, JSON.stringify(statusObj))
        showToast(`Status set to ${status}`, 'success')
      } catch (e) {
        console.error('Yomeic status write error', e)
        showToast('Failed to save status', 'error')
      }

      return next
    })
  }

  function getItemStatus(index: number): TodoStatus {
    return statuses.get(index) || 'todo'
  }

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  function renderLines() {
    if (!isMounted) return null

    // Render preview line when in freeroam mode
    const previewLine = selectingIndex !== null && isFreeroam && previewPosition ? (() => {
      const el = todoRefs.current.get(selectingIndex)
      if (!el || !document.body.contains(el)) return null

      const rect = el.getBoundingClientRect()
      const start = {
        x: rect.right,
        y: rect.top + rect.height / 2,
      }
      const d = calculateBezier(start, previewPosition)

      return (
        <g key="preview-freeroam">
          <path
            d={d}
            stroke={theme.colors.freeroam}
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 4"
            opacity="0.3"
          />
          <circle
            cx={previewPosition.x}
            cy={previewPosition.y}
            {...styles.freeroamDot}
            opacity="0.5"
          />
        </g>
      )
    })() : null

    return createPortal(
      <svg
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: theme.z.lines,
          width: '100vw',
          height: '100vh',
        }}
        onMouseDown={(e) => {
          // Prevent clicks on SVG from interfering with page interactions
          if ((e.target as SVGElement).tagName !== 'circle') {
            e.preventDefault()
          }
        }}
      >
        {previewLine}
        {connections.map((conn) => {
          const el = todoRefs.current.get(conn.todoIndex)
          if (!el || !document.body.contains(el)) return null

          const rect = el.getBoundingClientRect()
          const start = {
            x: rect.right,
            y: rect.top + rect.height / 2,
          }
          let end: Pos = { x: 0, y: 0 }

          if (conn.targetPosition) {
            end = conn.targetPosition
          } else if (conn.targetSelector) {
            const t = document.querySelector(conn.targetSelector)
            if (!t) return null
            const tRect = t.getBoundingClientRect()
            end = {
              x: tRect.left,
              y: tRect.top + tRect.height / 2,
            }
          }

          const d = calculateBezier(start, end)
          const isFree = !!conn.targetPosition
          const isEditing = editingConnection === conn.todoIndex
          const key = `${conn.todoIndex}-${isFree ? 'free' : 'dom'}`

          const strokeColor = isFree ? theme.colors.freeroam : lineColor
          const strokeOpacity = isFree ? 0.6 : lineOpacity

          return (
            <g key={key}>
              <path
                d={d}
                stroke={strokeColor}
                strokeWidth="2"
                fill="none"
                strokeDasharray="6 4"
                style={{ animation: 'yomeic-dash 30s linear infinite' }}
                opacity={strokeOpacity}
              />
              <circle
                cx={start.x}
                cy={start.y}
                fill={strokeColor}
                r={styles.connectorDot.r}
                opacity={strokeOpacity}
              />
              {/* Invisible larger hit area for easier interaction */}
              <circle
                ref={(el) => {
                  if (el) connectionPointRefs.current.set(conn.todoIndex, el)
                  else connectionPointRefs.current.delete(conn.todoIndex)
                }}
                cx={end.x}
                cy={end.y}
                r={12}
                fill="transparent"
                style={{
                  pointerEvents: 'auto',
                  cursor: isEditing ? 'grabbing' : 'grab',
                }}
              />
              {/* Visible connection point */}
              <circle
                cx={end.x}
                cy={end.y}
                fill={isFree ? styles.freeroamDot.fill : strokeColor}
                stroke={isFree ? styles.freeroamDot.stroke : undefined}
                strokeWidth={isFree ? styles.freeroamDot.strokeWidth : undefined}
                r={hoveredConnection === conn.todoIndex ? (isFree ? 4.5 : 5) : (isFree ? styles.freeroamDot.r : styles.connectorDot.r)}
                opacity={hoveredConnection === conn.todoIndex ? 1 : (isFree ? styles.freeroamDot.opacity : strokeOpacity)}
                style={{
                  pointerEvents: 'none',
                  transition: 'r 0.2s, opacity 0.2s',
                }}
              />
            </g>
          )
        })}
      </svg>,
      document.body
    )
  }

  const maxItemsForMode = displayMode === 'compact' ? 1 : MAX_VISIBLE_ITEMS

  // Filter items by search query - must be called before any early returns
  const filteredItems = useMemo(() => {
    if (!categoryData) return []
    if (!searchQuery.trim()) return categoryData.items
    const query = searchQuery.toLowerCase()
    return categoryData.items.filter((item) =>
      item.text.toLowerCase().includes(query) ||
      item.action?.toLowerCase().includes(query) ||
      item.info?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }, [categoryData, searchQuery])

  // Early returns after all hooks
  if (!categoryData || !isMounted) return null

  if (isHidden) return null

  const itemsToRender = isExpanded
    ? filteredItems
    : filteredItems.slice(0, maxItemsForMode)
  const hasMore = filteredItems.length > maxItemsForMode
  const primaryItem = categoryData.items[0]
  const shouldRenderLines = showLines && !isHidden

  return (
    <>
      <style>{`
        @keyframes yomeic-dash {
          to { stroke-dashoffset: -100; }
        }
        @keyframes yomeic-toast-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes yomeic-toast-out {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        @keyframes yomeic-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .yomeic-target-hover {
          outline: 2px solid hsl(var(--primary)) !important;
          outline-offset: 2px;
          background-color: hsl(var(--primary) / 0.1) !important;
          cursor: crosshair !important;
        }
        .yomeic-toast {
          animation: yomeic-toast-in 0.2s ease-out;
        }
        .yomeic-toast-exit {
          animation: yomeic-toast-out 0.2s ease-in;
        }
        .yomeic-issue-panel {
          animation: yomeic-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {shouldRenderLines && renderLines()}

      {/* 
         Overlay: The container must be pointer-events-none so mouse clicks
         pass through to the website elements. 
         This should always render when selecting, regardless of showLines setting.
      */}
      {selectingIndex !== null &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: theme.z.overlay,
              // Must be none to let clicks hit the DOM
              pointerEvents: 'none',
              cursor: 'crosshair', // This won't show if pointerEvents is none, but that's acceptable tradeoff
            }}
          />,
          document.body
        )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`${styles.panel} ${displayMode === 'compact' ? 'w-72 px-3 pb-3 pt-0 gap-1 text-xs' : ''
          } ${displayMode === 'minimal'
            ? 'w-auto h-auto p-0 border-none bg-transparent shadow-none'
            : ''
          } ${displayMode === 'full' ? 'px-3 pb-3 pt-0' : ''
          }`}
        style={{
          left: pos.x,
          top: pos.y,
          zIndex: theme.z.panel,
          opacity: componentOpacity,
        }}
      >
        {displayMode === 'minimal' ? (
          <div
            className="relative group"
            onMouseDown={startDrag}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setAndPersistMode('compact')
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/90 text-[9px] font-mono text-zinc-200 shadow-lg"
            >
              <span className="truncate max-w-7">
                {(categoryData.displayName || category).slice(0, 2)}
              </span>
              <span className="absolute -top-1 -right-1 h-4 min-w-[1.1rem] rounded-full bg-blue-600 text-[9px] leading-4 text-center text-white px-1">
                {categoryData.items.length}
              </span>
            </button>

            {primaryItem && (
              <div
                className="absolute left-full top-1/2 ml-2 -translate-y-1/2 hidden group-hover:block rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 shadow-xl min-w-40 max-w-xs"
              >
                <div className="mb-1 text-[10px] font-mono uppercase tracking-wide text-zinc-500">
                  Next task
                </div>
                <div className="truncate">{primaryItem.text}</div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div
              className={`${styles.header} relative w-full`}
              onMouseDown={startDrag}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
            >
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-[11px] font-mono truncate opacity-80 flex-1">
                  {categoryData.displayName || category}
                </span>
                <div
                  className="flex items-center gap-1 shrink-0"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                {/* Search Icon - only show if more than MAX_VISIBLE_ITEMS */}
                {categoryData.items.length > MAX_VISIBLE_ITEMS && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsSearchOpen((open) => !open)
                      if (!isSearchOpen) {
                        // Focus search input after it appears
                        setTimeout(() => {
                          const searchInput = document.querySelector('[data-yomeic-search]') as HTMLInputElement
                          if (searchInput) searchInput.focus()
                        }, 0)
                      } else {
                        setSearchQuery('')
                      }
                    }}
                    className={`relative p-1 text-xs transition-colors ${isSearchOpen
                      ? 'opacity-100 text-blue-400'
                      : 'opacity-60 hover:opacity-100 hover:text-white'
                      }`}
                    aria-label="Toggle search"
                    title="Search items (/)"
                  >
                    🔍
                    <span className="absolute -top-0.5 -right-0.5 text-[8px] font-mono opacity-40">/</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsSettingsOpen((open) => !open)
                  }}
                  className="relative p-1 text-xs opacity-60 transition-colors hover:opacity-100 hover:text-white"
                  aria-label="Open Yomeic settings"
                  title="Open settings (s)"
                >
                  ⋯
                  <span className="absolute -top-0.5 -right-0.5 text-[8px] font-mono opacity-40">s</span>
                </button>
                {isSettingsOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 rounded-md border border-zinc-800 bg-zinc-950 py-1 text-xs text-zinc-200 shadow-xl z-60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/5 ${displayMode === 'full' ? 'text-white' : ''
                        }`}
                      onClick={() => handleSetMode('full')}
                    >
                      <span>Full panel</span>
                      <span className="text-[10px] opacity-50 font-mono">1</span>
                    </button>
                    <button
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/5 ${displayMode === 'compact' ? 'text-white' : ''
                        }`}
                      onClick={() => handleSetMode('compact')}
                    >
                      <span>Compact panel</span>
                      <span className="text-[10px] opacity-50 font-mono">2</span>
                    </button>
                    <button
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/5"
                      onClick={() => handleSetMode('minimal')}
                    >
                      <span>Minimal dot</span>
                      <span className="text-[10px] opacity-50 font-mono">3</span>
                    </button>
                    <button
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/5"
                      onClick={handleToggleLines}
                    >
                      <span>Show connection lines</span>
                      <span className="text-[10px] opacity-60">
                        {showLines ? 'On' : 'Off'}
                      </span>
                    </button>
                    <button
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/5"
                      onClick={handleToggleBadges}
                    >
                      <span>Show badges</span>
                      <span className="text-[10px] opacity-60">
                        {showBadges ? 'On' : 'Off'}
                      </span>
                    </button>
                    <div className="my-1 border-t border-zinc-800" />
                    <div className="px-3 py-1.5">
                      <div className="mb-1.5 text-[10px] opacity-60">Line color</div>
                      <div className="flex gap-1.5">
                        {[
                          { color: 'hsl(var(--primary))', label: 'Primary' },
                          { color: 'hsl(var(--accent))', label: 'Accent' },
                          { color: 'hsl(var(--muted-foreground))', label: 'Muted' },
                          { color: 'hsl(var(--destructive))', label: 'Destructive' },
                          { color: 'hsl(var(--border))', label: 'Border' },
                        ].map(({ color, label }) => (
                          <button
                            key={color}
                            onClick={() => handleSetLineColor(color)}
                            className={`h-5 w-5 rounded border-2 transition-all ${lineColor === color ? 'border-foreground scale-110' : 'border-border hover:border-muted-foreground'
                              }`}
                            style={{ backgroundColor: color }}
                            title={label}
                            aria-label={`Set line color to ${label}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="px-3 py-1.5">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[10px] opacity-60">Line opacity</span>
                        <span className="text-[10px] opacity-50 font-mono">{Math.round(lineOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={lineOpacity}
                        onChange={(e) => handleSetLineOpacity(parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${lineColor} 0%, ${lineColor} ${lineOpacity * 100}%, rgb(39, 39, 42) ${lineOpacity * 100}%, rgb(39, 39, 42) 100%)`,
                        }}
                      />
                    </div>
                    <div className="px-3 py-1.5">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[10px] opacity-60">Component opacity</span>
                        <span className="text-[10px] opacity-50 font-mono">{Math.round(componentOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={componentOpacity}
                        onChange={(e) => handleSetComponentOpacity(parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="my-1 border-t border-zinc-800" />
                    <button
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/5"
                      onClick={exportConfig}
                    >
                      <span>Export configuration</span>
                      <span className="text-[10px] opacity-50 font-mono">Ctrl+E</span>
                    </button>
                    <button
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/5"
                      onClick={importConfig}
                    >
                      <span>Import configuration</span>
                      <span className="text-[10px] opacity-50 font-mono">Ctrl+I</span>
                    </button>
                    <div className="my-1 border-t border-zinc-800" />
                    <button
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left text-red-400 hover:bg-red-500/10"
                      onClick={handleHide}
                    >
                      <span>Hide for me</span>
                      <span className="text-[10px] opacity-50 font-mono">d</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`flex flex-col ${displayMode === 'compact' ? 'gap-0.5' : 'gap-1'
                }`}
            >
              {/* Search Input - only show when toggled and if more than MAX_VISIBLE_ITEMS */}
              {isSearchOpen && categoryData.items.length > MAX_VISIBLE_ITEMS && (displayMode === 'full' || displayMode === 'compact') && (
                <div className="relative px-3 pb-2 border-b border-zinc-800">
                  <input
                    data-yomeic-search
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsSearchOpen(false)
                        setSearchQuery('')
                      }
                    }}
                    className="w-full px-2 py-1.5 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setIsSearchOpen(false)
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                    >
                      ✕
                    </button>
                  )}
                  {searchQuery && (
                    <div className="absolute left-3 top-full mt-1 text-[10px] text-zinc-500 font-mono">
                      {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
              {itemsToRender.map((item, idx) => {
                const originalIndex = idx;

                const hasConn = connections.find((c) => c.todoIndex === originalIndex)
                const isSelecting = selectingIndex === originalIndex
                const currentStatus = getItemStatus(originalIndex)
                const statusColors = {
                  todo: 'text-foreground/50',
                  working: 'text-foreground',
                  done: 'text-foreground/80',
                }

                return (
                  <div
                    key={originalIndex}
                    ref={(el) => {
                      if (el) todoRefs.current.set(originalIndex, el)
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      setSelectingIndex(originalIndex)
                    }}
                    onDoubleClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setOpenIssueIndex(originalIndex)
                    }}
                    className={`${styles.item} 
                      ${isSelecting ? 'ring-1 ring-blue-500 bg-blue-500/10' : ''}
                      ${item.info ? 'cursor-help' : 'cursor-pointer'}
                      ${currentStatus === 'done' ? 'opacity-60' : ''}
                      group`}
                  >
                    {/* Status Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const nextStatus: TodoStatus =
                            currentStatus === 'todo' ? 'working' :
                              currentStatus === 'working' ? 'done' : 'todo'
                          setItemStatus(originalIndex, nextStatus)
                        }}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${currentStatus === 'done'
                          ? 'border-border bg-background'
                          : currentStatus === 'working'
                            ? 'border-primary bg-primary/20'
                            : 'border-border hover:border-foreground/50'
                          }`}
                        title={`Status: ${currentStatus} (click to cycle)`}
                      >
                        {currentStatus === 'done' && (
                          <span className="text-[10px] text-foreground">✓</span>
                        )}
                        {currentStatus === 'working' && (
                          <span className="text-[8px] text-primary">⟳</span>
                        )}
                      </button>
                    </div>

                    {item.action && showBadges && (
                      <span className={styles.badge}>{item.action}</span>
                    )}
                    <span className={`flex-1 truncate min-w-0 text-sm font-mono ${statusColors[currentStatus]}`}>
                      {item.text}
                    </span>
                    {hasConn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeConnection(originalIndex)
                        }}
                        className="shrink-0 text-xs opacity-50 hover:text-red-400 hover:opacity-100 px-1"
                      >
                        ✕
                      </button>
                    )}

                    {item.info && (
                      <div
                        className="absolute left-0 top-full mt-2 hidden w-64 p-3
                        z-50 rounded border border-zinc-700 bg-zinc-900
                        text-xs text-zinc-300 shadow-xl group-hover:block whitespace-normal wrap-break-word"
                      >
                        {item.info}
                      </div>
                    )}
                  </div>
                )
              })}

              {hasMore && (
                <button
                  onClick={toggleViewMore}
                  className={`w-full text-center text-[10px] uppercase tracking-widest py-1
                    text-muted-foreground hover:text-foreground/80 transition-colors border-t border-border mt-1`}
                >
                  {isExpanded ? 'Show Less' : `View ${categoryData.items.length - maxItemsForMode} More`}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>

      {/* Detailed Issue View - Slide-in Panel */}
      {openIssueIndex !== null && categoryData && (
        createPortal(
          <>
            {/* Subtle backdrop - no blur to feel less isolated */}
            <div
              className="fixed inset-0 z-9998"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }}
              onClick={() => setOpenIssueIndex(null)}
            />
            {/* Slide-in panel from right */}
            <div
              className="yomeic-issue-panel fixed right-0 top-0 bottom-0 w-full max-w-lg z-10000 bg-zinc-950 border-l border-zinc-800 shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/50 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      const currentStatus = getItemStatus(openIssueIndex)
                      const nextStatus: TodoStatus =
                        currentStatus === 'todo' ? 'working' :
                          currentStatus === 'working' ? 'done' : 'todo'
                      setItemStatus(openIssueIndex, nextStatus)
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${getItemStatus(openIssueIndex) === 'done'
                      ? 'bg-muted text-foreground'
                      : getItemStatus(openIssueIndex) === 'working'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-foreground/70 hover:bg-muted/80'
                      }`}
                  >
                    {getItemStatus(openIssueIndex).toUpperCase()}
                  </button>
                  {categoryData.items[openIssueIndex]?.action && (
                    <span className={styles.badge}>
                      {categoryData.items[openIssueIndex].action}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setOpenIssueIndex(null)}
                  className="p-1.5 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Title - prominent */}
                <div>
                  <h2 className="text-2xl font-mono font-semibold text-gray-100 mb-3 leading-tight">
                    {categoryData.items[openIssueIndex].text}
                  </h2>
                  {categoryData.items[openIssueIndex].description && (
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {categoryData.items[openIssueIndex].description}
                    </p>
                  )}
                </div>

                {/* Info - inline style, no borders */}
                {categoryData.items[openIssueIndex].info && (
                  <div className="bg-zinc-900/40 rounded-lg p-4">
                    <p className="text-sm text-zinc-200 leading-relaxed">
                      {categoryData.items[openIssueIndex].info}
                    </p>
                  </div>
                )}

                {/* Notes - inline style */}
                {categoryData.items[openIssueIndex].notes && (
                  <div className="bg-zinc-900/40 rounded-lg p-4">
                    <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                      {categoryData.items[openIssueIndex].notes}
                    </p>
                  </div>
                )}

                {/* Priority & Tags - compact inline */}
                {(categoryData.items[openIssueIndex].priority || categoryData.items[openIssueIndex].tags) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {categoryData.items[openIssueIndex].priority && (
                      <span className={`px-2.5 py-1 rounded text-xs font-mono ${categoryData.items[openIssueIndex].priority === 'high'
                        ? 'bg-destructive/20 text-destructive'
                        : categoryData.items[openIssueIndex].priority === 'medium'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-foreground'
                        }`}>
                        {categoryData.items[openIssueIndex].priority?.toUpperCase() || ''}
                      </span>
                    )}
                    {categoryData.items[openIssueIndex].tags && categoryData.items[openIssueIndex].tags!.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded text-xs font-mono bg-zinc-800/60 text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Connections - inline badge style */}
                {connections.find((c) => c.todoIndex === openIssueIndex) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono">Connected:</span>
                    {(() => {
                      const conn = connections.find((c) => c.todoIndex === openIssueIndex)!
                      if (conn.targetLabel) {
                        return <span className="px-2.5 py-1 rounded text-xs font-mono bg-blue-500/20 text-blue-400">{conn.targetLabel}</span>
                      } else if (conn.targetPosition) {
                        return <span className="px-2.5 py-1 rounded text-xs font-mono bg-purple-500/20 text-purple-400">Freeroam</span>
                      }
                      return null
                    })()}
                  </div>
                )}

                {/* Dynamic Metadata - more interesting format */}
                {(categoryData.items[openIssueIndex].createdAt || categoryData.items[openIssueIndex].updatedAt) && (
                  <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono">
                    {categoryData.items[openIssueIndex].createdAt && (
                      <div>
                        <span className="opacity-60">Created</span>{' '}
                        <span className="text-zinc-400">
                          {new Date(categoryData.items[openIssueIndex].createdAt!).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {categoryData.items[openIssueIndex].updatedAt && (
                      <div>
                        <span className="opacity-60">Updated</span>{' '}
                        <span className="text-zinc-400">
                          {new Date(categoryData.items[openIssueIndex].updatedAt!).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions - floating at bottom */}
                <div className="sticky bottom-0 pt-4 pb-2 flex gap-2 bg-zinc-950/95 backdrop-blur-sm">
                  <button
                    onClick={() => {
                      setSelectingIndex(openIssueIndex)
                      setOpenIssueIndex(null)
                    }}
                    className="flex-1 px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    Connect
                  </button>
                  {connections.find((c) => c.todoIndex === openIssueIndex) && (
                    <button
                      onClick={() => {
                        removeConnection(openIssueIndex)
                      }}
                      className="px-4 py-2 rounded border border-red-500/30 bg-red-500/10 text-xs font-mono text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body
        )
      )}

      {/* Toast Notifications */}
      {toast && createPortal(
        <div
          className={`fixed top-4 right-4 z-10001 px-4 py-3 rounded-lg border shadow-xl font-mono text-sm transition-all ${toast.type === 'success'
            ? 'bg-muted border-border text-foreground'
            : toast.type === 'error'
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-primary/10 border-primary/30 text-primary'
            } yomeic-toast`}
        >
          {toast.message}
        </div>,
        document.body
      )}

      {/* Keyboard Help Overlay */}
      {showKeyboardHelp && createPortal(
        <div
          className="fixed inset-0 z-10002 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowKeyboardHelp(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950">
              <h2 className="text-lg font-mono font-semibold text-gray-200">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-mono font-semibold text-zinc-300 mb-2">Navigation</h3>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Open settings</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">s</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Show keyboard help</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">?</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Search items</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">/</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Close modals</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">Esc</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-mono font-semibold text-zinc-300 mb-2">Display Modes</h3>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Full panel</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">1</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Compact panel</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">2</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Minimal dot</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">3</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-mono font-semibold text-zinc-300 mb-2">Actions</h3>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Toggle connection lines</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">l</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Toggle badges</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">b</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Hide component</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">d</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-mono font-semibold text-zinc-300 mb-2">Data Management</h3>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Export configuration</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">Ctrl+E</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Import configuration</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">Ctrl+I</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Undo last action</span>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">Ctrl+Z</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-mono font-semibold text-zinc-300 mb-2">Interactions</h3>
                <div className="space-y-1.5 text-xs font-mono text-zinc-400">
                  <div className="py-1 border-b border-zinc-800/50">Right-click item to connect</div>
                  <div className="py-1 border-b border-zinc-800/50">Double-click item to view details</div>
                  <div className="py-1 border-b border-zinc-800/50">Click status to cycle (todo → working → done)</div>
                  <div className="py-1 border-b border-zinc-800/50">Drag connection point to edit</div>
                  <div className="py-1">Double-click connection point to remove</div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export function Yomeic(props: Props) {
  if (!SHOW_TODOS) return null
  return <YomeicCore {...props} />
}