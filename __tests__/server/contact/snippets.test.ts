import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	REPLY_MAX_LENGTH,
	SIGNATURE_MAX_LENGTH,
	SNIPPET_TITLE_MAX_LENGTH,
	TEMPLATE_LIMIT
} from '@/shared/lib/contact-reply'

const SNIPPETS = { signature: null, templates: [] }

const mocks = vi.hoisted(() => {
	const calls: { op: string; args: unknown[] }[] = []
	const state = { templateCount: 0, failWrites: false }

	function chain(op: string) {
		const target: Record<string, unknown> = {}
		const proxy: unknown = new Proxy(target, {
			get: (_, key) => {
				if (key === 'then') {
					return (
						resolve: (value: unknown) => void,
						reject: (reason: unknown) => void
					) => {
						if (state.failWrites && op !== 'select') {
							reject(new Error('db down'))
							return
						}
						resolve(
							op === 'select'
								? [{ total: state.templateCount }]
								: []
						)
					}
				}
				return (...args: unknown[]) => {
					calls.push({ op: `${op}.${String(key)}`, args })
					return proxy
				}
			}
		})
		return proxy
	}

	return {
		calls,
		state,
		isAdmin: vi.fn(),
		revalidatePath: vi.fn(),
		getReplySnippets: vi.fn(),
		db: {
			select: () => chain('select'),
			insert: () => chain('insert'),
			update: () => chain('update'),
			delete: () => chain('delete'),
			batch: vi.fn(async (statements: unknown[]) => {
				calls.push({ op: 'batch', args: statements })
				return []
			})
		}
	}
})

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/server/db/connection', () => ({ db: mocks.db }))
vi.mock('@/utils/is-admin', () => ({ isAdmin: mocks.isAdmin }))
vi.mock('@/server/queries/reply-snippets', () => ({
	getReplySnippets: mocks.getReplySnippets
}))

import {
	deleteTemplate,
	saveSignature,
	saveTemplate
} from '@/server/actions/contact/snippets'

function ops() {
	return mocks.calls.map(call => call.op)
}

function valuesOf(op: string) {
	return mocks.calls.find(call => call.op === op)?.args[0]
}

