import fs from 'fs'
import path from 'path'
import { parseFrontmatter } from './frontmatter'
import { calculateReadTime } from './read-time'
import type { BlogPost, BlogPostMetadata } from './types'

const BLOG_POSTS_DIR = path.join(
	process.cwd(),
	'src',
	'app',
	'(marketing)',
	'blog',
	'posts'
)

function getMarkdownFiles(dir: string) {
	const files: string[] = []

	function scanDirectory(currentDir: string) {
		const items = fs.readdirSync(currentDir)

		for (const item of items) {
			const fullPath = path.join(currentDir, item)
			const stat = fs.statSync(fullPath)

			if (stat.isDirectory()) {
				scanDirectory(fullPath)
			} else if (path.extname(item) === '.mdx' || path.extname(item) === '.md') {
				files.push(path.relative(dir, fullPath))
			}
		}
	}

	scanDirectory(dir)

	return files
}

function readMarkdownFile(filePath: string) {
	const rawContent = fs.readFileSync(filePath, 'utf-8')
	return parseFrontmatter(rawContent)
}

function getBlogPostData(dir: string): BlogPost[] {
	return getMarkdownFiles(dir).map(file => {
		try {
			const { metadata, content } = readMarkdownFile(path.join(dir, file))
			const isInDraftDirectory = file
				.split(path.sep)
				.some(segment => segment.toLowerCase() === 'drafts')
			const slug = metadata.slug || file.replace(/\.(mdx|md)$/, '')

			return {
				slug,
				content,
				metadata: {
					...metadata,
					draft: metadata.draft === true || isInDraftDirectory,
					readTime: metadata.readTime || calculateReadTime(content)
				}
			}
		} catch (error) {
			console.error(`Error parsing MDX file ${file}:`, error)

			return {
				metadata: {
					title: 'Error',
					publishedAt: '',
					summary: 'Error parsing file',
					readTime: '0 min'
				} as BlogPostMetadata,
				slug: file.replace(/\.(mdx|md)$/, ''),
				content: ''
			}
		}
	})
}

export function getAllBlogPosts() {
	const posts = getBlogPostData(BLOG_POSTS_DIR).filter(
		post => post && post.slug && post.metadata && post.metadata.title
	)

	return Array.from(new Map(posts.map(post => [post.slug, post])).values())
}

export function getBlogPosts() {
	return getAllBlogPosts().filter(post => !post.metadata.draft)
}

export function getAllTags() {
	const posts = getBlogPosts()
	const tagMap = new Map<string, number>()

	posts.forEach(post => {
		const tags = post.metadata.tags || []
		tags.forEach(tag => {
			tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
		})
	})

	return Array.from(tagMap.entries())
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count)
}

export function getBlogPostsByTag(tag: string) {
	return getBlogPosts().filter(post =>
		(post.metadata.tags || []).some(
			postTag => postTag.toLowerCase() === tag.toLowerCase()
		)
	)
}
