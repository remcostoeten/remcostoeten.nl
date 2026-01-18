import { registerMany } from '../registry'
import { uiEntries } from './ui'
import { snippetEntries } from './snippets'
import { packageEntries } from './packages'
import { cliEntries } from './cli'

export function initializeRegistry(): void {
    registerMany(uiEntries)
    registerMany(snippetEntries)
    registerMany(packageEntries)
    registerMany(cliEntries)
}

export { uiEntries } from './ui'
export { snippetEntries } from './snippets'
export { packageEntries } from './packages'
export { cliEntries } from './cli'
