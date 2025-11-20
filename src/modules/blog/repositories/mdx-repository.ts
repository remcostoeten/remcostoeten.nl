import fs from 'fs'
import path from 'path'
import type { BlogPost, BlogPostMetadata } from '../types'

function parseFrontmatter(fileContent: string) {
    let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
    let match = frontmatterRegex.exec(fileContent)
    let frontMatterBlock = match![1]
    let content = fileContent.replace(frontmatterRegex, '').trim()
    let frontMatterLines = frontMatterBlock.trim().split('\n')
    let metadata: Partial<BlogPostMetadata> = {}

    frontMatterLines.forEach(line => {
        let [key, ...valueArr] = line.split(': ')
        let value = valueArr.join(': ').trim()
        value = value.replace(/^['"](.*)['"]$/, '$1')
        metadata[key.trim() as keyof BlogPostMetadata] = value
    })

    return { metadata: metadata as BlogPostMetadata, content }
}

function getMDXFiles(dir: string) {
    return fs.readdirSync(dir).filter(file => path.extname(file) === '.mdx')
}

function readMDXFile(filePath: string) {
    let rawContent = fs.readFileSync(filePath, 'utf-8')
    return parseFrontmatter(rawContent)
}

function getMDXData(dir: string): BlogPost[] {
    let mdxFiles = getMDXFiles(dir)
    return mdxFiles.map(file => {
        let { metadata, content } = readMDXFile(path.join(dir, file))
        let slug = path.basename(file, path.extname(file))

        return {
            metadata,
            slug,
            content
        }
    })
}

const BLOG_POSTS_DIR = path.join(process.cwd(), 'src', 'app', 'blog', 'posts')

export function getAllBlogPosts(): BlogPost[] {
    return getMDXData(BLOG_POSTS_DIR)
}
