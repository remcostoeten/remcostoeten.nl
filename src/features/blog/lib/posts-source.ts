import fs from 'fs'
import path from 'path'

type PostSource = {
	file: string
	raw: string
}

const BLOG_POSTS_DIR = path.join(
	process.cwd(),
	'src',
	'app',
	'(marketing)',
	'blog',
	'posts'
)

function scanDirectory(currentDir: string, files: string[]) {
	for (const item of fs.readdirSync(currentDir)) {
		const fullPath = path.join(currentDir, item)

		if (fs.statSync(fullPath).isDirectory()) {
			scanDirectory(fullPath, files)
		} else if (item.endsWith('.md') || item.endsWith('.mdx')) {
			files.push(path.relative(BLOG_POSTS_DIR, fullPath))
		}
	}
}

export function readPostSources(): PostSource[] {
	const files: string[] = []
	scanDirectory(BLOG_POSTS_DIR, files)

	return files.map(file => ({
		file: file.split(path.sep).join('/'),
		raw: fs.readFileSync(path.join(BLOG_POSTS_DIR, file), 'utf-8')
	}))
}
