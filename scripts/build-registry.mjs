import { execFileSync } from 'node:child_process'
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const outDir = join(root, 'public/r')
const formatConfig = join(root, 'scripts/registry/.oxfmtrc.json')
const registryUrl = (
	process.env.REGISTRY_URL ?? 'https://www.remcostoeten.nl/r'
).replace(/\/$/, '')
const iconsDir = 'src/components/animated-icons'
const iconBase = 'animated-icon-base'

function iconFile(component) {
	return component
		.replace(/^Animated|Icon$/g, '')
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.toLowerCase()
}

function iconSummaries() {
	const source = readFileSync(
		join(root, 'src/components/packages/animated-icons/entries.tsx'),
		'utf8'
	)
	// Matches an entry's name, summary and component fields in declaration order.
	const pattern =
		/name: '([^']+)',\s*summary: '([^']+)',[^}]*?component: '(\w+)'/g
	return new Map(
		[...source.matchAll(pattern)].map(([, name, summary, component]) => [
			iconFile(component),
			{ name, summary }
		])
	)
}

function iconItems() {
	const summaries = iconSummaries()
	return readdirSync(join(root, iconsDir, 'icons'))
		.filter(name => name.endsWith('.tsx'))
		.map(name => basename(name, '.tsx'))
		.sort()
		.map(id => {
			const entry = summaries.get(id)
			if (entry === undefined)
				throw new Error(`No showcase entry for icon "${id}"`)
			return {
				name: `animated-icon-${id}`,
				title: `${entry.name} Icon`,
				description: `Animated ${entry.name.toLowerCase()} icon. ${entry.summary}.`,
				dir: iconsDir,
				files: [`icons/${id}.tsx`, `icons/${id}.css`],
				registryDependencies: [iconBase]
			}
		})
}

function registryItems() {
	const icons = iconItems()
	return [
		{
			name: 'empty-state',
			title: 'Empty State',
			description:
				'One React EmptyState component with illustrations, actions, guides, entrance and loop motion, and pointer tilt or parallax. Styled with Tailwind v4.',
			dir: 'src/components/empty-state',
			files: ['empty-state.tsx', 'illustrations.tsx']
		},
		{
			name: iconBase,
			title: 'Animated Icon Base',
			description:
				'The frame, shared keyframes, hover wiring and playIcon() that every animated icon builds on. Installed with any icon.',
			dir: iconsDir,
			files: ['icon-frame.tsx', 'animated-icons.css']
		},
		...icons,
		{
			name: 'animated-icons',
			title: 'Animated Icons',
			description:
				'Every animated icon at once: React stroke icons whose parts animate with CSS keyframes on hover, focus, a loop or a playIcon() call. No runtime dependencies.',
			dir: iconsDir,
			files: [],
			registryDependencies: icons.map(icon => icon.name)
		}
	]
}

function fileType(name) {
	return name.endsWith('.css') ? 'registry:file' : 'registry:component'
}

function formatted(item, scratch) {
	if (item.files.length === 0) return []
	const itemDir = join(scratch, item.name)
	const copies = item.files.map(name => join(itemDir, name))
	item.files.forEach((name, index) => {
		mkdirSync(dirname(copies[index]), { recursive: true })
		copyFileSync(join(root, item.dir, name), copies[index])
	})
	execFileSync('npx', ['oxfmt', '-c', formatConfig, ...copies], {
		stdio: 'inherit'
	})
	return item.files.map((name, index) => ({
		name,
		content: readFileSync(copies[index], 'utf8')
	}))
}

function registryFile(item, name, content) {
	return {
		path: `registry/${item.name}/${name}`,
		type: fileType(name),
		target: `@components/${basename(item.dir)}/${name}`,
		...(content === undefined ? {} : { content })
	}
}

function itemFields(item) {
	return {
		name: item.name,
		type: 'registry:component',
		title: item.title,
		description: item.description,
		...(item.registryDependencies === undefined
			? {}
			: {
					registryDependencies: item.registryDependencies.map(
						name => `${registryUrl}/${name}.json`
					)
				})
	}
}

function build() {
	const items = registryItems()
	const scratch = mkdtempSync(join(tmpdir(), 'registry-'))
	try {
		for (const item of items) {
			const files = formatted(item, scratch).map(file =>
				registryFile(item, file.name, file.content)
			)
			const json = {
				$schema: 'https://ui.shadcn.com/schema/registry-item.json',
				...itemFields(item),
				files
			}
			writeFileSync(
				join(outDir, `${item.name}.json`),
				`${JSON.stringify(json, null, 2)}\n`
			)
		}
		console.log(`wrote ${items.length} items to public/r`)
		const index = {
			$schema: 'https://ui.shadcn.com/schema/registry.json',
			name: 'remcostoeten',
			homepage: 'https://www.remcostoeten.nl',
			items: items.map(item => ({
				...itemFields(item),
				files: item.files.map(name => registryFile(item, name))
			}))
		}
		writeFileSync(
			join(outDir, 'registry.json'),
			`${JSON.stringify(index, null, 2)}\n`
		)
		console.log('wrote public/r/registry.json')
	} finally {
		rmSync(scratch, { recursive: true, force: true })
	}
}

build()
