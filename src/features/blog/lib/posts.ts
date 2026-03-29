import fs from 'fs'
import path from 'path'
import { parseFrontmatter } from './frontmatter'
import { calculateReadTime } from './read-time'
import { BLOG_TOPICS, type BlogPost, type BlogPostMetadata } from './types'
import { getTopicBySlug, slugifyTopic } from './topic-slug'

const BLOG_POSTS_DIR = path.join(
	process.cwd(),
	'src',
	'app',
	'(marketing)',
	'blog',
	'posts'
)

const GUIDE_TAGS = new Set([
	'guide',
	'tutorial',
	'how-to',
	'oauth',
	'oauth2',
	'frontmatter',
	'seo'
])

function inferBlogTopic(file: string, metadata: Partial<BlogPostMetadata>) {
	if (metadata.topic) {
		const explicitTopic = getTopicBySlug(metadata.topic)
		if (explicitTopic) {
			return explicitTopic
		}
	}

	const normalizedTags = (metadata.tags || []).map(tag => tag.toLowerCase())
	const isPersonalFolder = file
		.split(path.sep)
		.some(segment => segment.toLowerCase() === 'yappin')
	const isGuide = normalizedTags.some(tag => GUIDE_TAGS.has(tag))

	if (isPersonalFolder) {
		return 'Personal'
	}

	if (isGuide) {
		return 'Guides'
	}

	return 'Engineering'
}

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
					topic: inferBlogTopic(file, metadata),
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

// Returns all configured canonical topics, with counts derived from public file posts.
// This is useful for configuration-aware callers such as static params generation.
function getConfiguredTopics() {
	const posts = getBlogPosts()
	const topicMap = new Map<string, number>()

	posts.forEach(post => {
		const topic = post.metadata.topic
		if (!topic) return
		topicMap.set(topic, (topicMap.get(topic) || 0) + 1)
	})

	return BLOG_TOPICS.map(name => ({
		name,
		slug: slugifyTopic(name),
		count: topicMap.get(name) || 0
	})).filter(topic => topic.count > 0)
}

export const getAllTopics = getConfiguredTopics
