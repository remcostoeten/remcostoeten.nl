"use client"

import { Label } from "@/components/ui/label"
import type { BehaviorOption } from "./types"
import { StringControl } from "./prop-controls/string-control"
import { BooleanControl } from "./prop-controls/boolean-control"
import { EnumControl } from "./prop-controls/enum-control"
import { NumberControl } from "./prop-controls/number-control"

interface BehaviorEditorProps {
  schema: BehaviorOption[]
  behaviorValues: Record<string, unknown>
  propValues: Record<string, unknown>
  onChange: (name: string, value: unknown) => void
}

function isBehaviorVisible(
  behavior: BehaviorOption,
  behaviorValues: Record<string, unknown>,
  propValues: Record<string, unknown>
): boolean {
  if (!behavior.dependsOn) return true

  const source = behavior.dependsOn.source ?? "behavior"
  const values = source === "prop" ? propValues : behaviorValues
  const depValue = values[behavior.dependsOn.behavior]

  if ("notValue" in behavior.dependsOn && behavior.dependsOn.notValue !== undefined) {
    return depValue !== behavior.dependsOn.notValue
  }

  if ("value" in behavior.dependsOn && behavior.dependsOn.value !== undefined) {
    return depValue === behavior.dependsOn.value
  }

  return true
}

function BehaviorControl({
  schema,
  value,
  onChange,
}: {
  schema: BehaviorOption
  value: unknown
  onChange: (value: unknown) => void
}) {
  switch (schema.type) {
    case "string":
      return (
        <StringControl
          value={(value as string) ?? schema.defaultValue}
          onChange={onChange}
          placeholder={"placeholder" in schema ? schema.placeholder : undefined}
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
          options={schema.options ?? []}
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
    default:
      return null
  }
}

export function BehaviorEditor({
  schema,
  behaviorValues,
  propValues,
  onChange,
}: BehaviorEditorProps) {
  const visibleBehaviors = schema.filter((b) =>
    isBehaviorVisible(b, behaviorValues, propValues)
  )

  return (
    <div className="flex flex-col gap-5 p-4">
      {visibleBehaviors.length === 0 && (
        <p className="text-sm text-muted-foreground/50">
          No behaviors configured for this component.
        </p>
      )}
      {visibleBehaviors.map((behavior) => (
        <div
          key={behavior.name}
          className="flex flex-col gap-1.5 animate-slide-up-fade"
        >
          <Label className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
            {behavior.label}
          </Label>
          {behavior.description && (
            <p className="text-[11px] leading-relaxed text-muted-foreground/50">
              {behavior.description}
            </p>
          )}
          <BehaviorControl
            schema={behavior}
            value={behaviorValues[behavior.name]}
            onChange={(v) => onChange(behavior.name, v)}
          />
        </div>
      ))}
    </div>
  )
}
