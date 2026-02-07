import { registerMany } from '../registry'
import { uiEntries } from './ui'

export function initializeRegistry(): void {
	registerMany(uiEntries)
}

export { uiEntries } from './ui'
