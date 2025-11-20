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
    bgOverlay: 'rgba(0, 0, 0, 0.3)',
  },
  layout: {
    panel:
      'fixed flex flex-col gap-2 rounded-lg border p-4 max-w-md shadow-2xl transition-all backdrop-blur-sm',
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
  header: `${theme.layout.header} ${theme.colors.borderPanel}`,
  badge: `${theme.layout.badge} bg-blue-900/50 text-blue-200`,
  connectorDot: {
    fill: theme.colors.primary,
    r: 4,
  },
  freeroamDot: {
    fill: theme.colors.primary,
    stroke: theme.colors.primary,
    strokeWidth: 2,
    r: 6,
    opacity: 0.8,
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
  const [isExpanded, setIsExpanded] = useState(false) // "View More" state

  // Interaction
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<Pos>({ x: 0, y: 0 })
  const [selectingIndex, setSelectingIndex] = useState<number | null>(null)
  const [hoveredTarget, setHoveredTarget] = useState<Element | null>(null)
  const [isFreeroam, setIsFreeroam] = useState(false)
  const [, setTick] = useState(0)

  const panelRef = useRef<HTMLDivElement>(null)
  const todoRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const rafRef = useRef<number>()

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
          todoIndex: selectingIndex,
          targetPosition: { x: e.clientX, y: e.clientY },
        }
      } else {
        newConn = {
          todoIndex: selectingIndex,
          targetSelector: generateSelector(target),
          targetLabel: getElementLabel(target),
        }
      }

      const next = connections.filter((c) => c.todoIndex !== selectingIndex)
      next.push(newConn)
      setConnections(next)
      localStorage.setItem(keys.con, JSON.stringify(next))
      setSelectingIndex(null)
    }

    function onMove(e: MouseEvent) {
      if (isFreeroam) {
        setHoveredTarget(null)
        return
      }
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
      >
        {connections.map((conn) => {
          const el = todoRefs.current.get(conn.todoIndex)
          // If element is hidden due to accordion, don't render line
          if (!el) return null
          
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
          const key = `${conn.todoIndex}-${isFree ? 'free' : 'dom'}`

          return (
            <g key={key}>
              <path 
                d={d} 
                stroke={theme.colors.primary}
                strokeWidth="2"
                fill="none"
                strokeDasharray="6 4"
                style={{ animation: 'yomeic-dash 20s linear infinite' }}
                opacity="0.6"
              />
              <circle
                cx={start.x}
                cy={start.y}
                {...styles.connectorDot}
              />
              <circle
                cx={end.x}
                cy={end.y}
                {...(isFree ? styles.freeroamDot : styles.connectorDot)}
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

      {/* Overlay */}
      {selectingIndex !== null &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: theme.z.overlay,
              backgroundColor: theme.colors.bgOverlay,
              cursor: 'crosshair',
            }}
          >
            <div
              className="fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded border bg-zinc-900 text-sm font-mono shadow-xl"
              style={{
                borderColor: isFreeroam
                  ? theme.colors.freeroam
                  : theme.colors.primary,
                color: isFreeroam ? '#c4b5fd' : '#93c5fd',
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
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div className={styles.header} onMouseDown={startDrag}>
          <span className="text-sm font-mono truncate opacity-80">
            <span className={theme.colors.textDim}>yo::</span>
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
              // Note: idx here is correct for refs/connections because map index 0 
              // always corresponds to array index 0. If we hid previous items, we'd need offset logic.
              const hasConn = connections.find((c) => c.todoIndex === idx)
              const isSelecting = selectingIndex === idx

              return (
                <div
                  key={idx}
                  ref={(el) => {
                    if (el) todoRefs.current.set(idx, el)
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setSelectingIndex(idx)
                  }}
                  className={`${styles.panel} border-none shadow-none p-1.5 px-2
                    ${isSelecting ? 'ring-1 ring-blue-500 bg-blue-500/10' : ''}
                    ${item.info ? 'cursor-help' : ''} group hover:bg-white/5`}
                >
                  <div className="flex items-center gap-3 text-sm font-mono">
                    {item.action && (
                      <span className={styles.badge}>{item.action}</span>
                    )}
                    <span className="flex-1 truncate opacity-90">
                      {item.text}
                    </span>
                    {hasConn && (
                      <button
                        onClick={() => removeConnection(idx)}
                        className="text-xs opacity-50 hover:text-red-400 hover:opacity-100 px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {item.info && (
                    <div
                      className="absolute left-0 top-full mt-2 hidden w-64 p-3
                      z-50 rounded border border-zinc-700 bg-zinc-900
                      text-xs text-zinc-300 shadow-xl group-hover:block"
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

            <div className={`mt-2 text-[10px] ${theme.colors.textDim} font-mono text-center opacity-50`}>
              Right-click item to connect
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