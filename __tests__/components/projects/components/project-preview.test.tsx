import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ProjectPreviewRenderer } from '@/components/projects/components/project-preview'

describe('ProjectPreviewRenderer', () => {
	it('does not mount iframe previews before explicit activation', () => {
		const html = renderToStaticMarkup(
			<ProjectPreviewRenderer
				name="Skriuw"
				isVisible
				preview={{
					type: 'iframe',
					url: 'https://skriuw.com',
					embedUrl: 'https://skriuw.com/app'
				}}
			/>
		)

		expect(html).not.toContain('<iframe')
		expect(html).toContain('Load live preview')
	})
})
