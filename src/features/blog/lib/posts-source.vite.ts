/// <reference types="vite/client" />

const POSTS_ROOT = '/src/app/(marketing)/blog/posts/'

const modules = import.meta.glob<string>(
	'/src/app/\\(marketing\\)/blog/posts/**/*.{md,mdx}',
	{ query: '?raw', import: 'default', eager: true }
)

export function readPostSources() {
	return Object.entries(modules).map(([id, raw]) => ({
		file: id.replace(POSTS_ROOT, ''),
		raw
	}))
}
