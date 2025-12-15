import fs from 'fs'
import path from 'path'

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  categories?: string[]
  tags?: string[]
  topics?: string[]
  readTime?: string
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let frontMatterLines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
    const trimmedKey = key.trim()
    
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayValue = value.slice(1, -1)
        .split(',')
        .map(item => item.trim().replace(/['"]/g, ''))
        .filter(Boolean)
      if (trimmedKey === 'categories') {
        metadata.categories = arrayValue
      } else if (trimmedKey === 'tags') {
        metadata.tags = arrayValue
      } else if (trimmedKey === 'topics') {
        metadata.topics = arrayValue
      }
    } else {
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
      }
    }
  })

  return { metadata: metadata as Metadata, content }
}

function getMDXFiles(dir) {
  const files: string[] = []

  function scanDirectory(currentDir: string) {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        scanDirectory(fullPath)
      } else if (path.extname(item) === '.mdx') {
        const relativePath = path.relative(dir, fullPath)
        files.push(relativePath)
      }
    }
  }

  scanDirectory(dir)
  return files
}

function readMDXFile(filePath) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function getMDXData(dir) {
  let mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    try {
      let { metadata, content } = readMDXFile(path.join(dir, file))
      let slug = file.replace(/\.mdx$/, '')

      return {
        metadata,
        slug,
        content,
      }
    } catch (error) {
      console.error(`Error parsing MDX file ${file}:`, error)
      return {
        metadata: { title: 'Error', publishedAt: '', summary: 'Error parsing file' },
        slug: file.replace(/\.mdx$/, ''),
        content: '',
      }
    }
  })
}

export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), 'src', 'app', 'blog', 'posts')).filter(
    post => post && post.slug && post.metadata && post.metadata.title
  )
}

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  let daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}

export function getAllCategories() {
  const posts = getBlogPosts()
  const categoryMap = new Map<string, number>()
  
  posts.forEach(post => {
    const allTags = [
      ...(post.metadata.categories || []),
      ...(post.metadata.tags || []),
      ...(post.metadata.topics || [])
    ]
    
    allTags.forEach(tag => {
      categoryMap.set(tag, (categoryMap.get(tag) || 0) + 1)
    })
  })
  
  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function getBlogPostsByCategory(category: string) {
  const posts = getBlogPosts()
  return posts.filter(post => 
    [
      ...(post.metadata.categories || []),
      ...(post.metadata.tags || []),
      ...(post.metadata.topics || [])
    ].some(
      cat => cat.toLowerCase() === category.toLowerCase()
    )
  )
}

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min`
}
