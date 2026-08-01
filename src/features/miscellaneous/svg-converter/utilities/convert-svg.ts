import { convertAttribute } from './convert-attributes'
import { isBlackLike, normalizeColor } from './detect-colors'
import { registryKey } from './format-name'
import { rewriteIds } from './rewrite-ids'
import type { ConversionSettings, SvgItem } from '../types/svg-converter'

type GenerateOptions = {
	sharedType?: boolean
	typeImport?: string
}

const COLOR_ATTRIBUTES = new Set([
	'fill',
	'stroke',
	'stop-color',
	'flood-color',
	'color'
])

function transformColors(root: Element, settings: ConversionSettings) {
	for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
		for (const attribute of Array.from(element.attributes)) {
			if (COLOR_ATTRIBUTES.has(attribute.name.toLowerCase())) {
				const selected =
					settings.replacePrimary &&
					settings.primaryColor &&
					normalizeColor(attribute.value) ===
						normalizeColor(settings.primaryColor)
				if (
					selected ||
					(settings.replaceBlack && isBlackLike(attribute.value))
				)
					element.setAttribute(attribute.name, 'currentColor')
			}
			if (attribute.name.toLowerCase() === 'style') {
				const replaced = attribute.value
					.split(';')
					.map(part => {
						const separator = part.indexOf(':')
						if (separator < 0) return part
						const property = part
							.slice(0, separator)
							.trim()
							.toLowerCase()
						const value = part.slice(separator + 1).trim()
						if (!COLOR_ATTRIBUTES.has(property)) return part
						const selected =
							settings.replacePrimary &&
							settings.primaryColor &&
							normalizeColor(value) ===
								normalizeColor(settings.primaryColor)
						return selected ||
							(settings.replaceBlack && isBlackLike(value))
							? `${part.slice(0, separator)}:currentColor`
							: part
					})
					.join(';')
				element.setAttribute(attribute.name, replaced)
			}
		}
	}
}

function optimizeNumbers(root: Element, settings: ConversionSettings) {
	if (!settings.optimizePrecision || settings.preserveDecimalPrecision) return
	const number = /-?(?:\d+\.\d+|\.\d+)(?:e[-+]?\d+)?/gi
	for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
		for (const attribute of Array.from(element.attributes)) {
			if (
				!/^(?:d|points|transform|x|y|x1|x2|y1|y2|cx|cy|r|rx|ry|width|height|offset)$/i.test(
					attribute.name
				)
			)
				continue
			element.setAttribute(
				attribute.name,
				attribute.value.replace(number, value =>
					String(Number(Number(value).toFixed(settings.precision)))
				)
			)
		}
	}
}

const METADATA_ATTRIBUTES = new Set([
	'xml:space',
	'enable-background',
	'baseprofile',
	'version'
])

function removeMetadata(root: Element) {
	for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
		for (const attribute of Array.from(element.attributes)) {
			const name = attribute.name.toLowerCase()
			if (name.startsWith('data-') || METADATA_ATTRIBUTES.has(name))
				element.removeAttribute(attribute.name)
		}
	}
}

const TAG_NAMES: Record<string, string> = {
	clippath: 'clipPath',
	lineargradient: 'linearGradient',
	radialgradient: 'radialGradient',
	fegaussianblur: 'feGaussianBlur',
	fecolormatrix: 'feColorMatrix',
	femergenode: 'feMergeNode',
	feoffset: 'feOffset',
	feblend: 'feBlend',
	femerge: 'feMerge',
	feflood: 'feFlood',
	fecomposite: 'feComposite'
}

function svgTagName(value: string): string {
	return TAG_NAMES[value.toLowerCase()] ?? value.toLowerCase()
}

function textExpression(value: string): string {
	return `{${JSON.stringify(value)}}`
}

