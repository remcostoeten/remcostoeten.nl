"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import type { AnimationDirection, AnimationFillMode } from "../types"

interface AnimationExportProps {
  name: string
  keyframes: Record<string, Record<string, string>>
  bezierValue: [number, number, number, number]
  duration: number
  iterationCount: string | number
  direction: AnimationDirection
  fillMode: AnimationFillMode
  delayBetweenMs: number
  repeatCount: number
}

export function AnimationExport({
  name,
  keyframes,
  bezierValue,
  duration,
  iterationCount,
  direction,
  fillMode,
  delayBetweenMs,
  repeatCount,
}: AnimationExportProps) {
  const [x1, y1, x2, y2] = bezierValue

  const effectiveIterCount = repeatCount > 0 ? repeatCount : iterationCount
  const iterStr =
    effectiveIterCount === "infinite" ? "infinite" : String(effectiveIterCount)

  const buildAnimShorthand = () => {
    const parts = [name, `${duration}ms`, `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`]
    if (delayBetweenMs > 0) parts.push(`${delayBetweenMs}ms`)
    if (iterStr !== "1") parts.push(iterStr)
    if (direction !== "normal") parts.push(direction)
    if (fillMode !== "none") parts.push(fillMode)
    return parts.join(" ")
  }

  const cssOutput = useMemo(() => {
    const frames = Object.entries(keyframes)
      .map(
        ([offset, props]) =>
          `  ${offset} {\n${Object.entries(props)
            .map(([k, v]) => `    ${k}: ${v};`)
            .join("\n")}\n  }`
      )
      .join("\n")

    return `@keyframes ${name} {\n${frames}\n}\n\n.animate-${name} {\n  animation: ${buildAnimShorthand()};\n}`
  }, [name, keyframes, x1, y1, x2, y2, duration, iterStr, direction, fillMode, delayBetweenMs])

  const tailwindOutput = useMemo(() => {
    const kfEntries = Object.entries(keyframes)
      .map(
        ([offset, props]) =>
          `        '${offset}': {\n${Object.entries(props)
            .map(([k, v]) => `          ${k}: '${v}',`)
            .join("\n")}\n        },`
      )
      .join("\n")

    return `// tailwind.config.ts \u2192 theme.extend\nkeyframes: {\n  '${name}': {\n${kfEntries}\n  },\n},\nanimation: {\n  '${name}': '${buildAnimShorthand()}',\n},`
  }, [name, keyframes, x1, y1, x2, y2, duration, iterStr, direction, fillMode, delayBetweenMs])

  const reactOutput = useMemo(() => {
    return `// React inline style\nconst style: React.CSSProperties = {\n  animation: '${buildAnimShorthand()}',\n};`
  }, [name, duration, x1, y1, x2, y2, iterStr, direction, fillMode, delayBetweenMs])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast("Copied to clipboard")
  }

  return (
    <div className="flex flex-col gap-4">
      <ExportBlock label="CSS" content={cssOutput} onCopy={() => copy(cssOutput)} />
      <ExportBlock label="Tailwind Config" content={tailwindOutput} onCopy={() => copy(tailwindOutput)} />
      <ExportBlock label="React Inline" content={reactOutput} onCopy={() => copy(reactOutput)} />
    </div>
  )
}

function ExportBlock({
  label,
  content,
  onCopy,
}: {
  label: string
  content: string
  onCopy: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-none"
          onClick={onCopy}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      <pre className="max-h-48 overflow-auto border border-border/40 bg-card/10 p-3 text-[11px] font-mono leading-relaxed text-muted-foreground/80">
        {content}
      </pre>
    </div>
  )
}
