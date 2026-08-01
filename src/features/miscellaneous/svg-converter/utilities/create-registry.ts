import { registryKey } from './format-name'
import type { SvgItem } from '../types/svg-converter'

export function createRegistry(items: SvgItem[]): string {
	const used = new Set<string>()
	const entries = items
		.filter(item => item.state !== 'invalid')
		.map(item => {
			const base = registryKey(item.component)
			let key = base
			let suffix = 2
			while (used.has(key)) key = `${base}-${suffix++}`
			used.add(key)
			return `\t${JSON.stringify(key)}: ${item.component},`
		})
	return `export const icons = {\n${entries.join('\n')}\n} as const;\n\nexport type IconName = keyof typeof icons;`
}
