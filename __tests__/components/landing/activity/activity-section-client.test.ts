import { describe, expect, it } from 'vitest'
import { shouldLoadActivitySection } from '@/components/landing/activity/activity-section-client'

describe('shouldLoadActivitySection', () => {
	it('loads activity only when the section intersects the viewport', () => {
		expect(shouldLoadActivitySection({ isIntersecting: false })).toBe(false)
		expect(shouldLoadActivitySection({ isIntersecting: true })).toBe(true)
	})
})
