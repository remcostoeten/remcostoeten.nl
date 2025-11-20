'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Pos = {
  x: number
  y: number
}

type CatProps = {
  id: string
  todos: string[]
  action?: string[]
  additionalInfo?: string[]
}

type Connection = {
  todoIndex: number
  targetSelector: string
  targetLabel: string
}

type props = {
  category: string
}

const SHOW_TODOS = process.env.NEXT_PUBLIC_SHOW_TODOS === 'true'

const todoCategories: CatProps[] = [
  {
    id: 'blog-feature',
    todos: ['Implement view count analytics with custom back-end','Add a read duration counter to blog posts meta-info'],
    action: ['develop', 'build'],
  },
  {
    id: 'dev',
    action: ['create'],
    todos: ['Create enviorment validator tool '],
    additionalInfo: [
      'Try to build agnostic in a primitiev style way. I think a v0 demo app repository has some good ideas.',
    ],
  },
  {
    id: 'blog-post',
    todos: [
      'Maybe write a blog about the env var validator tool for superior dev',
      'Write a blog about the internal todo component and my task workflow',
    ],
    action: ['write', 'write'],
  },
  {
    id: 'blog-detail',
    todos: [
      'Add read time per blog',
      'Add view count per blog',
      'Add category per blog',
      'Add tags per blog',
      'Style code block more aesthetically pleasing',
      'Implement a shareing system',
    ],
    action: ['add', 'add', 'add', 'add', 'style', 'implement'],
  },
]

