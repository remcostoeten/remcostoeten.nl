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
    primary: 'rgb(59, 130, 246)',
    primaryDim: 'rgba(59, 130, 246, 0.1)',
    freeroam: 'rgb(139, 92, 246)',
    textMain: 'text-gray-200',
    textDim: 'text-zinc-500',
    bgPanel: 'bg-zinc-950',
    borderPanel: 'border-zinc-800',
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
  item: `${theme.layout.item} hover:bg-white/5`,
  header: `${theme.layout.header} ${theme.colors.borderPanel}`,
  badge: `${theme.layout.badge} bg-blue-900/50 text-blue-200`,
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

type TodoItem = {
  text: string
  action?: string
  info?: string
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
    const s = `${parentSel} > ${element.tagName.toLowerCase()}:nth-child(${
      index + 1
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
  return `M ${start.x} ${start.y} C ${start.x + offset} ${start.y}, ${
    end.x - offset
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

  // Global keyboard shortcut to open settings
  useEffect(() => {
    if (isHidden || !isMounted) return

    function onKeyDown(e: KeyboardEvent) {
      // Only trigger if not typing in an input/textarea and settings not already open
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        isSettingsOpen
      ) {
        return
      }

      // Open settings with 's' or '?' key
      if (e.key === 's' || e.key === 'S' || e.key === '?') {
        // Don't trigger if modifier keys are pressed (to avoid conflicts)
        if (e.metaKey || e.ctrlKey || e.altKey) return
        
        e.preventDefault()
        e.stopPropagation()
        setIsSettingsOpen(true)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isHidden, isMounted, isSettingsOpen])

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

  if (!categoryData || !isMounted) return null

  if (isHidden) return null

  const maxItemsForMode = displayMode === 'compact' ? 1 : MAX_VISIBLE_ITEMS

  const itemsToRender = isExpanded 
    ? categoryData.items 
    : categoryData.items.slice(0, maxItemsForMode)
  const hasMore = categoryData.items.length > maxItemsForMode
  const primaryItem = categoryData.items[0]
  const shouldRenderLines = showLines && !isHidden

  return (
    <>
      <style>{`
        @keyframes yomeic-dash {
          to { stroke-dashoffset: -100; }
        }
        .yomeic-target-hover {
          outline: 2px solid ${theme.colors.primary} !important;
          outline-offset: 2px;
          background-color: ${theme.colors.primaryDim} !important;
          cursor: crosshair !important;
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
        className={`${styles.panel} ${
          displayMode === 'compact' ? 'w-72 px-3 pb-3 pt-0 gap-1 text-xs' : ''
        } ${
          displayMode === 'minimal'
            ? 'w-auto h-auto p-0 border-none bg-transparent shadow-none'
            : ''
        } ${
          displayMode === 'full' ? 'px-3 pb-3 pt-0' : ''
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
              <span className="truncate max-w-[1.75rem]">
                {(categoryData.displayName || category).slice(0, 2)}
              </span>
              <span className="absolute -top-1 -right-1 h-4 min-w-[1.1rem] rounded-full bg-blue-600 text-[9px] leading-4 text-center text-white px-1">
                {categoryData.items.length}
              </span>
            </button>

            {primaryItem && (
              <div
                className="absolute left-full top-1/2 ml-2 -translate-y-1/2 hidden group-hover:block rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 shadow-xl min-w-[10rem] max-w-xs"
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
              className={`${styles.header} relative`} 
              onMouseDown={startDrag}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
            >
              <span className="text-[11px] font-mono truncate opacity-80">
                {categoryData.displayName || category}
              </span>
              <div
                className="flex items-center gap-1"
                onMouseDown={(e) => e.stopPropagation()}
              >
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
                    className="absolute right-0 top-full mt-2 w-56 rounded-md border border-zinc-800 bg-zinc-950 py-1 text-xs text-zinc-200 shadow-xl z-[60]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/5 ${
                        displayMode === 'full' ? 'text-white' : ''
                      }`}
                      onClick={() => handleSetMode('full')}
                    >
                      <span>Full panel</span>
                      <span className="text-[10px] opacity-50 font-mono">1</span>
                    </button>
                    <button
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-white/5 ${
                        displayMode === 'compact' ? 'text-white' : ''
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
                          { color: theme.colors.primary, label: 'Blue' },
                          { color: theme.colors.freeroam, label: 'Purple' },
                          { color: 'rgb(34, 197, 94)', label: 'Green' },
                          { color: 'rgb(239, 68, 68)', label: 'Red' },
                          { color: 'rgb(234, 179, 8)', label: 'Yellow' },
                        ].map(({ color, label }) => (
                          <button
                            key={color}
                            onClick={() => handleSetLineColor(color)}
                            className={`h-5 w-5 rounded border-2 transition-all ${
                              lineColor === color ? 'border-white scale-110' : 'border-zinc-700 hover:border-zinc-600'
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
              className={`flex flex-col ${
                displayMode === 'compact' ? 'gap-0.5' : 'gap-1'
              }`}
            >
              {itemsToRender.map((item, idx) => {
                const originalIndex = idx; 
                
                const hasConn = connections.find((c) => c.todoIndex === originalIndex)
                const isSelecting = selectingIndex === originalIndex

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
                    className={`${styles.item} 
                      ${isSelecting ? 'ring-1 ring-blue-500 bg-blue-500/10' : ''}
                      ${item.info ? 'cursor-help' : ''} group`}
                  >
                    {item.action && showBadges && (
                      <span className={styles.badge}>{item.action}</span>
                    )}
                    <span className="flex-1 truncate opacity-90 min-w-0 text-sm font-mono">
                      {item.text}
                    </span>
                    {hasConn && (
                      <button
                        onClick={() => removeConnection(originalIndex)}
                        className="shrink-0 text-xs opacity-50 hover:text-red-400 hover:opacity-100 px-1"
                      >
                        ✕
                      </button>
                    )}
                    
                    {item.info && (
                      <div
                        className="absolute left-0 top-full mt-2 hidden w-64 p-3
                        z-50 rounded border border-zinc-700 bg-zinc-900
                        text-xs text-zinc-300 shadow-xl group-hover:block whitespace-normal break-words"
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
                    ${theme.colors.textDim} hover:text-zinc-300 transition-colors border-t border-zinc-800/50 mt-1`}
                >
                  {isExpanded ? 'Show Less' : `View ${categoryData.items.length - maxItemsForMode} More`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export function Yomeic(props: Props) {
  if (!SHOW_TODOS) return null
  return <YomeicCore {...props} />
}