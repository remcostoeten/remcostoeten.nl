"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, X } from "lucide-react"

interface KeyframeEditorProps {
  offset: string
  properties: Record<string, string>
  canDelete: boolean
  onChange: (property: string, value: string) => void
  onAddProperty: (property: string, value: string) => void
  onRemoveKeyframe: () => void
}

export function KeyframeEditor({
  offset,
  properties,
  canDelete,
  onChange,
  onAddProperty,
  onRemoveKeyframe,
}: KeyframeEditorProps) {
  const [newProp, setNewProp] = useState("")
  const [newValue, setNewValue] = useState("")

  const handleAdd = () => {
    if (newProp.trim() && newValue.trim()) {
      onAddProperty(newProp.trim(), newValue.trim())
      setNewProp("")
      setNewValue("")
    }
  }

  return (
    <div className="flex flex-col gap-3 border border-border/40 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          Keyframe: {offset}
        </span>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-none text-destructive/60 hover:text-destructive"
            onClick={onRemoveKeyframe}
            title="Remove keyframe"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {Object.entries(properties).map(([prop, value]) => (
          <div key={prop} className="flex items-center gap-2">
            <Label className="min-w-[80px] text-[10px] font-mono text-muted-foreground/60">
              {prop}
            </Label>
            <Input
              type="text"
              value={value}
              onChange={(e) => onChange(prop, e.target.value)}
              className="h-7 flex-1 rounded-none border-border/40 bg-card/10 text-[11px] font-mono"
            />
          </div>
        ))}
      </div>

      {/* Add new property */}
      <div className="flex items-center gap-1.5 border-t border-border/20 pt-2">
        <Input
          type="text"
          value={newProp}
          onChange={(e) => setNewProp(e.target.value)}
          placeholder="property"
          className="h-6 flex-1 rounded-none border-border/30 bg-card/5 text-[10px] font-mono"
        />
        <Input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="value"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="h-6 flex-1 rounded-none border-border/30 bg-card/5 text-[10px] font-mono"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-none"
          onClick={handleAdd}
          disabled={!newProp.trim() || !newValue.trim()}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

// Standalone "Add Keyframe" component
interface AddKeyframeProps {
  onAdd: (offset: string, properties: Record<string, string>) => void
}

export function AddKeyframeButton({ onAdd }: AddKeyframeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [offset, setOffset] = useState("")
  const [property, setProperty] = useState("opacity")
  const [value, setValue] = useState("1")

  const handleAdd = () => {
    const pct = parseInt(offset, 10)
    if (isNaN(pct) || pct < 0 || pct > 100) return
    onAdd(`${pct}%`, { [property]: value })
    setIsOpen(false)
    setOffset("")
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        className="h-7 w-full gap-1.5 rounded-none border-border/40 border-dashed text-[10px] text-muted-foreground/60"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-3 w-3" />
        Add Keyframe
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2 border border-border/40 border-dashed p-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          New Keyframe
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-none"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          value={offset}
          onChange={(e) => setOffset(e.target.value)}
          placeholder="0-100"
          min={0}
          max={100}
          className="h-6 w-16 rounded-none border-border/30 bg-card/5 text-[10px] font-mono"
        />
        <span className="text-[10px] text-muted-foreground/40">%</span>
        <Input
          type="text"
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          placeholder="property"
          className="h-6 flex-1 rounded-none border-border/30 bg-card/5 text-[10px] font-mono"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="value"
          className="h-6 flex-1 rounded-none border-border/30 bg-card/5 text-[10px] font-mono"
        />
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-none border-border/40"
          onClick={handleAdd}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