function DevTodosComponent({ category }: props) {
  function getInitialPosition(): Pos {
    if (typeof window === 'undefined') return { x: 8, y: 8 }
    const savedPos = localStorage.getItem(`dev-todos-pos-${category}`)
    return savedPos ? JSON.parse(savedPos) : { x: 8, y: 8 }
  }

  function getInitialCollapsed(): boolean {
    if (typeof window === 'undefined') return false
    const savedCollapsed = localStorage.getItem(
      `dev-todos-collapsed-${category}`
    )
    return savedCollapsed ? JSON.parse(savedCollapsed) : false
  }

  function getInitialConnections(): Connection[] {
    if (typeof window === 'undefined') return []
    const savedConnections = localStorage.getItem(
      `dev-todos-connections-${category}`
    )
    return savedConnections ? JSON.parse(savedConnections) : []
  }

  const initialPosition = getInitialPosition()
  const [position, setPosition] = useState<Pos>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsed)
  const [dragOffset, setDragOffset] = useState<Pos>({ x: 0, y: 0 })
  const [connections, setConnections] = useState<Connection[]>(
    getInitialConnections
  )
  const [selectingTargetFor, setSelectingTargetFor] = useState<number | null>(
    null
  )
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null)
  const [, setForceUpdate] = useState(0)

  const ref = useRef<HTMLDivElement>(null)
  const positionRef = useRef<Pos>(initialPosition)
  const todoItemRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const categoryData = todoCategories.find((cat) => cat.id === category)
  if (!categoryData?.todos) return null

  useEffect(() => {
    positionRef.current = position
  }, [position])

  useEffect(() => {
    console.log(`[DevTodos ${category}] Position:`, position)
  }, [position, category])

  useEffect(() => {
    const connectionData = connections.map((conn) => {
      const todoElement = todoItemRefs.current.get(conn.todoIndex)
      const targetElement = document.querySelector(conn.targetSelector)

      if (!todoElement || !targetElement) return null

      const todoRect = todoElement.getBoundingClientRect()
      const targetRect = targetElement.getBoundingClientRect()

      const startX = todoRect.right
      const startY = todoRect.top + todoRect.height / 2
      const endX = targetRect.left
      const endY = targetRect.top + targetRect.height / 2

      return {
        todoIndex: conn.todoIndex,
        targetSelector: conn.targetSelector,
        targetLabel: conn.targetLabel,
        startPos: { x: startX, y: startY },
        endPos: { x: endX, y: endY },
      }
    })

    console.log(`[DevTodos ${category}] Connections:`, connectionData)
  }, [connections, category])

  useEffect(() => {
    function handleUpdate() {
      setForceUpdate((prev) => prev + 1)
    }

    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [])

  useEffect(() => {
    if (selectingTargetFor === null) return

    function preventAnchorClick(e: Event) {
      if ((e.target as Element).tagName === 'A') {
        e.preventDefault()
      }
    }

    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('mousemove', handleDocumentMouseMove)
    document.addEventListener('click', preventAnchorClick, true)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('click', preventAnchorClick, true)
    }
  }, [selectingTargetFor, connections, category])

  useEffect(() => {
    if (!hoveredElement) return

    hoveredElement.classList.add('dev-todos-target-hover')

    return () => {
      hoveredElement.classList.remove('dev-todos-target-hover')
    }
  }, [hoveredElement])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && selectingTargetFor !== null) {
        setSelectingTargetFor(null)
        setHoveredElement(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectingTargetFor])

  useEffect(() => {
    if (!isDragging) return

    function handleMouseMove(e: MouseEvent) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      }
      positionRef.current = newPosition
      setPosition(newPosition)
    }

    function handleMouseUp() {
      setIsDragging(false)
      localStorage.setItem(
        `dev-todos-pos-${category}`,
        JSON.stringify(positionRef.current)
      )
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, category])

  function handleMouseDown(e: React.MouseEvent) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsDragging(true)
  }

  function toggleCollapse() {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem(
      `dev-todos-collapsed-${category}`,
      JSON.stringify(newState)
    )
  }

  function handleTodoRightClick(e: React.MouseEvent, todoIndex: number) {
    e.preventDefault()
    setSelectingTargetFor(todoIndex)
  }

  function isValidSelector(selector: string): boolean {
    try {
      document.querySelector(selector)
      return true
    } catch {
      return false
    }
  }

  function generateSelector(element: Element): string {
    if (element.id) {
      const idSelector = `#${element.id}`
      if (isValidSelector(idSelector)) return idSelector
    }

    const parent = element.parentElement
    if (parent) {
      const siblings = Array.from(parent.children)
      const index = siblings.indexOf(element)
      const parentId = parent.id
      const parentSelector = parentId
        ? `#${parentId}`
        : parent.tagName.toLowerCase()
      const selector = `${parentSelector} > ${element.tagName.toLowerCase()}:nth-child(${
        index + 1
      })`

      if (isValidSelector(selector)) return selector
    }

    return element.tagName.toLowerCase()
  }

  function getElementLabel(element: Element): string {
    const textContent = element.textContent?.trim().slice(0, 30)
    if (element.id) return `#${element.id}`
    if (textContent) return textContent
    return element.tagName.toLowerCase()
  }

  function handleDocumentClick(e: MouseEvent) {
    if (selectingTargetFor === null) return

    const target = e.target as Element
    if (!target || ref.current?.contains(target)) {
      setSelectingTargetFor(null)
      return
    }

    const selector = generateSelector(target)
    const label = getElementLabel(target)

    const newConnection: Connection = {
      todoIndex: selectingTargetFor,
      targetSelector: selector,
      targetLabel: label,
    }

    const updatedConnections = [
      ...connections.filter((c) => c.todoIndex !== selectingTargetFor),
      newConnection,
    ]

    setConnections(updatedConnections)
    localStorage.setItem(
      `dev-todos-connections-${category}`,
      JSON.stringify(updatedConnections)
    )
    setSelectingTargetFor(null)
    setHoveredElement(null)
  }

  function handleDocumentMouseMove(e: MouseEvent) {
    if (selectingTargetFor === null) return

    const target = e.target as Element
    if (!target || ref.current?.contains(target)) {
      setHoveredElement(null)
      return
    }

    setHoveredElement(target)
  }

  function removeConnection(todoIndex: number) {
    const updatedConnections = connections.filter(
      (c) => c.todoIndex !== todoIndex
    )
    setConnections(updatedConnections)
    localStorage.setItem(
      `dev-todos-connections-${category}`,
      JSON.stringify(updatedConnections)
    )
  }

  function renderConnections() {
    if (typeof window === 'undefined') return null

    const lines = connections.map((conn) => {
      const todoElement = todoItemRefs.current.get(conn.todoIndex)
      const targetElement = document.querySelector(conn.targetSelector)

      if (!todoElement || !targetElement) return null

      const todoRect = todoElement.getBoundingClientRect()
      const targetRect = targetElement.getBoundingClientRect()

      const startX = todoRect.right
      const startY = todoRect.top + todoRect.height / 2

      const endX = targetRect.left
      const endY = targetRect.top + targetRect.height / 2

      const distance = Math.abs(endX - startX)
      const controlOffset = Math.min(distance / 2, 100)

      const controlX1 = startX + controlOffset
      const controlY1 = startY
      const controlX2 = endX - controlOffset
      const controlY2 = endY

      const path = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`

      return (
        <g key={`${conn.todoIndex}-${conn.targetSelector}`}>
          <path
            d={path}
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <circle cx={startX} cy={startY} r="4" fill="rgb(59, 130, 246)" />
          <circle cx={endX} cy={endY} r="4" fill="rgb(59, 130, 246)" />
        </g>
      )
    })

    return createPortal(
      <svg
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 40,
        }}
      >
        {lines}
      </svg>,
      document.body
    )
  }

  return (
    <>
      {renderConnections()}

      {selectingTargetFor !== null &&
        createPortal(
          <>
            <style>{`
              .dev-todos-target-hover {
                outline: 2px solid rgb(59, 130, 246) !important;
                outline-offset: 2px;
                background-color: rgba(59, 130, 246, 0.1) !important;
              }
            `}</style>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 45,
                cursor: 'crosshair',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  position: 'fixed',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgb(24, 24, 27)',
                  color: 'rgb(147, 197, 253)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '2px solid rgb(59, 130, 246)',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  zIndex: 46,
                }}
              >
                Click on any element to connect • Press ESC to cancel
              </div>
            </div>
          </>,
          document.body
        )}

      <div
        ref={ref}
        className="fixed z-50 flex flex-col gap-2 rounded-lg border bg-background border-zinc-800
          bg-foreground p-4 text-foreground"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          pointerEvents: selectingTargetFor !== null ? 'none' : 'auto',
        }}
      >
        <div
          className="mb-2 flex flex-col gap-2 border-b border-zinc-800 pb-2"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-mono text-gray-300">
              <i>internal todo(s) </i> for: {category}
            </span>
            <button
              onClick={toggleCollapse}
              className="text-gray-400 hover:text-gray-200"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {isCollapsed ? '▶' : '▼'}
            </button>
          </div>
          {!isCollapsed && (
            <span className="text-xs text-zinc-500 font-mono">
              Right-click todo → Click target element
            </span>
          )}
        </div>

        {!isCollapsed &&
          categoryData.todos.map((todo, index) => {
            const action = categoryData.action?.[index]
            const info = categoryData.additionalInfo?.[index]
            const connection = connections.find((c) => c.todoIndex === index)
            const isSelectingThis = selectingTargetFor === index

            return (
              <div key={index} className="group relative block w-full">
                <div
                  ref={(el) => {
                    if (el) todoItemRefs.current.set(index, el)
                  }}
                  onContextMenu={(e) => handleTodoRightClick(e, index)}
                  className={`relative ${
                    isSelectingThis ? 'ring-2 ring-blue-500 rounded' : ''
                  }`}
                >
                  <pre
                    className={`flex items-center gap-2 text-sm font-mono
                      text-gray-300 w-full ${
                        info
                          ? 'cursor-help border-b border-dashed border-zinc-700'
                          : ''
                      }`}
                  >
                    <span className="flex items-center gap-2 w-full min-w-0">
                      {action && (
                        <span className="shrink-0 rounded bg-blue-900 px-1.5
                          py-0.5 text-xs text-blue-200">
                          {action}
                        </span>
                      )}
                      <strong
                        className="flex-1 min-w-0 break-words"
                        title={todo}
                      >
                        {todo}
                      </strong>
                      {connection && (
                        <button
                          onClick={() => removeConnection(index)}
                          className="shrink-0 text-xs text-blue-400
                            hover:text-red-400 px-1"
                          title={`Connected to: ${connection.targetLabel}\nClick to remove`}
                        >
                          🔗
                        </button>
                      )}
                      {info && (
                        <span className="shrink-0 text-xs text-zinc-500">
                          ⓘ
                        </span>
                      )}
                    </span>
                  </pre>
                </div>

                {info && (
                  <div className="pointer-events-none absolute left-0 top-full
                    z-10 mt-2 hidden w-full max-w-lg rounded-lg border
                    border-zinc-600 bg-zinc-800 p-4 text-sm leading-relaxed
                    text-gray-200 shadow-xl group-hover:block">
                    {info}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </>
  )
}

export function DevTodos(props: props) {
  if (!SHOW_TODOS) {
    return null
  }
  return <DevTodosComponent {...props} />
}