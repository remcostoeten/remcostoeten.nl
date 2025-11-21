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
      'fixed flex flex-col gap-2 rounded-lg border p-4 w-96 shadow-2xl transition-all backdrop-blur-md z-50',
    item: 'relative flex items-center gap-3 p-1.5 px-2 rounded transition-colors w-full',
    header: 'flex items-center justify-between gap-3 min-w-0 border-b pb-2',
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

type Props = {
  category: string
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

function YomeicCore({ category }: Props) {
  const categoryData = useMemo(
    () => categories.find((c) => c.id === category),
    [category]
  )

  const keys = useMemo(
    () => ({
      pos: `${STORAGE_PREFIX}pos-${category}`,
      col: `${STORAGE_PREFIX}col-${category}`,
      con: `${STORAGE_PREFIX}con-${category}`,
    }),
    [category]
  )

  // State
  const [isMounted, setIsMounted] = useState(false)
  const [pos, setPos] = useState<Pos>({ x: 20, y: 20 })
  const [connections, setConnections] = useState<Connection[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

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

  // Initialization
  useEffect(() => {
    function loadState() {
      try {
        const savedPos = localStorage.getItem(keys.pos)
        const savedCol = localStorage.getItem(keys.col)
        const savedCon = localStorage.getItem(keys.con)

        if (savedPos) setPos(JSON.parse(savedPos))
        if (savedCol) setIsCollapsed(JSON.parse(savedCol))
        if (savedCon) setConnections(JSON.parse(savedCon))
      } catch (e) {
        console.error('Yomeic storage read error', e)
      }
      setIsMounted(true)
    }
    loadState()
  }, [keys])

  // Global Listeners
  useEffect(() => {
    function handleTick() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() =>
        setTick((t) => (t + 1) % 100)
      )
    }

    window.addEventListener('scroll', handleTick, true)
    window.addEventListener('resize', handleTick)
    return () => {
      window.removeEventListener('scroll', handleTick, true)
      window.removeEventListener('resize', handleTick)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Drag Logic
  useEffect(() => {
    if (!isDragging) return

    function onMove(e: MouseEvent) {
      const newPos = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      }
      setPos(newPos)
    }

    function onUp() {
      setIsDragging(false)
      localStorage.setItem(keys.pos, JSON.stringify(pos))
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
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

  function startDrag(e: React.MouseEvent) {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setIsDragging(true)
    }
  }

  function toggleCollapse() {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem(keys.col, JSON.stringify(next))
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

          return (
            <g key={key}>
              <path 
                d={d} 
                stroke={isFree ? theme.colors.freeroam : theme.colors.primary}
                strokeWidth="2"
                fill="none"
                strokeDasharray="6 4"
                style={{ animation: 'yomeic-dash 30s linear infinite' }}
                opacity="0.6"
              />
              <circle
                cx={start.x}
                cy={start.y}
                {...styles.connectorDot}
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
                fill={isFree ? styles.freeroamDot.fill : styles.connectorDot.fill}
                stroke={isFree ? styles.freeroamDot.stroke : undefined}
                strokeWidth={isFree ? styles.freeroamDot.strokeWidth : undefined}
                r={hoveredConnection === conn.todoIndex ? (isFree ? 4.5 : 5) : (isFree ? styles.freeroamDot.r : styles.connectorDot.r)}
                opacity={hoveredConnection === conn.todoIndex ? 1 : (isFree ? styles.freeroamDot.opacity : 1)}
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

  const itemsToRender = isExpanded 
    ? categoryData.items 
    : categoryData.items.slice(0, MAX_VISIBLE_ITEMS)
  const hasMore = categoryData.items.length > MAX_VISIBLE_ITEMS

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

      {renderLines()}

      {/* 
         Overlay: The container must be pointer-events-none so mouse clicks
         pass through to the website elements. 
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
          >
            <div
              className="fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded border bg-zinc-900 text-sm font-mono shadow-xl"
              style={{
                borderColor: isFreeroam
                  ? theme.colors.freeroam
                  : theme.colors.primary,
                color: isFreeroam ? '#c4b5fd' : '#93c5fd',
                pointerEvents: 'auto' // Keep instruction banner interactive if needed (or just visible)
              }}
            >
              {isFreeroam
                ? '🎯 FREEROAM: Click anywhere to pin'
                : '🔗 DOM: Click element (Shift for Freeroam)'}
            </div>
          </div>,
          document.body
        )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={styles.panel}
        style={{
          left: pos.x,
          top: pos.y,
          zIndex: theme.z.panel,
        }}
      >
        <div 
          className={styles.header} 
          onMouseDown={startDrag}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <span className="text-sm font-mono truncate opacity-80">
            {categoryData.displayName || category}
          </span>
          <button
            onClick={toggleCollapse}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 hover:text-white transition-colors opacity-60 hover:opacity-100"
          >
            {isCollapsed ? '+' : '−'}
          </button>
        </div>

        {!isCollapsed && (
          <div className="flex flex-col gap-1">
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
                  {item.action && (
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
                {isExpanded ? 'Show Less' : `View ${categoryData.items.length - MAX_VISIBLE_ITEMS} More`}
              </button>
            )}

            <div className={`mt-2 text-[10px] ${theme.colors.textDim} font-mono text-center opacity-50 space-y-0.5`}>
              <div>Right-click item to connect</div>
              <div className="opacity-40">Drag connection point to edit • Double-click to remove</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export function Yomeic(props: Props) {
  if (!SHOW_TODOS) return null
  return <YomeicCore {...props} />
}