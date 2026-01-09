'use client'

import { Mail } from "lucide-react"

export function ContactButton({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="mailto:contact@remcostoeten.nl"
      className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-border/30 hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 hover:scale-105"
    >
      <Mail className="w-4 h-4 text-foreground/70 group-hover:text-accent transition-colors" />
      <span className="text-foreground/80 group-hover:text-accent font-medium transition-colors">
        {children}
      </span>
    </a>
  )
}