describe('reply snippet actions', () => {
	beforeEach(() => {
		mocks.calls.length = 0
		mocks.state.templateCount = 0
		mocks.state.failWrites = false
		mocks.db.batch.mockClear()
		mocks.isAdmin.mockReset().mockResolvedValue(true)
		mocks.revalidatePath.mockReset()
		mocks.getReplySnippets.mockReset().mockResolvedValue(SNIPPETS)
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	it('rejects every action for a non admin without touching the database', async () => {
		mocks.isAdmin.mockResolvedValue(false)

		const results = await Promise.all([
			saveSignature('Remco'),
			saveTemplate({ id: null, title: 'Hi', body: 'Hello' }),
			deleteTemplate('t1')
		])

		for (const result of results) {
			expect(result).toEqual({ success: false, error: 'Unauthorized' })
		}
		expect(mocks.calls).toHaveLength(0)
		expect(mocks.revalidatePath).not.toHaveBeenCalled()
	})

	describe('saveSignature', () => {
		it('replaces the signature atomically with the trimmed value', async () => {
			const result = await saveSignature('  Remco  ')

			expect(result).toEqual({ success: true, snippets: SNIPPETS })
			expect(mocks.db.batch).toHaveBeenCalledTimes(1)
			expect(valuesOf('insert.values')).toEqual({
				kind: 'signature',
				body: 'Remco'
			})
			expect(mocks.revalidatePath).toHaveBeenCalledWith(
				'/admin',
				'layout'
			)
		})

		it('removes the signature when the value is blank', async () => {
			const result = await saveSignature('   ')

			expect(result.success).toBe(true)
			expect(mocks.db.batch).not.toHaveBeenCalled()
			expect(ops()).toContain('delete.where')
			expect(ops()).not.toContain('insert.values')
		})

		it('rejects a signature over the limit', async () => {
			const result = await saveSignature(
				'x'.repeat(SIGNATURE_MAX_LENGTH + 1)
			)

			expect(result).toEqual({
				success: false,
				error: `The signature is limited to ${SIGNATURE_MAX_LENGTH} characters`
			})
			expect(mocks.calls).toHaveLength(0)
		})

		it('accepts a signature at the limit', async () => {
			expect(
				(await saveSignature('x'.repeat(SIGNATURE_MAX_LENGTH))).success
			).toBe(true)
		})

		it('hides database details when saving fails', async () => {
			mocks.state.failWrites = true
			mocks.db.batch.mockRejectedValueOnce(new Error('db down'))

			expect(await saveSignature('Remco')).toEqual({
				success: false,
				error: 'Could not save. Try again.'
			})
		})
	})

	describe('saveTemplate', () => {
		it('creates a trimmed template below the limit', async () => {
			mocks.state.templateCount = TEMPLATE_LIMIT - 1

			const result = await saveTemplate({
				id: null,
				title: '  Thanks ',
				body: ' Hi {name} '
			})

			expect(result.success).toBe(true)
			expect(valuesOf('insert.values')).toEqual({
				kind: 'template',
				title: 'Thanks',
				body: 'Hi {name}'
			})
		})

		it('refuses a new template at the limit', async () => {
			mocks.state.templateCount = TEMPLATE_LIMIT

			expect(
				await saveTemplate({ id: null, title: 'Hi', body: 'Hello' })
			).toEqual({
				success: false,
				error: `You can keep up to ${TEMPLATE_LIMIT} templates`
			})
			expect(ops()).not.toContain('insert.values')
		})

		it('updates an existing template without checking the limit', async () => {
			mocks.state.templateCount = TEMPLATE_LIMIT

			const result = await saveTemplate({
				id: 't1',
				title: 'New',
				body: 'Text'
			})

			expect(result.success).toBe(true)
			expect(valuesOf('update.set')).toEqual({
				title: 'New',
				body: 'Text'
			})
			expect(ops()).not.toContain('select.from')
			expect(ops()).not.toContain('insert.values')
		})

		it.each([
			[
				{ id: null, title: '  ', body: 'Text' },
				'Give the template a title'
			],
			[
				{ id: null, title: 'Title', body: '  ' },
				'Write the template text'
			]
		])('returns the validation message for %j', async (input, error) => {
			expect(await saveTemplate(input)).toEqual({
				success: false,
				error
			})
			expect(mocks.calls).toHaveLength(0)
		})

		it('rejects an overlong title or body', async () => {
			expect(
				(
					await saveTemplate({
						id: null,
						title: 'x'.repeat(SNIPPET_TITLE_MAX_LENGTH + 1),
						body: 'Text'
					})
				).success
			).toBe(false)
			expect(
				(
					await saveTemplate({
						id: null,
						title: 'Title',
						body: 'x'.repeat(REPLY_MAX_LENGTH + 1)
					})
				).success
			).toBe(false)
			expect(mocks.calls).toHaveLength(0)
		})

		it('hides database details when saving fails', async () => {
			mocks.state.failWrites = true

			expect(
				await saveTemplate({ id: 't1', title: 'A', body: 'B' })
			).toEqual({ success: false, error: 'Could not save. Try again.' })
		})
	})

	describe('deleteTemplate', () => {
		it('deletes and returns the refreshed snippets', async () => {
			const result = await deleteTemplate('t1')

			expect(result).toEqual({ success: true, snippets: SNIPPETS })
			expect(ops()).toContain('delete.where')
			expect(mocks.revalidatePath).toHaveBeenCalledWith(
				'/admin',
				'layout'
			)
		})

		it('hides database details when deleting fails', async () => {
			mocks.state.failWrites = true

			expect(await deleteTemplate('t1')).toEqual({
				success: false,
				error: 'Could not save. Try again.'
			})
		})
	})
})
