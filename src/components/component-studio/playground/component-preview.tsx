"use client"

import React, { useMemo } from "react"
import { Separator } from "@/components/ui/separator"
import type { ComponentRegistration } from "./types"
import { getIconByKey } from "@/components/component-studio/lib/icons"

interface ComponentPreviewProps {
  registration: ComponentRegistration
  props: Record<string, unknown>
  behaviors: Record<string, unknown>
  animationStyle?: React.CSSProperties
  animationKeyframesCSS?: string
}

export function ComponentPreview({
  registration,
  props,
  behaviors,
  animationStyle,
  animationKeyframesCSS,
}: ComponentPreviewProps) {
  const Component = registration.component
  const Extras = registration.previewExtras

  const resolvedProps = useMemo(() => {
    const merged = { ...props, ...behaviors }
    if (merged.icon && typeof merged.icon === "string") {
      merged.icon = getIconByKey(merged.icon as string)
    }
    return merged
  }, [props, behaviors])

  const variantProp = registration.props.find(
    (p) => p.name === "variant" && p.type === "enum"
  )

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      {Extras && <Extras />}
      {animationKeyframesCSS && (
        <style dangerouslySetInnerHTML={{ __html: animationKeyframesCSS }} />
      )}

      <div className="flex flex-col items-center gap-3" style={animationStyle}>
        <Component {...resolvedProps} />
      </div>

      {variantProp && variantProp.type === "enum" && (
        <>
          <Separator className="bg-border/20" />
          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/40">
              All Variants
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {variantProp.options.map((opt) => {
                const variantProps = {
                  ...resolvedProps,
                  variant: opt.value,
                  animate: false,
                }
                return <Component key={opt.value} {...variantProps} />
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
