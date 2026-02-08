"use client"

import { useMemo, useState, useCallback } from "react"
import { Check, Copy, Clipboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ComponentRegistration } from "./types"
import { cn } from "@/lib/utils"
import { generateComponentJsx } from "@/components/component-studio/lib/jsx-utils"

interface CodeExportPanelProps {
  registration: ComponentRegistration
  props: Record<string, unknown>
  behaviors: Record<string, unknown>
}



function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [text])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-500">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>{label}</span>
        </>
      )}
    </Button>
  )
}

import Prism from "prismjs"
import "prismjs/components/prism-jsx"
import "prismjs/themes/prism-tomorrow.css" // or another dark theme

function CodeBlock({ code, className }: { code: string; className?: string }) {
  const highlightedCode = useMemo(() => {
    return Prism.highlight(code, Prism.languages.jsx, "jsx")
  }, [code])

  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-none border border-border/40 bg-[#2d2d2d] p-3 text-[13px] leading-relaxed",
        className
      )}
    >
      <code
        className="font-mono text-white/90"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </pre>
  )
}

export function CodeExportPanel({
  registration,
  props,
  behaviors,
}: CodeExportPanelProps) {
  // Generate the configured usage JSX
  const configuredCode = useMemo(() => {
    return generateComponentJsx(registration.name, props, behaviors, registration)
  }, [registration, props, behaviors])

  // Generate the base component usage
  const baseCode = useMemo(() => {
    const componentName = registration.name
    const requiredProps = registration.props.filter(p => p.required)

    if (requiredProps.length === 0) {
      return `import { ${componentName} } from "@/components/ui/${registration.slug}"\n\n<${componentName} />`
    }

    const propsStr = requiredProps
      .map(p => {
        if (p.type === "string") {
          return `${p.name}="..."`
        }
        return `${p.name}={...}`
      })
      .join(" ")

    return `import { ${componentName} } from "@/components/ui/${registration.slug}"\n\n<${componentName} ${propsStr} />`
  }, [registration])

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Configured Usage */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
            Current Configuration
          </h3>
          <CopyButton text={configuredCode} label="Copy" />
        </div>
        <CodeBlock code={configuredCode} />
        <p className="text-[11px] leading-relaxed text-muted-foreground/50">
          Shows props that differ from defaults. Update props to see changes here.
        </p>
      </section>

      {/* Base Component */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
            Base Component
          </h3>
          <CopyButton text={baseCode} label="Copy" />
        </div>
        <CodeBlock code={baseCode} />
        <p className="text-[11px] leading-relaxed text-muted-foreground/50">
          Minimal usage with import statement.
        </p>
      </section>
    </div>
  )
}
