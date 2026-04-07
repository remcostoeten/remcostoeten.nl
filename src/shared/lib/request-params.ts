const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const INTEGER_PATTERN = /^-?\d+$/

type IntParamOptions = {
	defaultValue: number
	min: number
	max: number
}

export function parseBoundedIntParam(
	value: string | null,
	{ defaultValue, min, max }: IntParamOptions
) {
	if (value == null || value.trim() === '') {
		return defaultValue
	}

	const normalizedValue = value.trim()
	if (!INTEGER_PATTERN.test(normalizedValue)) return defaultValue

	const parsed = Number.parseInt(normalizedValue, 10)
	return Math.min(max, Math.max(min, parsed))
}

export function parseStrictIsoDateParam(value: string | null) {
	if (!value || !ISO_DATE_PATTERN.test(value)) return null

	const parsed = new Date(`${value}T00:00:00.000Z`)
	if (Number.isNaN(parsed.getTime())) return null
	if (parsed.toISOString().slice(0, 10) !== value) return null

	return value
}

export function parseYearParam(
	value: string | null,
	{ defaultValue, min, max }: IntParamOptions
) {
	if (value == null || value.trim() === '') {
		return defaultValue
	}

	const normalizedValue = value.trim()
	if (!INTEGER_PATTERN.test(normalizedValue)) return null

	const parsed = Number.parseInt(normalizedValue, 10)
	if (parsed < min || parsed > max) return null
	return parsed
}
