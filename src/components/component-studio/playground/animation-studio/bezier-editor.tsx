"use client"

import { useCallback, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface BezierEditorProps {
  value: [number, number, number, number]
  onChange: (value: [number, number, number, number]) => void
  size?: number
}

const PRESETS: { label: string; value: [number, number, number, number] }[] = [
  { label: "linear", value: [0, 0, 1, 1] },
  { label: "ease", value: [0.25, 0.1, 0.25, 1] },
  { label: "ease-in", value: [0.42, 0, 1, 1] },
  { label: "ease-out", value: [0, 0, 0.58, 1] },
  { label: "ease-in-out", value: [0.42, 0, 0.58, 1] },
  { label: "poppy", value: [0.16, 1, 0.3, 1] },
  { label: "bounce", value: [0.34, 1.56, 0.64, 1] },
  { label: "snap", value: [0.5, 0, 0, 1] },
]

export function BezierEditor({
  value,
  onChange,
  size = 200,
}: BezierEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeHandle, setActiveHandle] = useState<1 | 2 | null>(null)
  const [x1, y1, x2, y2] = value

  // Convert CSS bezier values to SVG coordinates
  // CSS: (0,0) is bottom-left, (1,1) is top-right
  // SVG: (0,0) is top-left, (size,size) is bottom-right
  const toSvg = (cx: number, cy: number): [number, number] => [
    cx * size,
    (1 - cy) * size,
  ]

  const fromSvg = (sx: number, sy: number): [number, number] => [
    Math.round((sx / size) * 100) / 100,
    Math.round(((1 - sy / size)) * 100) / 100,
  ]

  const [p1x, p1y] = toSvg(x1, y1)
  const [p2x, p2y] = toSvg(x2, y2)

  const handlePointerDown = useCallback(
    (handle: 1 | 2) => (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as SVGElement).setPointerCapture(e.pointerId)
      setActiveHandle(handle)
    },
    []
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeHandle || !svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const sx = Math.max(0, Math.min(size, e.clientX - rect.left))
      // Allow y overshoot for bounce curves (clamp between -0.5 and 1.5 in CSS space)
      const rawSy = e.clientY - rect.top
      const sy = Math.max(-size * 0.5, Math.min(size * 1.5, rawSy))

      const [cx, cy] = fromSvg(sx, sy)

      if (activeHandle === 1) {
        onChange([cx, cy, x2, y2])
      } else {
        onChange([x1, y1, cx, cy])
      }
    },
    [activeHandle, size, x1, y1, x2, y2, onChange, fromSvg]
  )

  const handlePointerUp = useCallback(() => {
    setActiveHandle(null)
  }, [])

  const bezierString = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`

  return (
    <div className="flex flex-col gap-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="border border-border/50 bg-card/10 cursor-crosshair select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <g key={t}>
            <line
              x1={t * size}
              y1={0}
              x2={t * size}
              y2={size}
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
              opacity={0.3}
            />
            <line
              x1={0}
              y1={t * size}
              x2={size}
              y2={t * size}
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
              opacity={0.3}
            />
          </g>
        ))}

        {/* Linear reference */}
        <line
          x1={0}
          y1={size}
          x2={size}
          y2={0}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={0.5}
          strokeDasharray="4 4"
          opacity={0.2}
        />

        {/* Control arms */}
        <line
          x1={0}
          y1={size}
          x2={p1x}
          y2={p1y}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.5}
        />
        <line
          x1={size}
          y1={0}
          x2={p2x}
          y2={p2y}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.5}
        />

        {/* Bezier curve */}
        <path
          d={`M 0,${size} C ${p1x},${p1y} ${p2x},${p2y} ${size},0`}
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
        />

        {/* Start/end points */}
        <circle cx={0} cy={size} r={3} fill="hsl(var(--muted-foreground))" opacity={0.5} />
        <circle cx={size} cy={0} r={3} fill="hsl(var(--muted-foreground))" opacity={0.5} />

        {/* Control point 1 */}
        <circle
          cx={p1x}
          cy={p1y}
          r={6}
          fill="hsl(var(--primary))"
          stroke="hsl(var(--background))"
          strokeWidth={2}
          className={cn("cursor-grab", activeHandle === 1 && "cursor-grabbing")}
          onPointerDown={handlePointerDown(1)}
        />

        {/* Control point 2 */}
        <circle
          cx={p2x}
          cy={p2y}
          r={6}
          fill="hsl(var(--primary))"
          stroke="hsl(var(--background))"
          strokeWidth={2}
          className={cn("cursor-grab", activeHandle === 2 && "cursor-grabbing")}
          onPointerDown={handlePointerDown(2)}
        />
      </svg>

      {/* Bezier value display */}
      <div className="flex items-center justify-between">
        <code className="text-[11px] font-mono text-muted-foreground/70">
          {bezierString}
        </code>
        <button
          onClick={() => navigator.clipboard.writeText(bezierString)}
          className="text-[10px] text-muted-foreground/50 transition-colors hover:text-foreground"
        >
          Copy
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((preset) => {
          const isActive =
            preset.value[0] === x1 &&
            preset.value[1] === y1 &&
            preset.value[2] === x2 &&
            preset.value[3] === y2
          return (
            <button
              key={preset.label}
              onClick={() => onChange(preset.value)}
              className={cn(
                "rounded-none border px-2 py-0.5 text-[10px] font-mono transition-colors",
                isActive
                  ? "border-foreground/30 bg-accent/40 text-foreground"
                  : "border-border/40 text-muted-foreground/60 hover:border-border/70 hover:text-muted-foreground"
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