function serializeElement(element: Element, level: number): string {
	const indent = '\t'.repeat(level)
	const tag = svgTagName(element.tagName)
	const attributes = Array.from(element.attributes)
		.filter(attribute => !/^xmlns(?::|$)/i.test(attribute.name))
		.map(attribute => convertAttribute(attribute.name, attribute.value))
	const opening = attributes.length
		? `<${tag} ${attributes.join(' ')}>`
		: `<${tag}>`
	const children = Array.from(element.childNodes).filter(
		node =>
			node.nodeType === Node.ELEMENT_NODE ||
			(node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
	)
	if (children.length === 0) return `${indent}${opening.replace(/>$/, ' />')}`
	if (children.every(node => node.nodeType === Node.TEXT_NODE))
		return `${indent}${opening}${textExpression(
			children
				.map(node => node.textContent)
				.join('')
				.trim()
		)}</${tag}>`
	const body = children
		.map(node =>
			node.nodeType === Node.ELEMENT_NODE
				? serializeElement(node as Element, level + 1)
				: `${'\t'.repeat(level + 1)}${textExpression(node.textContent?.trim() ?? '')}`
		)
		.join('\n')
	return `${indent}${opening}\n${body}\n${indent}</${tag}>`
}

function controlledRootAttributes(item: SvgItem, root: Element): string[] {
	const settings = item.settings
	const attributes = [
		'{...props}',
		'ref={ref}',
		'xmlns="http://www.w3.org/2000/svg"'
	]
	for (const attribute of Array.from(root.attributes))
		attributes.push(convertAttribute(attribute.name, attribute.value))
	if (settings.removeDimensions)
		attributes.push('width={size}', 'height={size}')
	if (item.viewBox) attributes.push(`viewBox=${JSON.stringify(item.viewBox)}`)
	if (settings.preserveAspectRatio)
		attributes.push('preserveAspectRatio="xMidYMid meet"')
	if (settings.colorMode === 'fill') attributes.push('fill="currentColor"')
	else if (settings.colorMode === 'stroke')
		attributes.push('fill="none"', 'stroke="currentColor"')
	if (settings.includeLabel)
		attributes.push(
			'role={label ? "img" : undefined}',
			'aria-label={label}',
			'aria-hidden={label ? undefined : true}'
		)
	else if (settings.decorative) attributes.push('aria-hidden="true"')
	attributes.push('focusable="false"')
	return attributes
}

export function generateComponent(
	item: SvgItem,
	options: GenerateOptions = {}
): string {
	if (item.state === 'invalid') return ''
	const document = new DOMParser().parseFromString(
		item.markup,
		'image/svg+xml'
	)
	const root = document.documentElement
	if (!item.settings.preserveTitle)
		root.querySelectorAll('title').forEach(node => node.remove())
	if (!item.settings.preserveDesc)
		root.querySelectorAll('desc').forEach(node => node.remove())
	if (!item.settings.preserveIds && item.settings.prefixIds)
		rewriteIds(root, item.component)
	if (item.settings.removeMetadata) removeMetadata(root)
	transformColors(root, item.settings)
	optimizeNumbers(root, item.settings)
	if (item.settings.colorMode === 'fill')
		root.setAttribute('fill', 'currentColor')
	if (item.settings.colorMode === 'stroke') {
		root.setAttribute('fill', 'none')
		root.setAttribute('stroke', 'currentColor')
	}
	if (item.settings.removeDimensions) {
		root.removeAttribute('width')
		root.removeAttribute('height')
	}
	const controlledNames = [
		'viewBox',
		'preserveAspectRatio',
		'role',
		'aria-label',
		'aria-hidden',
		'focusable',
		'xmlns'
	]
	if (item.settings.colorMode !== 'preserve')
		controlledNames.push('fill', 'stroke')
	for (const name of controlledNames) root.removeAttribute(name)

	const typeName = options.sharedType ? 'IconProps' : 'props'
	const importLine = options.typeImport
		? `import type { IconProps } from ${JSON.stringify(options.typeImport)};`
		: options.sharedType
			? ''
			: 'import type { ComponentPropsWithRef } from "react";'
	const labelField = item.settings.includeLabel ? '\n\tlabel?: string;' : ''
	const typeDeclaration = options.sharedType
		? ''
		: `\ntype props = ComponentPropsWithRef<"svg"> & {${labelField}\n\tsize?: number | string;\n};\n`
	const rootAttributes = controlledRootAttributes(item, root)
		.map(attribute => `\t\t\t${attribute}`)
		.join('\n')
	const children = Array.from(root.childNodes)
		.filter(
			node =>
				node.nodeType === Node.ELEMENT_NODE ||
				(node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
		)
		.map(node =>
			node.nodeType === Node.ELEMENT_NODE
				? serializeElement(node as Element, 3)
				: `\t\t\t${textExpression(node.textContent?.trim() ?? '')}`
		)
		.join('\n')
	const labelBinding =
		item.settings.includeLabel || options.sharedType ? '\n\tlabel,' : ''
	const output =
		`${importLine}${typeDeclaration}\nexport function ${item.component}({\n\tref,${labelBinding}\n\tsize = ${JSON.stringify(item.settings.defaultSize)},\n\t...props\n}: ${typeName}) {\n\treturn (\n\t\t<svg\n${rootAttributes}\n\t\t>\n${children}\n\t\t</svg>\n\t);\n}\n`.trimStart()
	return item.settings.format
		? output
		: `${output.replace(/\s*\n\s*/g, ' ').trim()}\n`
}

export function idNamespaceFor(component: string): string {
	return registryKey(component)
}
