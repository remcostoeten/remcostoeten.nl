import type { BlogPostMetadata } from './types'

export function parseFrontmatter(fileContent: string) {
	const frontmatterRegex = /---\s*([\s\S]*?)\s*---/
	const match = frontmatterRegex.exec(fileContent)
	const frontMatterBlock = match![1]
	const content = fileContent.replace(frontmatterRegex, '').trim()
	const frontMatterLines = frontMatterBlock.trim().split('\n')
	const metadata: Partial<BlogPostMetadata> = {}

	frontMatterLines.forEach(line => {
		const [key, ...valueArr] = line.split(': ')
		let value = valueArr.join(': ').trim()
		value = value.replace(/^['"](.*)['"]$/, '$1')
		const trimmedKey = key.trim()

		if (value.startsWith('[') && value.endsWith(']')) {
			const arrayValue = value
				.slice(1, -1)
				.split(',')
				.map(item => item.trim().replace(/['"]/g, ''))
				.filter(Boolean)

			if (trimmedKey === 'tags') {
				metadata.tags = arrayValue
			}

			return
		}

		switch (trimmedKey) {
			case 'title':
				metadata.title = value
				break
			case 'publishedAt':
				metadata.publishedAt = value
				break
			case 'summary':
				metadata.summary = value
				break
			case 'image':
				metadata.image = value
				break
			case 'readTime':
				metadata.readTime = value
				break
			case 'topic':
				metadata.topic = value as BlogPostMetadata['topic']
				break
			case 'draft':
				metadata.draft = value.toLowerCase() === 'true'
				break
			case 'slug':
				metadata.slug = value
				break
			case 'updatedAt':
				metadata.updatedAt = value
				break
			case 'canonicalUrl':
				metadata.canonicalUrl = value
				break
			case 'author':
				metadata.author = value
				break
		}
	})

	return { metadata: metadata as BlogPostMetadata, content }
}
