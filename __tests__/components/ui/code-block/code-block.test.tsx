// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CodeBlock } from '@/components/ui/code-block'

const SAMPLES = [
	['ts', 'const total: number = 1'],
	['typescript', 'const total: number = 1'],
	['tsx', 'const view = <div className="a">hi</div>'],
	['bash', 'echo "hello" && ls -la'],
	['sh', 'echo "hello" && ls -la'],
	['yml', 'name: build\non: push'],
	['md', '# Title\n\n**bold** text'],
	['dockerfile', 'FROM node:24\nRUN npm install'],
	['python', 'def add(a, b):\n    return a + b'],
	['sql', 'SELECT id FROM users WHERE id = 1;']
] as const

describe('CodeBlock syntax highlighting', () => {
	let container: HTMLDivElement
	let root: Root

	beforeEach(() => {
		Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
		container = document.createElement('div')
		document.body.appendChild(container)
		root = createRoot(container)
	})

	afterEach(() => {
		act(() => root.unmount())
		container.remove()
	})

	it.each(SAMPLES)('highlights %s fences', async (language, code) => {
		act(() => {
			root.render(<CodeBlock code={code} language={language} />)
		})

		await vi.waitFor(
			() => {
				expect(container.querySelector('.token')).not.toBeNull()
			},
			{ timeout: 5000 }
		)
	})

	it('renders plain text fences without tokens', async () => {
		act(() => {
			root.render(<CodeBlock code="just words" language="text" />)
		})

		await vi.waitFor(() => {
			expect(container.textContent).toContain('just words')
		})
		expect(container.querySelector('.token')).toBeNull()
	})
})
