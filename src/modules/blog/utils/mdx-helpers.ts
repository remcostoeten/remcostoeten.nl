import fs from 'fs'
import path from 'path'
import type { BlogPost, BlogPostMetadata } from '../types'

/**
 * @name parseFrontmatter
 * @description Parses YAML frontmatter from MDX file content. Extracts metadata and content from markdown files with frontmatter delimiters.
 */
export function parseFrontmatter(fileContent: string) {
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

/**
 * @name getMDXFiles
 * @description Retrieves all .mdx files from a directory. Filters the directory contents for files with the .mdx extension.
 */
export function getMDXFiles(dir: string) {
    return fs.readdirSync(dir).filter(file => path.extname(file) === '.mdx')
}

/**
 * @name readMDXFile
 * @description Reads and parses a single MDX file from the filesystem. Synchronously reads the file and extracts frontmatter and content.
 */
export function readMDXFile(filePath: string) {
    let rawContent = fs.readFileSync(filePath, 'utf-8')
    return parseFrontmatter(rawContent)
}

/**
 * @name getMDXData
 * @description Processes all MDX files in a directory and returns structured blog post data. Reads all .mdx files, parses frontmatter, and creates BlogPost objects.
 */
export function getMDXData(dir: string): BlogPost[] {
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

