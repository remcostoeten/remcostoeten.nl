"use client"

import React, { useRef } from "react"
import { cn } from "@/lib/utils"
import { useIdleDetection } from "@/hooks/use-idle-detection"

type PillVariant = "default" | "outline" | "ghost" | "glow"

type Props = {
  icon?: React.ReactNode
  text: string
  className?: string
  animate?: boolean
  variant?: PillVariant
  ghostBehavior?: "always" | "idle" | "never"
  ghostIdleMs?: number
  href?: string
  linkTarget?: "_self" | "_blank"
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">

const VARIANT_STYLES: Record<PillVariant, string> = {
  default:
    "bg-accent/60 text-foreground shadow-sm shadow-black/[.08] border border-border/50 hover:bg-accent/90",
  outline:
    "bg-transparent text-foreground border border-border hover:border-foreground/20 hover:bg-accent/30",
  ghost:
    "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/40",
  glow: "bg-accent/60 text-foreground border border-border/50 shadow-[0_0_12px_-3px_hsl(var(--foreground)/0.15)] hover:shadow-[0_0_20px_-3px_hsl(var(--foreground)/0.25)]",
}

export function HeroPill({
  icon,
  text,
  className,
  animate = true,
  variant = "default",
  ghostBehavior = "never",
  ghostIdleMs = 3000,
  href,
  linkTarget = "_self",
  ...props
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isIdle = useIdleDetection(ref, ghostIdleMs, ghostBehavior === "idle")

  const effectiveVariant: PillVariant =
    variant === "ghost" && ghostBehavior === "always"
      ? "ghost"
      : variant === "ghost" && ghostBehavior === "idle" && isIdle
        ? "ghost"
        : variant

  const content = (
    <p
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-all duration-500 ease-out cursor-default",
        VARIANT_STYLES[effectiveVariant]
      )}
    >
      {icon && (
        <span className="mr-2 flex shrink-0 items-center border-r border-border/60 pr-2 transition-colors duration-300 group-hover:border-foreground/20">
          {icon}
        </span>
      )}
      {text}
    </p>
  )

  const wrapped = href ? (
    <a
      href={href}
      target={linkTarget}
      rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}
      className="inline-flex cursor-pointer"
    >
      {content}
    </a>
  ) : (
    content
  )

  return (
    <div
      ref={ref}
      className={cn("group", animate && "animate-slide-up-fade", className)}
      {...props}
    >
      {wrapped}
    </div>
  )
}
