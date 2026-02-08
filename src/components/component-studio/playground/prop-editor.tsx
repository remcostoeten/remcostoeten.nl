"use client"

import { Label } from "@/components/ui/label"
import type { PropSchema } from "./types"
import { StringControl } from "./prop-controls/string-control"
import { BooleanControl } from "./prop-controls/boolean-control"
import { EnumControl } from "./prop-controls/enum-control"
import { NumberControl } from "./prop-controls/number-control"
import { IconPickerControl } from "./prop-controls/icon-picker-control"

interface PropEditorProps {
  schema: PropSchema[]
  values: Record<string, unknown>
  onChange: (name: string, value: unknown) => void
}

function PropControl({
  schema,
  value,
  onChange,
}: {
  schema: PropSchema
  value: unknown
  onChange: (value: unknown) => void
}) {
  switch (schema.type) {
    case "string":
      return (
        <StringControl
          value={(value as string) ?? schema.defaultValue}
          onChange={onChange}
          placeholder={schema.placeholder}
        />
      )
    case "boolean":
      return (
        <BooleanControl
          value={(value as boolean) ?? schema.defaultValue}
          onChange={onChange}
        />
      )
    case "enum":
      return (
        <EnumControl
          value={(value as string) ?? schema.defaultValue}
          onChange={onChange}
          options={schema.options}
        />
      )
    case "number":
      return (
        <NumberControl
          value={(value as number) ?? schema.defaultValue}
          onChange={onChange}
          min={schema.min}
          max={schema.max}
          step={schema.step}
        />
      )
    case "icon":
      return (
        <IconPickerControl
          value={(value as string | null) ?? schema.defaultValue}
          onChange={onChange}
        />
      )
    default:
      return null
  }
}

export function PropEditor({ schema, values, onChange }: PropEditorProps) {
  return (
    <div className="flex flex-col gap-5 p-4">
      {schema.map((prop) => (
        <div key={prop.name} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
              {prop.label}
            </Label>
            {prop.required && (
              <span className="text-[9px] text-destructive">required</span>
            )}
          </div>
          {prop.description && (
            <p className="text-[11px] leading-relaxed text-muted-foreground/50">
              {prop.description}
            </p>
          )}
          <PropControl
            schema={prop}
            value={values[prop.name]}
            onChange={(v) => onChange(prop.name, v)}
          />
        </div>
      ))}
    </div>
  )
}
