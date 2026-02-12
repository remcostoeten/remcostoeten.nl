"use client"

import { Switch } from "@/components/ui/switch"

interface BooleanControlProps {
  value: boolean
  onChange: (value: boolean) => void
}

export function BooleanControl({ value, onChange }: BooleanControlProps) {
  return (
    <Switch
      checked={value}
      onCheckedChange={onChange}
    />
  )
}
