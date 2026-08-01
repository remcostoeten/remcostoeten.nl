import { createPackageFiles } from './convert-collection'
import { createZip } from './create-zip'
import type { SvgItem } from '../types/svg-converter'

export function createIconPackage(items: SvgItem[]): Blob {
	return createZip(createPackageFiles(items))
}

export function createIndividualZip(
	items: SvgItem[],
	generate: (item: SvgItem) => string
): Blob {
	return createZip(
		Object.fromEntries(
			items
				.filter(item => item.state !== 'invalid')
				.map(item => [item.filename, generate(item)])
		)
	)
}
