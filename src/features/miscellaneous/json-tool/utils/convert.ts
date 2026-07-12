import type { TConversion, TJsonValue } from '../types'

type TRecord = Record<string, TJsonValue>

function isRecord(value: TJsonValue): value is TRecord {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/

const YAML_PLAIN = /^[A-Za-z0-9_][A-Za-z0-9_ ./@-]*$/

function yamlScalar(value: TJsonValue): string {
	if (value === null) return 'null'
	if (typeof value === 'boolean' || typeof value === 'number') {
		return String(value)
	}
	const text = String(value)
	if (text === '' || !YAML_PLAIN.test(text)) return JSON.stringify(text)
	return text
}

function yamlLines(value: TJsonValue, depth: number): string[] {
	const pad = '  '.repeat(depth)

	if (Array.isArray(value)) {
		if (value.length === 0) return [`${pad}[]`]
		return value.flatMap(item => {
			if (Array.isArray(item) || isRecord(item)) {
				const nested = yamlLines(item, depth + 1)
				if (nested.length === 0) return [`${pad}- {}`]
				const [first, ...rest] = nested
				return [`${pad}- ${first.trim()}`, ...rest]
			}
			return [`${pad}- ${yamlScalar(item)}`]
		})
	}

	if (isRecord(value)) {
		const keys = Object.keys(value)
		if (keys.length === 0) return [`${pad}{}`]
		return keys.flatMap(key => {
			const child = value[key]
			if (Array.isArray(child) && child.length > 0) {
				return [`${pad}${key}:`, ...yamlLines(child, depth + 1)]
			}
			if (isRecord(child) && Object.keys(child).length > 0) {
				return [`${pad}${key}:`, ...yamlLines(child, depth + 1)]
			}
			if (Array.isArray(child)) return [`${pad}${key}: []`]
			if (isRecord(child)) return [`${pad}${key}: {}`]
			return [`${pad}${key}: ${yamlScalar(child)}`]
		})
	}

	return [`${pad}${yamlScalar(value)}`]
}

/**
 * @description Renders a JSON value as YAML. Block style, two-space indent.
 */
export function toYaml(value: TJsonValue): TConversion {
	return { ok: true, text: yamlLines(value, 0).join('\n') }
}

function csvCell(value: TJsonValue): string {
	const text =
		value === null
			? ''
			: typeof value === 'object'
				? JSON.stringify(value)
				: String(value)
	return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * @description Flattens an array of rows into CSV. Columns are the union of every
 * row's keys, in first-seen order; nested values land in the cell as JSON.
 */
export function toCsv(value: TJsonValue): TConversion {
	if (!Array.isArray(value)) {
		return {
			ok: false,
			error: 'CSV needs an array at the root — wrap your object in [ ].'
		}
	}
	if (value.length === 0) return { ok: true, text: '' }

	if (!value.some(isRecord)) {
		return { ok: true, text: value.map(csvCell).join('\n') }
	}

	const columns: string[] = []
	for (const row of value) {
		if (!isRecord(row)) continue
		for (const key of Object.keys(row)) {
			if (!columns.includes(key)) columns.push(key)
		}
	}

	const lines = [columns.map(column => csvCell(column)).join(',')]
	for (const row of value) {
		const record = isRecord(row) ? row : ({ [columns[0]]: row } as TRecord)
		lines.push(
			columns
				.map(column =>
					column in record ? csvCell(record[column]) : ''
				)
				.join(',')
		)
	}

	return { ok: true, text: lines.join('\n') }
}

function unionOf(types: string[]): string {
	const unique = types.filter((type, index) => types.indexOf(type) === index)
	if (unique.length === 0) return 'unknown'
	return unique.join(' | ')
}

function describe(value: TJsonValue, depth: number): string {
	if (value === null) return 'null'
	if (typeof value === 'boolean') return 'boolean'
	if (typeof value === 'number') return 'number'
	if (typeof value === 'string') return 'string'

	if (Array.isArray(value)) {
		if (value.length === 0) return 'unknown[]'

		if (value.every(isRecord)) {
			return `${describeMerged(value, depth)}[]`
		}

		const member = unionOf(value.map(item => describe(item, depth)))
		return member.includes(' | ') ? `(${member})[]` : `${member}[]`
	}

	return describeMerged([value], depth)
}

function describeMerged(records: TRecord[], depth: number): string {
	const pad = '\t'.repeat(depth + 1)
	const closing = '\t'.repeat(depth)

	const keys: string[] = []
	for (const record of records) {
		for (const key of Object.keys(record)) {
			if (!keys.includes(key)) keys.push(key)
		}
	}
	if (keys.length === 0) return 'Record<string, unknown>'

	const fields = keys.map(key => {
		const present = records.filter(record => key in record)
		const optional = present.length < records.length ? '?' : ''
		const type = unionOf(
			present.map(record => describe(record[key], depth + 1))
		)
		const name = IDENTIFIER.test(key) ? key : JSON.stringify(key)
		return `${pad}${name}${optional}: ${type}`
	})

	return `{\n${fields.join('\n')}\n${closing}}`
}

/**
 * @description Infers a TypeScript type from a JSON value. Object arrays are merged
 * into a single shape, with keys missing from some elements marked optional.
 */
export function toTypeScript(value: TJsonValue, typeName: string): TConversion {
	const name = IDENTIFIER.test(typeName) ? typeName : 'TRoot'
	return { ok: true, text: `type ${name} = ${describe(value, 0)}` }
}
