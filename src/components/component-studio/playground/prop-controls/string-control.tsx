"use client"

import { Input } from "@/components/ui/input"

interface StringControlProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function StringControl({ value, onChange, placeholder }: StringControlProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-8 rounded-none border-border/50 bg-card/20 text-sm font-mono"
    />
  )
}
