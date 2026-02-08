import type { PropSchema, BehaviorOption } from "@/components/component-studio/playground/types"

export function formatPropValue(value: unknown, propType: PropSchema["type"] | "behavior"): string {
    if (value === null || value === undefined) return "null"

    if (typeof value === "string") {
        return `"${value}"`
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false"
    }
    if (typeof value === "number") {
        return String(value)
    }
    return JSON.stringify(value)
}

function isDefaultValue(
    value: unknown,
    schema: PropSchema | BehaviorOption | undefined
): boolean {
    if (!schema) return false
    return value === schema.defaultValue
}

export function generateComponentJsx(
    componentName: string,
    props: Record<string, unknown>,
    behaviors: Record<string, unknown>,
    registration: { props: PropSchema[]; behaviors?: BehaviorOption[] }
): string {
    const propEntries: string[] = []

    // Add props that differ from defaults
    for (const propSchema of registration.props) {
        const value = props[propSchema.name]
        if (!isDefaultValue(value, propSchema) && value !== "" && value !== null) {
            const formattedValue = formatPropValue(value, propSchema.type)

            // For booleans that are true, use shorthand
            if (propSchema.type === "boolean" && value === true) {
                propEntries.push(`  ${propSchema.name}`)
            } else if (propSchema.type === "string") {
                propEntries.push(`  ${propSchema.name}=${formattedValue}`)
            } else {
                propEntries.push(`  ${propSchema.name}={${formattedValue}}`)
            }
        }
    }

    // Add behaviors that differ from defaults
    for (const behaviorSchema of registration.behaviors ?? []) {
        const value = behaviors[behaviorSchema.name]
        if (!isDefaultValue(value, behaviorSchema) && value !== "" && value !== null) {
            const formattedValue = formatPropValue(value, "behavior")

            if (behaviorSchema.type === "boolean" && value === true) {
                propEntries.push(`  ${behaviorSchema.name}`)
            } else if (behaviorSchema.type === "string") {
                propEntries.push(`  ${behaviorSchema.name}=${formattedValue}`)
            } else {
                propEntries.push(`  ${behaviorSchema.name}={${formattedValue}}`)
            }
        }
    }

    // Always include required props
    for (const propSchema of registration.props) {
        if (propSchema.required) {
            const value = props[propSchema.name]
            if (value === undefined) continue // Skip if required prop is missing (shouldn't happen in playground)

            const formattedValue = formatPropValue(value, propSchema.type)
            const propLine =
                propSchema.type === "string"
                    ? `  ${propSchema.name}=${formattedValue}`
                    : `  ${propSchema.name}={${formattedValue}}`

            if (!propEntries.some((p) => p.trim().startsWith(propSchema.name))) {
                propEntries.unshift(propLine)
            }
        }
    }

    if (propEntries.length === 0) {
        return `<${componentName} />`
    }

    if (propEntries.length === 1) {
        const prop = propEntries[0].trim()
        return `<${componentName} ${prop} />`
    }

    return `<${componentName}\n${propEntries.join("\n")}\n/>`
}
