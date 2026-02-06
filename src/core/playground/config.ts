export type PlaygroundConfig = {
    enabled: Record<string, boolean>
}

export const PLAYGROUND_CONFIG: PlaygroundConfig = {
    enabled: {
        'copy-button': true,
        'gooey-switch': true,
    },
}

export function isEnabled(id: string): boolean {
    return PLAYGROUND_CONFIG.enabled[id] === true
}

export function getEnabledIds(): string[] {
    return Object.entries(PLAYGROUND_CONFIG.enabled)
        .filter(function filterEnabled([, value]) {
            return value === true
        })
        .map(function extractId([id]) {
            return id
        })
}
