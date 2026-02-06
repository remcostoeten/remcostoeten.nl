import type { RegistryEntry, PlaygroundCategory, CategoryMeta } from './types'
import { Palette } from 'lucide-react'

const entries: RegistryEntry[] = []

export const CATEGORY_META: Record<PlaygroundCategory, CategoryMeta> = {
    ui: { label: 'UI', icon: Palette },
}

export function register(entry: RegistryEntry): void {
    entries.push(entry)
}

export function registerMany(items: RegistryEntry[]): void {
    for (const item of items) {
        entries.push(item)
    }
}

export function getAll(): RegistryEntry[] {
    return [...entries]
}

export function getByCategory(category: PlaygroundCategory): RegistryEntry[] {
    return entries.filter(function filterByCategory(e) {
        return e.category === category
    })
}

export function getById(id: string): RegistryEntry | undefined {
    return entries.find(function findById(e) {
        return e.id === id
    })
}

export function getEnabled(enabledIds: Record<string, boolean>): RegistryEntry[] {
    return entries.filter(function filterEnabled(e) {
        return enabledIds[e.id] === true
    })
}

export function getCounts(): Record<PlaygroundCategory | 'all', number> {
    return {
        all: entries.length,
        ui: getByCategory('ui').length,
    }
}
