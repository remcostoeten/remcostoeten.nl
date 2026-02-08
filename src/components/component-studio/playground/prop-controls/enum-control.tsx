"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EnumControlProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

export function EnumControl({ value, onChange, options }: EnumControlProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 rounded-none border-border/50 bg-card/20 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-none border-border/50 bg-card">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-sm">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
