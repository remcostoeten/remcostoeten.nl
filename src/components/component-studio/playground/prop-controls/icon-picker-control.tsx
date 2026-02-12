"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getIconByKey, getIconKeys } from "@/components/component-studio/lib/icons"
import { cn } from "@/lib/utils"

interface IconPickerControlProps {
  value: string | null
  onChange: (value: string | null) => void
}

export function IconPickerControl({ value, onChange }: IconPickerControlProps) {
  const [open, setOpen] = useState(false)
  const icons = getIconKeys()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 w-full justify-start rounded-none border-border/50 bg-card/20 text-sm font-normal"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center">
                {getIconByKey(value)}
              </span>
              <span className="font-mono text-xs">{value}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">None</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 rounded-none border-border/50 bg-card p-2"
        align="start"
      >
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className={cn(
              "flex h-10 w-full items-center justify-center rounded-none border border-transparent text-xs text-muted-foreground transition-colors hover:bg-accent/40",
              value === null && "border-border/50 bg-accent/20"
            )}
          >
            None
          </button>
          {icons.map((key) => (
            <button
              key={key}
              onClick={() => {
                onChange(key)
                setOpen(false)
              }}
              className={cn(
                "group flex h-10 w-full items-center justify-center rounded-none border border-transparent transition-colors hover:bg-accent/40",
                value === key && "border-border/50 bg-accent/20"
              )}
              title={key}
            >
              {getIconByKey(key)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
