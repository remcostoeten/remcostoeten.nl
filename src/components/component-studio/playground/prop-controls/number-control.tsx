"use client"

import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

interface NumberControlProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function NumberControl({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: NumberControlProps) {
  return (
    <div className="flex items-center gap-3">
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="flex-1"
      />
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value)
          if (!isNaN(parsed)) onChange(Math.min(max, Math.max(min, parsed)))
        }}
        min={min}
        max={max}
        step={step}
        className="h-8 w-20 rounded-none border-border/50 bg-card/20 text-sm font-mono"
      />
    </div>
  )
}
