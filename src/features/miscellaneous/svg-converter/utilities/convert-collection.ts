import { generateComponent } from './convert-svg'
import { createRegistry } from './create-registry'
import type { SvgItem } from '../types/svg-converter'

export const SHARED_TYPE = `export type IconProps = ComponentPropsWithRef<"svg"> & {\n\tlabel?: string;\n\tsize?: number | string;\n};`

export function generateCombined(items: SvgItem[], registry = false): string {
	const valid = items.filter(item => item.state !== 'invalid')
	const components = valid.map(item =>
		generateComponent(item, { sharedType: true })
	)
	return `import type { ComponentPropsWithRef } from "react";\n\n${SHARED_TYPE}\n\n${components.join('\n\n')}${registry ? `\n\n${createRegistry(valid)}` : ''}\n`
}

export function createPackageFiles(items: SvgItem[]): Record<string, string> {
	const valid = items.filter(item => item.state !== 'invalid')
	const files: Record<string, string> = {
		'icons/types.ts': `import type { ComponentPropsWithRef } from "react";\n\n${SHARED_TYPE}\n`
	}
	for (const item of valid)
		files[`icons/${item.filename}`] =
			`${generateComponent(item, { sharedType: true, typeImport: './types' })}\n`
	const exports = [...valid]
		.sort((a, b) => a.component.localeCompare(b.component))
		.map(
			item =>
				`export { ${item.component} } from "./${item.filename.replace(/\.tsx$/, '')}";`
		)
	files['icons/index.ts'] =
		`${exports.join('\n')}\n\nexport type { IconProps } from "./types";\n`
	return files
}
