import type {
	EmptyStateEntrance,
	EmptyStateLoop,
	EmptyStatePointer
} from '@/components/empty-state/empty-state'
import type { DemoEntry, DemoValues } from './entries'

export const entranceOptions = ['off', 'rise', 'fade', 'blur'] as const
export const pointerOptions = ['off', 'tilt', 'parallax'] as const
export const loopOptions = ['off', 'float', 'spread', 'pulse'] as const

export function parseEntrance(value: string): EmptyStateEntrance | false {
	return (
		entranceOptions.find(
			(option): option is EmptyStateEntrance =>
				option !== 'off' && option === value
		) ?? false
	)
}

export function parsePointer(value: string): EmptyStatePointer | false {
	return (
		pointerOptions.find(
			(option): option is EmptyStatePointer =>
				option !== 'off' && option === value
		) ?? false
	)
}

export function parseLoop(
	entry: DemoEntry,
	value: string
): EmptyStateLoop | boolean {
	if (entry.loopKind === 'toggle') return value === 'on'
	return (
		loopOptions.find(
			(option): option is EmptyStateLoop =>
				option !== 'off' && option === value
		) ?? false
	)
}

export function actionLabel(values: DemoValues, index: number) {
	return index === 0 ? values.primaryLabel : values.secondaryLabel
}

/**
 * @name buildUsage
 * @description Builds the JSX snippet for an empty state entry from the
 * values set in the playground, leaving out props that match their defaults.
 *
 * @example
 * const code = buildUsage(entry, entry.defaults)
 */
export function buildUsage(entry: DemoEntry, values: DemoValues) {
	const lines = [
		'<EmptyState',
		`  title={${JSON.stringify(values.title)}}`,
		`  description={${JSON.stringify(values.description)}}`,
		`  illustration={${entry.illustrationCode(values.variant)}}`
	]
	if (entry.size) lines.push(`  size="${entry.size}"`)
	if (parseEntrance(values.animated))
		lines.push(`  animated="${values.animated}"`)
	if (parsePointer(values.pointer))
		lines.push(`  pointer="${values.pointer}"`)
	const loop = parseLoop(entry, values.loop)
	if (loop === true) lines.push('  loop')
	else if (loop) lines.push(`  loop="${loop}"`)

	if (values.showActions) {
		const actions = entry.actions.map((action, index) => {
			const variant = action.variant
				? `, variant: "${action.variant}"`
				: ''
			return `{ id: "${action.id}", label: ${JSON.stringify(actionLabel(values, index))}${variant}, onClick: () => ${action.call}() }`
		})
		if (actions.length === 1) lines.push(`  actions={[${actions[0]}]}`)
		else
			lines.push(
				'  actions={[',
				...actions.map(action => `    ${action},`),
				'  ]}'
			)
	}

	if (entry.guides && values.showGuides) {
		lines.push(
			`  guidesTitle="${entry.guides.title}"`,
			'  guides={[',
			...entry.guides.items.map(
				guide =>
					`    { id: "${guide.id}", label: "${guide.label}", href: "${guide.href}" },`
			),
			'  ]}'
		)
	}

	if (entry.link && values.showLink) {
		lines.push(
			'  link={{',
			`    label: <>Learn more about <strong>${values.linkTopic}</strong></>,`,
			`    href: "${entry.link.href}",`,
			'  }}'
		)
	}

	lines.push('/>')
	return lines.join('\n')
}
